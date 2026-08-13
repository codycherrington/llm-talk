/**
 * The actual attention arithmetic, shared by the attention and embedding-map
 * widgets. This is a genuine softmax(QK^T / sqrt(d))V with causal masking —
 * toy scale (8 hand-authored dimensions instead of thousands of learned ones),
 * but not faked numbers.
 */
(function (global) {
  "use strict";

  var D = global.DeckData.D;
  var EMB = global.DeckData.EMB;

  function dot(a, b) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }

  function norm(a) { return Math.sqrt(dot(a, a)); }

  function tokensOf(sentence) {
    return sentence.split(" ");
  }

  function vectorsOf(tokens) {
    return tokens.map(function (t) {
      var e = EMB[t.toLowerCase()];
      return e ? e.slice() : new Array(D).fill(0);
    });
  }

  /**
   * Attention weights for one query position over everything up to and
   * including itself. The causal mask is not a simplification for the slides —
   * it is how decoder LLMs actually work, and it is the reason the thing has
   * to generate one token at a time.
   */
  function attend(vecs, qi) {
    var q = vecs[qi];
    var scores = [];
    var i;

    for (i = 0; i < vecs.length; i++) {
      scores.push(i <= qi ? dot(q, vecs[i]) / Math.sqrt(D) : null);
    }

    var max = -Infinity;
    for (i = 0; i <= qi; i++) if (scores[i] > max) max = scores[i];

    var exps = [];
    var total = 0;
    for (i = 0; i < vecs.length; i++) {
      var e = scores[i] === null ? 0 : Math.exp(scores[i] - max);
      exps.push(e);
      total += e;
    }

    var weights = exps.map(function (e) { return total > 0 ? e / total : 0; });

    // The weighted sum of values — the token's new, context-aware meaning.
    var out = new Array(D).fill(0);
    for (i = 0; i <= qi; i++) {
      for (var k = 0; k < D; k++) out[k] += weights[i] * vecs[i][k];
    }

    return { weights: weights, scores: scores, out: out, masked: qi };
  }

  /**
   * One transformer block's worth of update to a single position: add the
   * attention output back into the residual stream, then re-normalise.
   *
   * Running this repeatedly is what slide 16 animates. It is also the honest
   * answer to "why are these models so deep?" — one layer nudges the meaning,
   * it takes a stack of them to fully resolve it.
   */
  function refine(vecs, qi) {
    var res = attend(vecs, qi);
    var q = vecs[qi];
    var mag = norm(q);
    var next = q.map(function (x, k) { return x + res.out[k]; });
    var n = norm(next);
    if (n > 0) next = next.map(function (x) { return (x / n) * mag; });

    var copy = vecs.map(function (v, i) { return i === qi ? next : v; });
    return { vecs: copy, weights: res.weights, vector: next };
  }

  /** Where a vector sits on the 2D map: its food/business balance. */
  function biasOf(vec) {
    var food = Math.max(0, vec[0]);
    var biz = Math.max(0, vec[1]);
    return food + biz === 0 ? 0.5 : biz / (food + biz);
  }

  global.Attn = {
    dot: dot,
    norm: norm,
    tokensOf: tokensOf,
    vectorsOf: vectorsOf,
    attend: attend,
    refine: refine,
    biasOf: biasOf
  };
})(window);
