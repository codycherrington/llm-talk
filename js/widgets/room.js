/**
 * Slide 03 — the audience answer board.
 *
 * The room is asked "what do you think of when I say apple?" and the answers
 * have to land on screen as people actually say them. Pressing the arrow key
 * drops in the next likely answer; typing one and hitting Enter adds whatever
 * the room actually came up with, which is the whole point of asking.
 *
 * Chip positions are hand-placed around the word so nothing ever lands on top
 * of it — on a projector there is no recovering from overlapping text.
 */
(function (global) {
  "use strict";

  var SEATS = [
    { x: 14, y: 20, rot: -3 },
    { x: 71, y: 15, rot: 2 },
    { x: 8,  y: 70, rot: 2 },
    { x: 74, y: 74, rot: -2 },
    { x: 40, y: 8,  rot: 1 },
    { x: 44, y: 77, rot: -1 },
    { x: 3,  y: 45, rot: -2 },
    { x: 80, y: 44, rot: 3 }
  ];

  var LIKELY = ["the fruit", "the company", "the color red", "pie", "the logo", "New York"];

  global.registerRoomWidget = function (widgets, slideId, hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;

    var placed = 0;

    host.innerHTML =
      '<div id="rm-chips" style="position:absolute;inset:0;pointer-events:none"></div>' +
      '<input id="rm-in" spellcheck="false" data-interactive ' +
        'aria-label="Add an answer from the room" placeholder="add what the room says…" ' +
        'style="position:absolute;left:50%;bottom:26px;transform:translateX(-50%);width:300px;' +
        'text-align:center;font-family:var(--mono);font-size:14px;padding:9px 12px;' +
        'background:transparent;border:0;border-bottom:1px solid #232838;color:#7f8aa0;outline:none">';

    var chipBox = host.querySelector("#rm-chips");
    var input = host.querySelector("#rm-in");

    function add(text) {
      if (!text || placed >= SEATS.length) return;
      var seat = SEATS[placed];
      placed++;

      var chip = document.createElement("div");
      chip.textContent = text;
      chip.style.cssText =
        "position:absolute;left:" + seat.x + "%;top:" + seat.y + "%;" +
        "font-family:var(--serif);font-size:31px;color:#b3bccd;" +
        "transform:rotate(" + seat.rot + "deg) translateY(14px) scale(0.94);" +
        "opacity:0;transition:opacity 460ms cubic-bezier(.22,.68,.24,1)," +
        "transform 460ms cubic-bezier(.22,.68,.24,1)";
      chipBox.appendChild(chip);

      requestAnimationFrame(function () {
        chip.style.opacity = "1";
        chip.style.transform = "rotate(" + seat.rot + "deg) translateY(0) scale(1)";
      });
    }

    input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      e.stopPropagation();
      add(input.value.trim());
      input.value = "";
      // Hand focus back to the deck, or the next arrow press goes nowhere and
      // you are standing in front of a room pressing a dead key.
      input.blur();
    });

    function reset() {
      chipBox.innerHTML = "";
      placed = 0;
      input.value = "";
    }

    widgets[slideId] = {
      onEnter: reset,
      onStep: function (step) {
        // Each step drops in one more of the answers a room reliably gives.
        while (placed < step && placed < LIKELY.length) add(LIKELY[placed]);
      }
    };
  };

  /**
   * Slide 04 keeps the same chips on screen while the question changes, so the
   * room is looking at their own answers when they are asked how they knew.
   */
  global.registerEchoWidget = function (widgets, slideId, hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;

    host.innerHTML = "";
    LIKELY.slice(0, 4).forEach(function (text, i) {
      var seat = SEATS[i];
      var chip = document.createElement("div");
      chip.textContent = text;
      chip.style.cssText =
        "position:absolute;left:" + seat.x + "%;top:" + seat.y + "%;" +
        "font-family:var(--serif);font-size:27px;color:#4c5670;" +
        "transform:rotate(" + seat.rot + "deg)";
      host.appendChild(chip);
    });

    widgets[slideId] = {};
  };
})(window);
