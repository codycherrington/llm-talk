/**
 * Live tokenizer (slide 07). Type anything, see the real GPT-2 split and the
 * real token IDs.
 *
 * The leading space is rendered as a visible middot, because "apple" and
 * " apple" being different tokens is the single most surprising fact on the
 * slide and it is invisible otherwise.
 */
(function (global) {
  "use strict";

  var PRESETS = [
    { label: "orchard", text: "The orchard was ripe, so I picked the apple." },
    { label: "market", text: "The market was hot, so I bought the apple." },
    { label: "apple ×3", text: "apple Apple apple" },
    { label: "strawberry", text: "strawberry" },
    { label: "rare words", text: "unbelievable antidisestablishmentarianism" }
  ];

  function build(host) {
    host.innerHTML =
      '<div style="display:flex;flex-direction:column;gap:16px">' +
        '<input class="field" id="tk-in" spellcheck="false" data-interactive ' +
          'aria-label="Text to tokenize">' +
        '<div class="btn-row" id="tk-presets"></div>' +
        '<div class="tok-row" id="tk-out" style="min-height:112px;align-content:flex-start"></div>' +
        '<div class="readout" id="tk-stat"></div>' +
      "</div>";
  }

  function render(input, out, stat) {
    var tk = global.LLMTalkTokenizer.get();
    var text = input.value;

    if (!tk) {
      out.innerHTML = '<span class="readout">tokenizer data not loaded</span>';
      return;
    }

    var toks = tk.encode(text);
    out.innerHTML = "";

    toks.forEach(function (t) {
      var chip = document.createElement("span");
      chip.className = "tok";

      // A leading space is made visible as a middot. "apple" and " apple"
      // being different tokens is the most surprising fact on the slide, and
      // it is completely invisible otherwise.
      var body = document.createElement("span");
      if (t.text.charAt(0) === " ") {
        body.innerHTML = '<span class="sp">·</span>' + escapeHtml(t.text.slice(1));
      } else {
        body.textContent = t.text.replace(/\n/g, "\\n");
      }

      var id = document.createElement("span");
      id.className = "id";
      id.textContent = t.id;

      if (/apple/i.test(t.text)) chip.classList.add("hot");

      chip.appendChild(body);
      chip.appendChild(id);
      out.appendChild(chip);
    });

    stat.textContent =
      text.length + " characters   →   " + toks.length + " tokens" +
      (toks.length ? "   ·   avg " + (text.length / toks.length).toFixed(1) + " chars/token" : "");
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  global.registerTokenizerWidget = function (widgets, slideId, hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;

    build(host);
    var input = host.querySelector("#tk-in");
    var out = host.querySelector("#tk-out");
    var stat = host.querySelector("#tk-stat");
    var presets = host.querySelector("#tk-presets");

    PRESETS.forEach(function (p, i) {
      var b = document.createElement("button");
      b.className = "btn" + (i === 0 ? " on" : "");
      b.textContent = p.label;
      b.setAttribute("data-interactive", "");
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(presets.children, function (c) {
          c.classList.remove("on");
        });
        b.classList.add("on");
        input.value = p.text;
        render(input, out, stat);
      });
      presets.appendChild(b);
    });

    input.addEventListener("input", function () {
      Array.prototype.forEach.call(presets.children, function (c) {
        c.classList.remove("on");
      });
      render(input, out, stat);
    });

    input.value = PRESETS[0].text;

    widgets[slideId] = {
      onEnter: function () {
        render(input, out, stat);
      }
    };
  };
})(window);
