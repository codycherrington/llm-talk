/**
 * Slide 20 — the next-token distribution, with a temperature control.
 * Slide 21 — the generation loop, one token at a time.
 *
 * The starting logits are illustrative (running a real model in the room is
 * not on the table) and the slide says so. The temperature arithmetic applied
 * to them is the real softmax, so what the slider does to the shape of the
 * distribution is exactly what it does in production.
 */
(function (global) {
  "use strict";

  var D = global.DeckData;

  function softmax(logits, temperature) {
    var t = Math.max(0.01, temperature);
    var scaled = logits.map(function (l) { return l / t; });
    var max = Math.max.apply(null, scaled);
    var exps = scaled.map(function (s) { return Math.exp(s - max); });
    var sum = exps.reduce(function (a, b) { return a + b; }, 0);
    return exps.map(function (e) { return e / sum; });
  }

  /* ---- Slide 20 ---------------------------------------------------------- */

  global.registerPredictWidget = function (widgets, slideId, hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;

    var current = "fruit";
    var temp = 1.0;

    host.innerHTML =
      '<div style="display:flex;flex-direction:column;gap:16px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div class="btn-row" id="pr-sent"></div>' +
          '<div class="disclaimer">logits illustrative · softmax real</div>' +
        "</div>" +
        '<div class="panel" style="padding:16px 20px">' +
          '<span class="mono" style="font-size:18px;color:#b3bccd" id="pr-prompt"></span>' +
          '<span class="mono" style="font-size:18px;color:#e9a33c">&nbsp;___</span>' +
        "</div>" +
        '<div id="pr-bars" style="display:flex;flex-direction:column;gap:7px"></div>' +
        '<div style="display:grid;grid-template-columns:150px 1fr 132px;gap:16px;align-items:center;margin-top:2px">' +
          '<span class="readout">temperature</span>' +
          '<input type="range" id="pr-temp" min="0.05" max="2" step="0.05" value="1" data-interactive ' +
            'aria-label="Sampling temperature">' +
          '<span class="readout" id="pr-tval" style="text-align:right"></span>' +
        "</div>" +
        '<div class="tiny" id="pr-note"></div>' +
      "</div>";

    var sentBox = host.querySelector("#pr-sent");
    var promptEl = host.querySelector("#pr-prompt");
    var barsEl = host.querySelector("#pr-bars");
    var slider = host.querySelector("#pr-temp");
    var tval = host.querySelector("#pr-tval");
    var note = host.querySelector("#pr-note");

    ["fruit", "tech"].forEach(function (key) {
      var b = document.createElement("button");
      b.className = "btn" + (key === current ? " on" : "");
      b.textContent = D.SENTENCES[key].label;
      b.setAttribute("data-interactive", "");
      b.addEventListener("click", function () {
        current = key;
        Array.prototype.forEach.call(sentBox.children, function (c) { c.classList.remove("on"); });
        b.classList.add("on");
        render();
      });
      sentBox.appendChild(b);
    });

    slider.addEventListener("input", function () {
      temp = parseFloat(slider.value);
      render();
    });

    function render() {
      var spec = D.PREDICTIONS[current];
      promptEl.textContent = spec.prompt;

      var probs = softmax(spec.options.map(function (o) { return o.logit; }), temp);
      var top = probs.reduce(function (a, b) { return Math.max(a, b); }, 0);

      barsEl.innerHTML = "";
      spec.options.forEach(function (o, i) {
        var p = probs[i];
        var row = document.createElement("div");
        row.style.cssText = "display:grid;grid-template-columns:132px 1fr 68px;gap:14px;align-items:center";
        row.innerHTML =
          '<span class="mono" style="font-size:17px;color:' +
            (p === top ? "#e9a33c" : "#b3bccd") + '">' + o.t.replace(/^ /, "·") + "</span>" +
          '<span style="height:13px;background:#1a222e;display:block;position:relative">' +
            '<span style="position:absolute;inset:0 auto 0 0;transition:width 220ms cubic-bezier(.22,.68,.24,1);width:' +
            (p * 100).toFixed(2) + "%;background:" + (p === top ? "#e9a33c" : "#3f4757") + '"></span></span>' +
          '<span class="readout" style="text-align:right">' + (p * 100).toFixed(1) + "%</span>";
        barsEl.appendChild(row);
      });

      tval.textContent = temp.toFixed(2);
      note.textContent = temp < 0.4
        ? "cold — it takes the top answer almost every time. Repetitive, but predictable."
        : temp > 1.35
          ? "hot — the tail gets real probability. This is where it goes off the rails."
          : "around 1.0 — roughly the distribution the model actually learned.";
    }

    widgets[slideId] = {
      onEnter: function () {
        temp = 1.0;
        slider.value = "1";
        render();
      }
    };
  };

  /* ---- Slide 21: the loop ------------------------------------------------ */

  global.registerGenerateWidget = function (widgets, slideId, hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;

    var PROMPT = "The market was hot, so I bought the apple";
    var CONT = [" shares", " before", " the", " keynote", ",", " hoping", " the", " news", " would", " move", " the", " price", "."];

    var shown = 0;
    var timer = null;

    host.innerHTML =
      '<div style="display:flex;flex-direction:column;gap:18px">' +
        '<div class="panel" style="min-height:150px;padding:22px 24px">' +
          '<span class="mono" style="font-size:21px;line-height:1.75;color:#7f8aa0">' + PROMPT + "</span>" +
          '<span class="mono" id="gn-out" style="font-size:21px;line-height:1.75;color:#eceff5"></span>' +
          '<span class="mono" id="gn-caret" style="font-size:21px;color:#e9a33c">▌</span>' +
        "</div>" +
        '<div style="display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center">' +
          '<div>' +
            '<div style="height:6px;background:#1a222e;position:relative">' +
              '<div id="gn-fill" style="position:absolute;inset:0 auto 0 0;width:0;background:#e9a33c;transition:width 200ms linear"></div>' +
            "</div>" +
            '<div class="readout" id="gn-count" style="margin-top:10px"></div>' +
          "</div>" +
          '<button class="btn" id="gn-replay" data-interactive>replay</button>' +
        "</div>" +
        '<p class="small" id="gn-note" style="min-height:52px"></p>' +
      "</div>";

    var out = host.querySelector("#gn-out");
    var caret = host.querySelector("#gn-caret");
    var fill = host.querySelector("#gn-fill");
    var count = host.querySelector("#gn-count");
    var note = host.querySelector("#gn-note");

    host.querySelector("#gn-replay").addEventListener("click", start);

    function paint() {
      out.textContent = CONT.slice(0, shown).join("");
      fill.style.width = (shown / CONT.length) * 100 + "%";
      count.textContent = shown === 0
        ? "waiting"
        : "forward pass " + shown + " of " + CONT.length +
          "  ·  " + (PROMPT.split(/\s+/).length + shown) + " tokens re-read each time";
      note.textContent = shown === 0
        ? ""
        : shown < CONT.length
          ? "Every token you see cost a full trip through every layer. The model has no draft and no plan — it committed to \"" +
            CONT.slice(0, shown).join("").trim() + "\" one word at a time."
          : "Thirteen tokens, thirteen complete passes through the network. It never went back and revised.";
    }

    function start() {
      stop();
      shown = 0;
      paint();
      caret.style.opacity = "1";
      timer = setInterval(function () {
        if (shown >= CONT.length) { stop(); caret.style.opacity = "0.25"; return; }
        shown++;
        paint();
      }, 340);
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    widgets[slideId] = {
      onEnter: start,
      onLeave: stop
    };
  };
})(window);
