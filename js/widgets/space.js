/**
 * The embedding map — slide 10 (static, `apple` stranded) and slide 16 (the
 * payoff, where context drags `apple` into a cluster one layer at a time).
 *
 * Positions of the ordinary words are hand-placed and the slide says so. What
 * is NOT hand-placed is `apple`'s path on slide 16: that comes from running
 * the real attention update repeatedly and reading off the food/business
 * balance of the resulting vector. The dot goes where the arithmetic sends it.
 */
(function (global) {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var D = global.DeckData;

  var PLOT = { x: 46, y: 26, w: 528, h: 372 };

  function px(p) { return PLOT.x + (p / 100) * PLOT.w; }
  function py(p) { return PLOT.y + (p / 100) * PLOT.h; }

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    return n;
  }

  var COLOR = { fruit: "#4fb39c", tech: "#6e8de0", royal: "#7f8aa0" };

  /**
   * The `apple` marker, built once and reused by both slides.
   *
   * It gets a solid backing plate behind its label because on slide 16 it
   * deliberately lands *inside* a cluster, right on top of the neighbours it
   * just moved to join. Without the plate the one label the room is actually
   * watching is the one that becomes unreadable.
   */
  function appleMarker() {
    var g = document.createElementNS(NS, "g");
    var halo = el("circle", { r: 17, fill: "#e9a33c", opacity: 0.16 });
    var ring = el("circle", { r: 11, fill: "none", stroke: "#e9a33c", "stroke-width": 1.5, opacity: 0.5 });
    var dot = el("circle", { r: 7, fill: "#e9a33c" });
    var plate = el("rect", { width: 74, height: 25, fill: "#05070c", stroke: "#e9a33c", "stroke-width": 1, opacity: 0.95 });
    var tag = el("text", {
      "text-anchor": "middle", fill: "#e9a33c",
      style: "font-family:var(--mono);font-size:16px;font-weight:500"
    });
    tag.textContent = "apple";

    [halo, ring, dot, plate, tag].forEach(function (n) { g.appendChild(n); });

    g.place = function (x, y) {
      [halo, ring, dot].forEach(function (n) {
        n.setAttribute("cx", px(x));
        n.setAttribute("cy", py(y));
      });
      plate.setAttribute("x", px(x) - 37);
      plate.setAttribute("y", py(y) - 47);
      tag.setAttribute("x", px(x));
      tag.setAttribute("y", py(y) - 29);
    };

    g.animate = function (ms) {
      var t = "cx " + ms + "ms var(--ease), cy " + ms + "ms var(--ease), " +
              "x " + ms + "ms var(--ease), y " + ms + "ms var(--ease)";
      [halo, ring, dot, plate, tag].forEach(function (n) { n.style.transition = t; });
    };

    return g;
  }

  function drawBase(svg) {
    // Faint grid — reads as coordinate space without competing with the dots.
    for (var i = 0; i <= 10; i++) {
      svg.appendChild(el("line", {
        x1: px(i * 10), y1: PLOT.y, x2: px(i * 10), y2: PLOT.y + PLOT.h,
        stroke: "#1a222e", "stroke-width": 1
      }));
      svg.appendChild(el("line", {
        x1: PLOT.x, y1: py(i * 10), x2: PLOT.x + PLOT.w, y2: py(i * 10),
        stroke: "#1a222e", "stroke-width": 1
      }));
    }

    svg.appendChild(el("rect", {
      x: PLOT.x, y: PLOT.y, width: PLOT.w, height: PLOT.h,
      fill: "none", stroke: "#242d3d", "stroke-width": 1
    }));

    // Cluster halos, drawn under everything.
    D.MAP.clusters.forEach(function (c) {
      svg.appendChild(el("ellipse", {
        cx: px(c.x), cy: py(c.y), rx: 92, ry: 74,
        fill: COLOR[c.key], opacity: 0.07
      }));
    });

    // Ordinary words.
    D.MAP.words.forEach(function (w) {
      svg.appendChild(el("circle", {
        cx: px(w.x), cy: py(w.y), r: 4.5,
        fill: COLOR[w.c], opacity: 0.9
      }));
      var left = w.side === "left";
      var label = el("text", {
        x: px(w.x) + (left ? -9 : 9), y: py(w.y) + 5,
        class: "svg-word", "text-anchor": left ? "end" : "start"
      });
      label.textContent = w.w;
      svg.appendChild(label);
    });

    // Cluster captions.
    D.MAP.clusters.forEach(function (c) {
      var t = el("text", {
        x: px(c.lx), y: py(c.ly),
        class: "svg-label", "text-anchor": "middle", fill: COLOR[c.key], opacity: 0.85
      });
      t.textContent = c.label;
      svg.appendChild(t);
    });
  }

  function makeSvg() {
    var svg = el("svg", {
      viewBox: "0 0 620 430", width: "620", height: "430",
      role: "img", "aria-label": "Two-dimensional map of word meanings"
    });
    return svg;
  }

  /* ---- Slide 10: the stranded vector ------------------------------------ */

  global.registerSpaceStatic = function (widgets, slideId, hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;

    var svg = makeSvg();
    drawBase(svg);

    // man -> king, woman -> queen: the same offset drawn twice.
    var arrows = el("g", { opacity: 0 });
    var defs = el("defs");
    var marker = el("marker", {
      id: "arrowhead", markerWidth: "9", markerHeight: "7",
      refX: "8", refY: "3.5", orient: "auto"
    });
    marker.appendChild(el("polygon", { points: "0 0, 9 3.5, 0 7", fill: "#e9a33c" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    var byWord = {};
    D.MAP.words.forEach(function (w) { byWord[w.w] = w; });

    D.MAP.analogy.forEach(function (pair) {
      var a = byWord[pair[0]], b = byWord[pair[1]];
      arrows.appendChild(el("line", {
        x1: px(a.x) + 6, y1: py(a.y), x2: px(b.x) - 8, y2: py(b.y),
        stroke: "#e9a33c", "stroke-width": 2, "marker-end": "url(#arrowhead)"
      }));
    });
    svg.appendChild(arrows);

    // The ambiguous one, stranded in the empty middle.
    var appleG = appleMarker();
    appleG.setAttribute("opacity", "0");
    appleG.place(D.MAP.apple.x, D.MAP.apple.y);
    svg.appendChild(appleG);

    host.appendChild(svg);

    widgets[slideId] = {
      onStep: function (step) {
        arrows.setAttribute("opacity", step >= 2 ? "1" : "0");
        arrows.style.transition = "opacity 400ms";
        appleG.setAttribute("opacity", step >= 3 ? "1" : "0");
        appleG.style.transition = "opacity 500ms";
      }
    };
  };

  /* ---- Slide 16: context drags the vector -------------------------------
     Each press of the arrow key runs one more transformer block and moves the
     dot to wherever the arithmetic put it. Six presses is enough to see it
     converge — and to see that it takes a stack of layers, not one.
  */

  global.registerSpaceMove = function (widgets, slideId, hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;

    var MAX_LAYERS = 6;
    var current = "fruit";
    var layer = 0;
    var trail = [];

    host.innerHTML =
      '<div style="display:flex;gap:26px;align-items:flex-start">' +
        '<div id="sm-svg"></div>' +
        '<div style="flex:1;display:flex;flex-direction:column;gap:18px;padding-top:8px">' +
          '<div class="btn-row" id="sm-sent"></div>' +
          '<div class="panel" style="padding:18px 20px">' +
            '<div class="eyebrow" style="margin-bottom:12px"><span class="tick"></span>context</div>' +
            '<div id="sm-text" style="font-family:var(--mono);font-size:16px;line-height:1.9"></div>' +
          "</div>" +
          '<div class="panel" style="padding:18px 20px">' +
            '<div class="readout" id="sm-layer" style="margin-bottom:10px"></div>' +
            '<div id="sm-bar" style="height:6px;background:#242d3d;position:relative">' +
              '<div id="sm-fill" style="position:absolute;inset:0 auto 0 0;background:#e9a33c;width:0;transition:width 500ms cubic-bezier(.22,.68,.24,1)"></div>' +
            "</div>" +
            '<div class="tiny" style="margin-top:10px" id="sm-hint"></div>' +
          "</div>" +
          '<div class="disclaimer">positions schematic · path computed</div>' +
        "</div>" +
      "</div>";

    var svg = makeSvg();
    drawBase(svg);

    var trailPath = el("path", {
      fill: "none", stroke: "#e9a33c", "stroke-width": 2,
      "stroke-dasharray": "3 4", opacity: 0.55
    });
    svg.appendChild(trailPath);

    var marker = appleMarker();
    marker.animate(620);
    svg.appendChild(marker);

    host.querySelector("#sm-svg").appendChild(svg);

    var sentBox = host.querySelector("#sm-sent");
    var textBox = host.querySelector("#sm-text");
    var layerOut = host.querySelector("#sm-layer");
    var fill = host.querySelector("#sm-fill");
    var hint = host.querySelector("#sm-hint");

    ["fruit", "tech"].forEach(function (key) {
      var b = document.createElement("button");
      b.className = "btn" + (key === current ? " on" : "");
      b.textContent = D.SENTENCES[key].label;
      b.setAttribute("data-interactive", "");
      b.addEventListener("click", function () {
        current = key;
        Array.prototype.forEach.call(sentBox.children, function (c) { c.classList.remove("on"); });
        b.classList.add("on");
        reset();
      });
      sentBox.appendChild(b);
    });

    function place(x, y) { marker.place(x, y); }

    function positionFor(bias) {
      return {
        x: D.MAP.fruitHome.x + bias * (D.MAP.techHome.x - D.MAP.fruitHome.x),
        y: D.MAP.fruitHome.y + bias * (D.MAP.techHome.y - D.MAP.fruitHome.y)
      };
    }

    var vecs, toks, qi;

    function reset() {
      var s = D.SENTENCES[current];
      toks = global.Attn.tokensOf(s.text);
      vecs = global.Attn.vectorsOf(toks);
      qi = toks.map(function (t) { return t.toLowerCase(); }).lastIndexOf("apple");
      layer = 0;
      trail = [{ x: D.MAP.apple.x, y: D.MAP.apple.y }];
      place(D.MAP.apple.x, D.MAP.apple.y);
      trailPath.setAttribute("d", "");
      paint(null);
    }

    function paint(weights) {
      textBox.innerHTML = toks.map(function (t, i) {
        if (i > qi) return '<span style="color:#3a4152">' + t + "</span>";
        var w = weights ? weights[i] : 0;
        var bg = w > 0.02
          ? 'background:rgba(233,163,60,' + Math.min(0.6, w * 1.35).toFixed(3) + ');'
          : "";
        var isQ = i === qi;
        return '<span style="' + bg + 'padding:2px 4px;color:' +
          (isQ ? "#e9a33c" : "#eceff5") + (isQ ? ";font-weight:500" : "") + '">' +
          t + "</span>";
      }).join(" ");

      layerOut.textContent = layer === 0
        ? "before any layer runs"
        : "after layer " + layer + " of " + MAX_LAYERS;
      fill.style.width = (layer / MAX_LAYERS) * 100 + "%";

      hint.textContent = layer === 0
        ? "the raw embedding — equal pull from both clusters"
        : layer < MAX_LAYERS
          ? "each layer reads the context again and nudges the meaning further"
          : "resolved — and it took a stack of layers, not one";
    }

    function advance() {
      if (layer >= MAX_LAYERS) return;
      var r = global.Attn.refine(vecs, qi);
      vecs = r.vecs;
      layer++;

      var p = positionFor(global.Attn.biasOf(r.vector));
      trail.push(p);
      place(p.x, p.y);
      trailPath.setAttribute("d", trail.map(function (pt, i) {
        return (i ? "L" : "M") + px(pt.x) + " " + py(pt.y);
      }).join(" "));

      paint(r.weights);
    }

    widgets[slideId] = {
      onEnter: reset,
      onStep: function (step) {
        // Step 1 is the setup text; every step after it runs one more layer.
        var want = Math.max(0, Math.min(MAX_LAYERS, step - 1));
        while (layer < want) advance();
        if (layer > want) reset();
      }
    };
  };
})(window);
