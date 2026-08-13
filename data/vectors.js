/**
 * Hand-authored data for the embedding-space and attention widgets.
 *
 * HONESTY NOTE — this matters, because the whole talk is a claim about how the
 * thing really works:
 *
 *   - The TOKENIZER is real. Real GPT-2 vocab, real merges, real IDs.
 *   - The EMBEDDINGS here are hand-placed, not measured. A true projection of
 *     real 768-dim embeddings down to 2D is an unreadable blob; hand-placing
 *     ~30 words shows the actual structure (clusters, and `apple` stranded
 *     between two of them) far more honestly than a smear would. Every slide
 *     using them is labelled "schematic".
 *   - The ATTENTION ARITHMETIC is real. The widget runs an honest
 *     softmax(QK^T / sqrt(d)) with causal masking over these vectors. Toy
 *     scale — 8 dimensions instead of thousands, hand-set instead of learned —
 *     but not faked numbers. What you see is what that math produces.
 *
 * Loaded as a global: the deck runs from file://, so no modules, no fetch.
 */
(function (global) {
  "use strict";

  /* ---- The map (slides 10 and 16) ---------------------------------------
     Coordinates are percentages of the plot area. Two things are load-bearing:
       1. king/queen/man/woman form a real parallelogram — that vector
          arithmetic is a genuine documented property of word embeddings.
       2. `apple` sits stranded in the empty middle, belonging to neither
          cluster. That is the visual answer to the question the room was
          asked on slide 4, and the setup for the payoff on slide 16.
  */
  var MAP = {
    words: [
      /* Kept clear of the middle: slide 16 parks the `apple` label right here. */
      { w: "pear",      x: 12, y: 58, c: "fruit" },
      { w: "banana",    x: 11, y: 70, c: "fruit" },
      { w: "peach",     x: 23, y: 73, c: "fruit" },
      { w: "orchard",   x: 30, y: 64, c: "fruit" },
      { w: "pie",       x: 16, y: 82, c: "fruit" },
      { w: "ripe",      x: 27, y: 86, c: "fruit" },

      { w: "microsoft", x: 74, y: 20, c: "tech" },
      { w: "google",    x: 84, y: 15, c: "tech" },
      { w: "iphone",    x: 71, y: 31, c: "tech" },
      { w: "keynote",   x: 64, y: 41, c: "tech" },
      { w: "shares",    x: 87, y: 32, c: "tech" },
      { w: "market",    x: 79, y: 48, c: "tech" },

      /* Labelled on the left so the analogy arrows leaving these dots don't
         run straight through their own text. */
      { w: "man",       x: 15, y: 20, c: "royal", side: "left" },
      { w: "woman",     x: 15, y: 33, c: "royal", side: "left" },
      { w: "king",      x: 37, y: 14, c: "royal" },
      { w: "queen",     x: 37, y: 27, c: "royal" }
    ],

    /* The ambiguous one. Slide 16 slides it to `fruitHome` or `techHome`. */
    apple:     { x: 50, y: 50 },
    fruitHome: { x: 24, y: 71 },
    techHome:  { x: 76, y: 30 },

    /* man -> king and woman -> queen: the same offset, drawn twice. */
    analogy: [["man", "king"], ["woman", "queen"]],

    /* x/y is the halo centre; lx/ly is where the caption sits, placed clear of
       every dot rather than at a fixed offset from the centre. */
    clusters: [
      { key: "fruit", label: "food / growing things", x: 21, y: 71, lx: 21, ly: 98 },
      { key: "tech",  label: "companies / markets",   x: 77, y: 29, lx: 77, ly: 4 },
      { key: "royal", label: "people / rank",         x: 26, y: 23, lx: 26, ly: 45 }
    ]
  };

  /* ---- Toy embeddings for the attention widget --------------------------
     Eight interpretable dimensions, which is the whole reason for authoring
     them by hand: in a real model these axes exist but are not human-readable.
     Values are scaled so dot products land in a range where softmax has real
     contrast, the same job the learned scale does in a trained model.

       0 food   1 business   2 agent    3 action
       4 syntax 5 money      6 place    7 quality
  */
  var D = 8;
  var DIM_NAMES = ["food", "business", "agent", "action", "syntax", "money", "place", "quality"];
  var S = 3.2;

  function v(a) { return a.map(function (n) { return n * S; }); }

  var EMB = {
    "the":     v([0.00, 0.00, 0.00, 0.00, 1.00, 0.00, 0.00, 0.00]),
    "so":      v([0.00, 0.00, 0.00, 0.00, 0.95, 0.00, 0.00, 0.00]),
    "was":     v([0.00, 0.00, 0.00, 0.30, 0.80, 0.00, 0.00, 0.00]),
    "i":       v([0.00, 0.00, 0.95, 0.00, 0.20, 0.00, 0.00, 0.00]),
    ",":       v([0.00, 0.00, 0.00, 0.00, 0.85, 0.00, 0.00, 0.00]),
    ".":       v([0.00, 0.00, 0.00, 0.00, 0.85, 0.00, 0.00, 0.00]),

    "orchard": v([0.85, 0.00, 0.00, 0.00, 0.00, 0.00, 0.70, 0.10]),
    "ripe":    v([0.80, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.75]),
    "picked":  v([0.60, 0.00, 0.15, 0.90, 0.00, 0.00, 0.15, 0.00]),

    "market":  v([0.00, 0.85, 0.00, 0.00, 0.00, 0.80, 0.25, 0.00]),
    "hot":     v([0.10, 0.15, 0.00, 0.00, 0.00, 0.30, 0.00, 0.75]),
    "bought":  v([0.10, 0.55, 0.15, 0.90, 0.00, 0.75, 0.00, 0.00]),

    /* Equal mass in `food` and `business`. This single line is the argument of
       the entire first half of the talk: on its own, the vector cannot choose. */
    "apple":   v([0.62, 0.62, 0.00, 0.00, 0.00, 0.25, 0.00, 0.00])
  };

  /* Deliberately parallel: identical except for three words. Same final token
     in both, so nothing but the preceding context can explain the difference. */
  var SENTENCES = {
    fruit: { key: "fruit", label: "orchard", text: "The orchard was ripe , so I picked the apple ." },
    tech:  { key: "tech",  label: "market",  text: "The market was hot , so I bought the apple ." }
  };

  /* ---- Multi-head patterns (slide 17) -----------------------------------
     Schematic, and labelled as such on the slide. The four behaviours shown
     are real, documented head types from interpretability work — a head that
     looks one token back, one that ties verbs to their subject, one that
     anchors on punctuation, one that tracks topic. */
  var HEADS = [
    { name: "head 3.2", role: "looks one token back", kind: "prev" },
    { name: "head 5.7", role: "ties verbs to who did them", kind: "subject" },
    { name: "head 8.1", role: "anchors on punctuation", kind: "delim" },
    { name: "head 11.4", role: "tracks the topic", kind: "topic" }
  ];

  /* ---- Next-token distributions (slide 20) ------------------------------
     Illustrative logits. The temperature arithmetic applied to them in the
     widget is the real softmax; the starting numbers are plausible, not
     measured, and the slide says so. */
  var PREDICTIONS = {
    fruit: {
      prompt: "The orchard was ripe, so I picked the apple and took a",
      options: [
        { t: " bite",   logit: 4.5 },
        { t: " look",   logit: 2.4 },
        { t: " few",    logit: 2.1 },
        { t: " photo",  logit: 1.3 },
        { t: " step",   logit: 0.9 },
        { t: " deep",   logit: 0.4 },
        { t: " seat",   logit: 0.1 }
      ]
    },
    tech: {
      prompt: "The market was hot, so I bought the apple and took a",
      options: [
        { t: " position", logit: 4.2 },
        { t: " stake",    logit: 3.4 },
        { t: " loss",     logit: 2.2 },
        { t: " chance",   logit: 1.6 },
        { t: " look",     logit: 1.2 },
        { t: " profit",   logit: 0.7 },
        { t: " bite",     logit: 0.2 }
      ]
    }
  };

  global.DeckData = {
    MAP: MAP,
    EMB: EMB,
    D: D,
    DIM_NAMES: DIM_NAMES,
    SENTENCES: SENTENCES,
    HEADS: HEADS,
    PREDICTIONS: PREDICTIONS
  };
})(window);
