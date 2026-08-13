/**
 * Attention widgets.
 *
 *   slide 15 — click any token, see what it looks back at. Arc thickness is
 *              the real softmax weight.
 *   slide 17 — four heads on the same sentence, each doing a different job.
 *
 * Arc geometry uses offsetLeft/offsetWidth rather than getBoundingClientRect,
 * because the whole stage is transform-scaled and client rects come back in
 * scaled pixels while the SVG lives in the unscaled coordinate space.
 */
(function (global) {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var D = global.DeckData;

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    return n;
  }

  /* ---- Slide 15: what does this token look at? --------------------------- */

  global.registerAttentionWidget = function (widgets, slideId, hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;

    var current = "fruit";
    var query = null;

    host.innerHTML =
      '<div style="display:flex;flex-direction:column;gap:14px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div class="btn-row" id="at-sent"></div>' +
          '<div class="disclaimer">real softmax · toy 8-dim embeddings</div>' +
        "</div>" +
        '<div style="position:relative">' +
          '<div class="tok-row" id="at-toks" style="gap:6px"></div>' +
          '<svg id="at-arcs" width="1112" height="126" style="margin-top:2px"></svg>' +
        "</div>" +
        '<div id="at-bars" style="display:flex;flex-direction:column;gap:6px"></div>' +
      "</div>";

    var sentBox = host.querySelector("#at-sent");
    var tokRow = host.querySelector("#at-toks");
    var arcs = host.querySelector("#at-arcs");
    var bars = host.querySelector("#at-bars");

    ["fruit", "tech"].forEach(function (key) {
      var b = document.createElement("button");
      b.className = "btn" + (key === current ? " on" : "");
      b.textContent = D.SENTENCES[key].label;
      b.setAttribute("data-interactive", "");
      b.addEventListener("click", function () {
        current = key;
        Array.prototype.forEach.call(sentBox.children, function (c) { c.classList.remove("on"); });
        b.classList.add("on");
        buildTokens();
      });
      sentBox.appendChild(b);
    });

    var toks = [], vecs = [];

    function buildTokens() {
      var s = D.SENTENCES[current];
      toks = global.Attn.tokensOf(s.text);
      vecs = global.Attn.vectorsOf(toks);
      tokRow.innerHTML = "";

      toks.forEach(function (t, i) {
        var chip = document.createElement("button");
        chip.className = "tok";
        chip.style.cursor = "pointer";
        chip.style.fontSize = "19px";
        chip.textContent = t;
        chip.setAttribute("data-interactive", "");
        chip.addEventListener("click", function () { select(i); });
        tokRow.appendChild(chip);
      });

      // Default to the token the whole talk is about.
      var idx = toks.map(function (t) { return t.toLowerCase(); }).lastIndexOf("apple");
      select(idx >= 0 ? idx : toks.length - 1);
    }

    function select(qi) {
      query = qi;
      var res = global.Attn.attend(vecs, qi);
      paintChips(res);
      paintArcs(res);
      paintBars(res);
    }

    function paintChips(res) {
      Array.prototype.forEach.call(tokRow.children, function (chip, i) {
        chip.classList.toggle("hot", i === query);
        if (i > query) {
          // Causal mask: these genuinely do not exist yet from here.
          chip.style.opacity = "0.24";
          chip.style.borderBottomColor = "";
        } else {
          chip.style.opacity = "1";
          var w = res.weights[i];
          chip.style.borderBottomColor = w > 0.06 ? "#e9a33c" : "";
        }
      });
    }

    function paintArcs(res) {
      arcs.innerHTML = "";
      if (query === null) return;

      var qEl = tokRow.children[query];
      var qx = qEl.offsetLeft + qEl.offsetWidth / 2;
      var top = 6;

      for (var i = 0; i <= query; i++) {
        var w = res.weights[i];
        if (w < 0.03) continue;

        var tEl = tokRow.children[i];
        var tx = tEl.offsetLeft + tEl.offsetWidth / 2;

        if (i === query) {
          // Self-attention: real, usually large, and not the interesting part.
          // Drawn as a small loop so it is visible but never the story.
          arcs.appendChild(el("path", {
            d: "M" + (qx - 9) + " " + top + " q 9 22 18 0",
            fill: "none", stroke: "#7f8aa0",
            "stroke-width": 2, opacity: 0.5
          }));
          continue;
        }

        var depth = top + 34 + Math.abs(qx - tx) * 0.16;
        depth = Math.min(depth, 118);

        arcs.appendChild(el("path", {
          d: "M" + qx + " " + top +
             " C" + qx + " " + depth + " " + tx + " " + depth + " " + tx + " " + top,
          fill: "none",
          stroke: "#e9a33c",
          "stroke-width": Math.max(1.2, w * 22).toFixed(2),
          opacity: Math.max(0.28, Math.min(0.95, w * 3)).toFixed(2),
          "stroke-linecap": "round"
        }));
      }
    }

    function paintBars(res) {
      bars.innerHTML = "";
      var rows = [];
      for (var i = 0; i <= query; i++) {
        if (res.weights[i] >= 0.03) rows.push({ t: toks[i], w: res.weights[i], self: i === query });
      }
      rows.sort(function (a, b) { return b.w - a.w; });

      rows.slice(0, 5).forEach(function (r) {
        var row = document.createElement("div");
        row.style.cssText = "display:grid;grid-template-columns:120px 1fr 62px;gap:12px;align-items:center";
        row.innerHTML =
          '<span class="mono" style="font-size:16px;color:' +
            (r.self ? "#7f8aa0" : "#eceff5") + '">' + r.t +
            (r.self ? ' <span style="font-size:12px">(itself)</span>' : "") + "</span>" +
          '<span style="height:9px;background:#1a222e;display:block;position:relative">' +
            '<span style="position:absolute;inset:0 auto 0 0;width:' + (r.w * 100).toFixed(1) +
            '%;background:' + (r.self ? "#3f4757" : "#e9a33c") + '"></span></span>' +
          '<span class="readout" style="text-align:right">' + (r.w * 100).toFixed(1) + "%</span>";
        bars.appendChild(row);
      });
    }

    widgets[slideId] = { onEnter: buildTokens };
  };

  /* ---- Slide 17: several heads at once -----------------------------------
     Schematic patterns, labelled as such on the slide. The four behaviours are
     real documented head types from interpretability research — a head that
     looks one token back, one that links a verb to its subject, one that parks
     on punctuation, one that tracks topic.
  */

  global.registerMultiHead = function (widgets, slideId, hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;

    var toks = global.Attn.tokensOf(D.SENTENCES.tech.text);
    var vecs = global.Attn.vectorsOf(toks);
    var qi = toks.map(function (t) { return t.toLowerCase(); }).lastIndexOf("apple");

    function pattern(kind) {
      var w = new Array(toks.length).fill(0);
      var i;

      if (kind === "prev") {
        w[qi - 1] = 0.72; w[qi - 2] = 0.16; w[qi] = 0.12;
      } else if (kind === "subject") {
        for (i = 0; i <= qi; i++) {
          var t = toks[i].toLowerCase();
          w[i] = (t === "i" ? 0.42 : t === "bought" ? 0.33 : 0.03);
        }
      } else if (kind === "delim") {
        for (i = 0; i <= qi; i++) w[i] = /^[.,]$/.test(toks[i]) ? 0.55 : 0.05;
      } else {
        // Topical head: the real arithmetic, which is exactly the topic head.
        w = global.Attn.attend(vecs, qi).weights.slice();
      }

      var sum = w.reduce(function (a, b) { return a + b; }, 0);
      return w.map(function (x) { return sum ? x / sum : 0; });
    }

    var grid = document.createElement("div");
    grid.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:18px 30px";

    D.HEADS.forEach(function (h) {
      var w = pattern(h.kind);
      var card = document.createElement("div");
      card.className = "panel";
      card.style.padding = "16px 18px";

      var cells = toks.slice(0, qi + 1).map(function (t, i) {
        var a = Math.min(1, w[i] * 2.2);
        return '<span style="font-family:var(--mono);font-size:13px;padding:3px 5px;' +
          "background:rgba(233,163,60," + a.toFixed(3) + ');color:' +
          (a > 0.45 ? "#0a0d14" : "#b3bccd") + '">' + t + "</span>";
      }).join(" ");

      card.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:11px">' +
          '<span class="mono" style="font-size:13px;color:#e9a33c">' + h.name + "</span>" +
          '<span class="tiny">' + h.role + "</span>" +
        "</div>" +
        '<div style="line-height:2.1">' + cells + "</div>";
      grid.appendChild(card);
    });

    host.appendChild(grid);
    widgets[slideId] = {};
  };
})(window);
