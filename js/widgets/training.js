/**
 * Slide 22 — how it learns.
 *
 * This is real gradient descent. The weights start as noise, the loss is mean
 * squared error against a target, and each step follows the gradient. The loss
 * curve is measured from the run, not drawn.
 *
 * The target is a picture rather than a language task purely so the room can
 * see the pattern arrive. The loop on stage is the loop that trains the real
 * thing: guess, measure the miss, nudge every weight a little, repeat.
 */
(function (global) {
  "use strict";

  var N = 19;         // grid is N x N "weights"
  /* Tuned so the descent spreads across the full run. Faster and the loss is
     flat by the time you've finished the sentence introducing it, which loses
     the whole point of watching the pattern arrive. */
  var LR = 0.02;
  var STEPS = 260;

  /** The pattern the model is trying to learn. It has never seen it. */
  function target(ix, iy) {
    var x = ((ix + 0.5) / N) * 2 - 1;
    var y = ((iy + 0.5) / N) * 2 - 1;

    var body = (x * x) / 0.7396 + ((y - 0.14) * (y - 0.14)) / 0.6084 <= 1;
    var notch = y < -0.40 && Math.abs(x) < 0.24;
    var stem = Math.abs(x) < 0.06 && y > -0.88 && y < -0.42;

    var lx = x - 0.30, ly = y + 0.60;
    var rx = lx * 0.7071 + ly * 0.7071;
    var ry = -lx * 0.7071 + ly * 0.7071;
    var leaf = (rx * rx) / 0.0729 + (ry * ry) / 0.0121 <= 1;

    return (body && !notch) || stem || leaf ? 1 : 0;
  }

  global.registerTrainingWidget = function (widgets, slideId, hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;

    host.innerHTML =
      '<div style="display:grid;grid-template-columns:auto 1fr;gap:34px;align-items:start">' +
        '<div>' +
          '<canvas id="tr-grid" width="342" height="342" ' +
            'style="image-rendering:pixelated;border:1px solid #242d3d"></canvas>' +
          '<div class="readout" id="tr-step" style="margin-top:12px"></div>' +
        "</div>" +
        '<div style="display:flex;flex-direction:column;gap:18px;padding-top:2px">' +
          '<div class="panel" style="padding:18px 20px">' +
            '<div class="eyebrow" style="margin-bottom:14px"><span class="tick"></span>loss</div>' +
            '<canvas id="tr-loss" width="430" height="132"></canvas>' +
            '<div class="readout" id="tr-val" style="margin-top:10px"></div>' +
          "</div>" +
          '<ol style="margin:0;padding-left:22px;display:flex;flex-direction:column;gap:9px" class="small">' +
            "<li>guess</li>" +
            "<li>measure how wrong the guess was</li>" +
            "<li>nudge every weight a little toward less wrong</li>" +
            "<li>do it again, a few trillion times</li>" +
          "</ol>" +
          '<button class="btn" id="tr-replay" data-interactive style="align-self:flex-start">replay</button>' +
        "</div>" +
      "</div>";

    var grid = host.querySelector("#tr-grid");
    var gctx = grid.getContext("2d");
    var lossCv = host.querySelector("#tr-loss");
    var lctx = lossCv.getContext("2d");
    var stepOut = host.querySelector("#tr-step");
    var valOut = host.querySelector("#tr-val");

    var W, T, losses, step, raf;

    function init() {
      T = [];
      W = [];
      for (var i = 0; i < N * N; i++) {
        T.push(target(i % N, Math.floor(i / N)));
        W.push(Math.random());          // weights start as noise
      }
      losses = [];
      step = 0;
    }

    /** One optimiser step. d(MSE)/dW = -2(T - W), so we move along (T - W). */
    function train() {
      var loss = 0;
      for (var i = 0; i < W.length; i++) {
        var err = T[i] - W[i];
        loss += err * err;
        W[i] += LR * err;
      }
      losses.push(loss / W.length);
      step++;
    }

    function drawGrid() {
      var cell = grid.width / N;
      for (var i = 0; i < W.length; i++) {
        var v = Math.max(0, Math.min(1, W[i]));
        // Noise reads cool and flat; the learned pattern arrives as lamplight.
        var r = Math.round(16 + v * 217);
        var g = Math.round(20 + v * 143);
        var b = Math.round(32 + v * 28);
        gctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        gctx.fillRect((i % N) * cell, Math.floor(i / N) * cell, cell, cell);
      }
    }

    function drawLoss() {
      var w = lossCv.width, h = lossCv.height;
      lctx.clearRect(0, 0, w, h);

      lctx.strokeStyle = "#1a222e";
      lctx.lineWidth = 1;
      for (var g = 1; g < 4; g++) {
        lctx.beginPath();
        lctx.moveTo(0, (h / 4) * g);
        lctx.lineTo(w, (h / 4) * g);
        lctx.stroke();
      }

      if (losses.length < 2) return;
      var max = losses[0] || 1;

      lctx.beginPath();
      losses.forEach(function (l, i) {
        var x = (i / (STEPS - 1)) * w;
        var y = h - (l / max) * (h - 6) - 3;
        if (i === 0) lctx.moveTo(x, y); else lctx.lineTo(x, y);
      });
      lctx.strokeStyle = "#e9a33c";
      lctx.lineWidth = 2;
      lctx.stroke();
    }

    function frame() {
      if (step < STEPS) {
        for (var k = 0; k < 2; k++) if (step < STEPS) train();
        drawGrid();
        drawLoss();
        stepOut.textContent = "step " + step + " of " + STEPS;
        valOut.textContent = "loss " + (losses[losses.length - 1] || 0).toFixed(4) +
          (step >= STEPS ? "   ·   converged" : "");
        raf = requestAnimationFrame(frame);
      } else {
        stepOut.textContent = "step " + STEPS + " — nobody told it what an apple looks like";
      }
    }

    function start() {
      stop();
      init();
      drawGrid();
      drawLoss();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    host.querySelector("#tr-replay").addEventListener("click", start);

    widgets[slideId] = { onEnter: start, onLeave: stop };
  };
})(window);
