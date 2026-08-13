/**
 * GPT-2 byte-level BPE encoder.
 *
 * This is the real algorithm against the real vocab, so token IDs shown on
 * stage match what an actual GPT-2 tokenizer produces. Modern models use
 * larger vocabs, but the mechanism — and every point the talk makes about it —
 * is identical.
 *
 * Depends on window.BPE_VOCAB / window.BPE_MERGES from data/bpe.js.
 * Classic script, no modules: the deck runs from file://.
 */
(function (global) {
  "use strict";

  /**
   * GPT-2 maps all 256 byte values onto printable unicode codepoints so that
   * merges never have to deal with control characters or a literal space.
   * A space becomes 'Ġ', which is why " apple" and "apple" are different tokens.
   */
  function bytesToUnicode() {
    const bs = [];
    for (let i = 0x21; i <= 0x7e; i++) bs.push(i);
    for (let i = 0xa1; i <= 0xac; i++) bs.push(i);
    for (let i = 0xae; i <= 0xff; i++) bs.push(i);

    const cs = bs.slice();
    let n = 0;
    for (let b = 0; b < 256; b++) {
      if (!bs.includes(b)) {
        bs.push(b);
        cs.push(0x100 + n);
        n++;
      }
    }

    const byteToChar = new Array(256);
    const charToByte = new Map();
    for (let i = 0; i < bs.length; i++) {
      byteToChar[bs[i]] = String.fromCodePoint(cs[i]);
      charToByte.set(String.fromCodePoint(cs[i]), bs[i]);
    }
    return { byteToChar, charToByte };
  }

  // GPT-2's pre-tokenization split. Note the leading " ?" in the letter and
  // number branches: whitespace attaches to the *front* of the following word.
  const PAT =
    /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;

  function Tokenizer(vocabBlob, mergesBlob) {
    const tokens = vocabBlob.split("\n");
    this.idToToken = tokens;
    this.tokenToId = new Map();
    for (let i = 0; i < tokens.length; i++) this.tokenToId.set(tokens[i], i);

    this.ranks = new Map();
    const merges = mergesBlob.split("\n");
    for (let i = 0; i < merges.length; i++) {
      this.ranks.set(merges[i], i);
    }

    const maps = bytesToUnicode();
    this.byteToChar = maps.byteToChar;
    this.charToByte = maps.charToByte;
    this.cache = new Map();
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder("utf-8", { fatal: false });
  }

  /**
   * The BPE loop itself: repeatedly find the adjacent pair with the best
   * (lowest) merge rank and fuse it, until no pair in the word is mergeable.
   * This is the part worth watching on the tokenizer slide — the vocabulary
   * was *learned* from frequency, so common words survive whole and rare ones
   * shatter into fragments.
   */
  Tokenizer.prototype.bpe = function (word) {
    const cached = this.cache.get(word);
    if (cached) return cached;

    let parts = Array.from(word);
    if (parts.length === 1) {
      this.cache.set(word, parts);
      return parts;
    }

    for (;;) {
      let bestRank = Infinity;
      let bestIndex = -1;

      for (let i = 0; i < parts.length - 1; i++) {
        const rank = this.ranks.get(parts[i] + " " + parts[i + 1]);
        if (rank !== undefined && rank < bestRank) {
          bestRank = rank;
          bestIndex = i;
        }
      }

      if (bestIndex === -1) break;

      parts = parts
        .slice(0, bestIndex)
        .concat(parts[bestIndex] + parts[bestIndex + 1], parts.slice(bestIndex + 2));

      if (parts.length === 1) break;
    }

    this.cache.set(word, parts);
    return parts;
  };

  /**
   * Returns [{ text, id, piece }] where `text` is the human-readable slice
   * (leading space restored) and `piece` is the raw byte-encoded token.
   */
  Tokenizer.prototype.encode = function (text) {
    const out = [];
    const chunks = String(text).match(PAT) || [];

    for (const chunk of chunks) {
      const bytes = this.encoder.encode(chunk);
      let encoded = "";
      for (let i = 0; i < bytes.length; i++) encoded += this.byteToChar[bytes[i]];

      for (const piece of this.bpe(encoded)) {
        const id = this.tokenToId.get(piece);
        out.push({
          piece: piece,
          id: id === undefined ? -1 : id,
          text: this.decodePiece(piece),
        });
      }
    }
    return out;
  };

  Tokenizer.prototype.decodePiece = function (piece) {
    const bytes = [];
    for (const ch of piece) {
      const b = this.charToByte.get(ch);
      if (b !== undefined) bytes.push(b);
    }
    return this.decoder.decode(new Uint8Array(bytes));
  };

  Tokenizer.prototype.count = function (text) {
    return this.encode(text).length;
  };

  global.LLMTalkTokenizer = {
    Tokenizer: Tokenizer,
    // Built lazily so a missing/huge data file can't block first paint.
    get: function () {
      if (!this._instance) {
        if (!global.BPE_VOCAB || !global.BPE_MERGES) return null;
        this._instance = new Tokenizer(global.BPE_VOCAB, global.BPE_MERGES);
      }
      return this._instance;
    },
    _instance: null,
  };
})(typeof window !== "undefined" ? window : globalThis);
