/**
 * The embedding slides — how many numbers a token carries, and in what sense
 * those numbers mean anything.
 *
 * WHY THIS IS BUILT THE WAY IT IS
 *
 * The intuitive guess is that each dimension holds a concept: dimension 400 is
 * "redness", dimension 900 is "is-a-company". That is not how it works, and the
 * truth is a better slide.
 *
 * Concepts live as *directions* — particular blends across thousands of
 * dimensions at once. A model can therefore carry far more concepts than it has
 * dimensions, because in high-dimensional space you can pack a huge number of
 * directions that are all nearly perpendicular to each other. That packing is
 * called superposition, and it's the reason you can't open a model up and read
 * off what it knows.
 *
 * So the maths here is real and it demonstrates exactly that:
 *   - concept directions are random unit vectors in 4096 dimensions
 *   - `apple` is built as a weighted blend of several of them, plus noise
 *   - the meters read the weights back out by projecting onto each direction
 *
 * The recovery works — and it works *because* random directions in 4096-d are
 * nearly orthogonal (typical overlap ~1/sqrt(4096), about 0.016). Which is the
 * point being taught, running live rather than asserted.
 */
(function (global) {
  "use strict";

  var DIMS = 4096;
  var SIDE = 64;               // 64 x 64 = 4096, so the grid is the whole vector

  /* Fixed seed: the numbers on screen are the same every rehearsal and every
     time you present. Nothing here should surprise you on stage. */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gaussians(n, seed) {
    var r = rng(seed);
    var out = new Float64Array(n);
    for (var i = 0; i < n; i += 2) {
      var u = Math.max(r(), 1e-9), v = r();
      var mag = Math.sqrt(-2 * Math.log(u));
      out[i] = mag * Math.cos(2 * Math.PI * v);
      if (i + 1 < n) out[i + 1] = mag * Math.sin(2 * Math.PI * v);
    }
    return out;
  }

  function unit(v) {
    var s = 0, i;
    for (i = 0; i < v.length; i++) s += v[i] * v[i];
    s = Math.sqrt(s) || 1;
    var out = new Float64Array(v.length);
    for (i = 0; i < v.length; i++) out[i] = v[i] / s;
    return out;
  }

  function dot(a, b) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }

  /* The concepts we'll claim to find in `apple`, and how strongly.
     `apple` deliberately carries food and company at almost equal strength —
     that single fact is the argument of the whole first act. */
  var CONCEPTS = [
    { key: "food",    label: "food, eating",        weight: 0.82, seed: 11 },
    { key: "company", label: "companies, business", weight: 0.78, seed: 22 },
    { key: "tree",    label: "trees, growing",      weight: 0.55, seed: 33 },
    { key: "red",     label: "colour, red",         weight: 0.47, seed: 44 },
    { key: "sweet",   label: "sweet, flavour",      weight: 0.44, seed: 55 },
    { key: "device",  label: "screens, devices",    weight: 0.29, seed: 66 },
    /* Deliberately zero. A concept the word doesn't carry has to read as flat,
       or the meters aren't measuring anything and the slide is a lie. */
    { key: "law",     label: "law, courts",         weight: 0.00, seed: 88 }
  ];

  // Built once and shared by both slides.
  var MODEL = (function () {
    var dirs = {};
    CONCEPTS.forEach(function (c) {
      dirs[c.key] = unit(gaussians(DIMS, c.seed));
    });

    var vec = new Float64Array(DIMS);
    CONCEPTS.forEach(function (c) {
      var d = dirs[c.key];
      for (var i = 0; i < DIMS; i++) vec[i] += c.weight * d[i];
    });

    /* Everything else the word carries that we haven't named. Normalised to a
       unit vector before scaling: a raw 4096-d gaussian has a norm around 64,
       which would bury a signal built from unit-length directions completely. */
    var noise = unit(gaussians(DIMS, 777));
    for (var i = 0; i < DIMS; i++) vec[i] += noise[i] * 0.5;

    var v = unit(vec);

    // Read the weights back out. This is the demonstration, not a lookup.
    var scores = {};
    CONCEPTS.forEach(function (c) { scores[c.key] = dot(v, dirs[c.key]); });

    var top = Math.max.apply(null, CONCEPTS.map(function (c) { return scores[c.key]; }));

    return { vec: v, dirs: dirs, scores: scores, top: top };
  })();

  /** Paints the 4096-value vector as a 64x64 field. */
  function paintGrid(ctx, cell, highlight) {
    var v = MODEL.vec;
    var max = 0, i;
    for (i = 0; i < DIMS; i++) max = Math.max(max, Math.abs(v[i]));

    /* Every cell below is drawn with a semi-transparent fill, and canvas fills
       composite over whatever is already there. Without wiping first, each
       repaint layers onto the last one and the grid creeps darker and muddier
       with every click. */
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#0a0d14";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (i = 0; i < DIMS; i++) {
      var x = (i % SIDE) * cell;
      var y = Math.floor(i / SIDE) * cell;
      var t = Math.abs(v[i]) / max;

      if (highlight) {
        // How much this one dimension contributes to the chosen concept.
        var share = Math.abs(v[i] * MODEL.dirs[highlight][i]);
        var lit = Math.min(1, share / (2.2 / DIMS));
        ctx.fillStyle = lit > 0.35
          ? "rgba(233,163,60," + (0.25 + lit * 0.75).toFixed(3) + ")"
          : "rgba(70,80,100," + (0.15 + t * 0.3).toFixed(3) + ")";
      } else {
        var neg = v[i] < 0;
        ctx.fillStyle = neg
          ? "rgba(110,141,224," + (0.12 + t * 0.85).toFixed(3) + ")"
          : "rgba(233,163,60," + (0.12 + t * 0.85).toFixed(3) + ")";
      }
      ctx.fillRect(x, y, cell - 0.5, cell - 0.5);
    }
  }

  /* ---- Slide 08: how many numbers ---------------------------------------- */

  global.registerVectorSize = function (widgets, slideId, hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;

    /* The stored vector has norm 1, so spread over 4,096 dimensions every
       component is around 0.016 and the strip would read "0.01, -0.00, 0.01".
       Scaling the *display* by sqrt(dims) shows the same vector at unit
       variance, which is how these numbers are normally quoted. Nothing that
       computes anything uses this scaling. */
    var show = Math.sqrt(DIMS);
    var cells = Array.prototype.map.call(MODEL.vec.slice(0, 11), function (n, i) {
      var d = n * show;
      return '<span class="tok" style="font-size:15px;padding:6px 7px;min-width:58px;text-align:center">' +
        (d >= 0 ? "&nbsp;" : "") + d.toFixed(2) +
        '<span class="id">dim ' + (i + 1) + "</span></span>";
    }).join("");

    host.innerHTML =
      '<div style="display:flex;gap:26px;align-items:flex-start">' +

        // The token itself, anchored as the first cell of the row.
        '<div style="flex:none;text-align:center">' +
          '<div style="font-family:var(--mono);font-size:26px;color:var(--amber);' +
            'background:var(--amber-soft);border:1px solid var(--amber-line);' +
            'border-bottom-width:3px;padding:16px 18px 14px">apple' +
            '<span style="display:block;font-size:12px;color:var(--muted);margin-top:6px">17180</span>' +
          "</div>" +
          '<div class="tiny" style="margin-top:9px">one token</div>' +
        "</div>" +

        '<div style="font-size:30px;color:var(--faint);padding-top:26px">&rarr;</div>' +

        '<div style="flex:1;display:flex;flex-direction:column;gap:16px">' +
          '<div class="tok-row" style="gap:5px" data-step="1">' + cells +
            '<span class="tok" style="font-size:15px;padding:6px 9px;color:var(--faint)">&hellip;' +
            '<span class="id">+4,085</span></span>' +
          "</div>" +
          '<div data-step="2" style="display:flex;gap:20px;align-items:center">' +
            '<canvas id="vs-grid" width="' + SIDE * 5 + '" height="' + SIDE * 5 + '" ' +
              'style="border:1px solid var(--line)"></canvas>' +
            '<div style="display:flex;flex-direction:column;gap:10px">' +
              '<div style="font-family:var(--serif);font-size:44px;line-height:1;color:var(--amber)">4,096</div>' +
              '<p class="small" style="max-width:26ch;margin:0">numbers, for that one word. Every square is one of them.</p>' +
              '<p class="tiny" style="max-width:30ch">Larger models carry 12,288 or more per token &mdash; and every token in your prompt gets its own set.</p>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>";

    var painted = false;

    widgets[slideId] = {
      onStep: function (step) {
        if (step >= 2 && !painted) {
          var cv = host.querySelector("#vs-grid");
          paintGrid(cv.getContext("2d"), 5, null);
          painted = true;
        }
      },
      onLeave: function () { painted = false; }
    };
  };

  /* ---- Slide 09: what the numbers mean ----------------------------------- */

  global.registerMeaning = function (widgets, slideId, hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;

    var active = null;

    host.innerHTML =
      '<div style="display:flex;gap:30px;align-items:flex-start">' +
        '<div style="flex:none">' +
          '<canvas id="mn-grid" width="' + SIDE * 4 + '" height="' + SIDE * 4 + '" ' +
            'style="border:1px solid var(--line)"></canvas>' +
          '<div class="tiny" id="mn-cap" style="margin-top:9px;max-width:' + SIDE * 4 + 'px"></div>' +
        "</div>" +
        '<div style="flex:1;display:flex;flex-direction:column;gap:12px" data-step="2">' +
          '<div class="eyebrow" style="margin-bottom:2px"><span class="tick"></span>' +
            "directions we can name &middot; click one</div>" +
          '<div id="mn-meters" style="display:flex;flex-direction:column;gap:7px"></div>' +
        "</div>" +
      "</div>";

    var cv = host.querySelector("#mn-grid");
    var ctx = cv.getContext("2d");
    var cap = host.querySelector("#mn-cap");
    var meters = host.querySelector("#mn-meters");

    function draw() {
      paintGrid(ctx, 4, active);
      cap.innerHTML = active
        ? 'the dimensions carrying <span class="amber">' +
          CONCEPTS.filter(function (c) { return c.key === active; })[0].label +
          "</span> &mdash; scattered across the whole vector, not gathered anywhere"
        : "all 4,096 dimensions of <span class=\"mono\">apple</span>";
    }

    CONCEPTS.forEach(function (c) {
      // Clamped: a concept the word doesn't carry recovers slightly negative,
      // which is the correct answer but not a drawable bar width.
      var score = Math.max(0, MODEL.scores[c.key] / MODEL.top);
      var row = document.createElement("button");
      row.className = "concept-row";
      row.setAttribute("data-interactive", "");
      row.innerHTML =
        '<span class="mono" style="font-size:15px;text-align:left">' + c.label + "</span>" +
        '<span style="height:11px;background:#1a222e;display:block;position:relative">' +
          '<span style="position:absolute;inset:0 auto 0 0;width:' + (score * 100).toFixed(1) +
          '%;background:var(--amber)"></span></span>';
      row.addEventListener("click", function () {
        active = active === c.key ? null : c.key;
        Array.prototype.forEach.call(meters.children, function (n) { n.classList.remove("on"); });
        if (active) row.classList.add("on");
        draw();
      });
      meters.appendChild(row);
    });

    widgets[slideId] = {
      onEnter: function () {
        active = null;
        Array.prototype.forEach.call(meters.children, function (n) { n.classList.remove("on"); });
        draw();
      }
    };
  };

  /* ---- Slide 17: what the stack is actually for --------------------------
     The diagram alone doesn't land — "residual stream" is jargon and the
     loop-back arrows read as decoration. So the slide leads with the *content*
     of the notes instead: what the token means after each block has had a go.
  */

  var NOTES = [
    { at: "the raw embedding", text: "apple — could be the fruit, could be the company, no way to tell" },
    { at: "after block 1", text: "+ it's the thing that got picked" },
    { at: "after block 2", text: "+ things you pick are physical objects you can hold" },
    { at: "after block 9", text: "+ there's an orchard in this sentence" },
    { at: "after block 24", text: "+ so: the fruit. Not the company." },
    { at: "after block 80", text: "a specific apple, just picked, in a past-tense story someone is telling" }
  ];

  global.registerResidual = function (widgets, slideId, hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;

    host.innerHTML = '<div id="rs-notes" style="display:flex;flex-direction:column;gap:9px"></div>';
    var box = host.querySelector("#rs-notes");

    NOTES.forEach(function (n, i) {
      var row = document.createElement("div");
      row.style.cssText =
        "display:grid;grid-template-columns:132px 1fr;gap:16px;align-items:baseline;" +
        "padding:9px 14px;border-left:2px solid " + (i === 0 ? "var(--line)" : "var(--amber-line)") + ";" +
        "background:" + (i === NOTES.length - 1 ? "var(--amber-soft)" : "transparent") + ";" +
        "opacity:0;transform:translateX(-8px);transition:opacity 340ms var(--ease),transform 340ms var(--ease)";
      row.innerHTML =
        '<span class="mono" style="font-size:13px;color:var(--muted)">' + n.at + "</span>" +
        '<span style="font-size:19px;color:' +
          (i === NOTES.length - 1 ? "var(--text)" : "var(--text-dim)") + '">' + n.text + "</span>";
      box.appendChild(row);
    });

    function show(count) {
      Array.prototype.forEach.call(box.children, function (row, i) {
        var on = i < count;
        row.style.opacity = on ? "1" : "0";
        row.style.transform = on ? "none" : "translateX(-8px)";
      });
    }

    widgets[slideId] = {
      onEnter: function () { show(1); },
      onStep: function (step) { show(Math.max(1, Math.min(NOTES.length, step + 1))); }
    };
  };
})(window);
