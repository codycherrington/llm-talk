/**
 * Deck engine: navigation, step reveals, presenter tools, widget lifecycle.
 *
 * Classic script (no modules) because the deck is presented from file://.
 *
 * The design decision worth knowing: slides are authored in a fixed 1280x720
 * coordinate space and the whole stage is transform-scaled to fit whatever
 * display it lands on. Nothing reflows, so what you rehearse is exactly what
 * the projector shows.
 */
(function () {
  "use strict";

  var stage, viewport, rail, stamp, overview, ovGrid, notesEl, helpEl;
  var slides = [];
  var index = 0;
  var step = 0;

  /* ?steps=all lands every slide with all its builds already revealed. Useful
     for rehearsing layout and for capturing stills of the finished deck. */
  var showAllSteps = /[?&]steps=all/.test(window.location.search);

  /* Widgets register here. onEnter/onLeave let a slide reset itself, which
     matters more than it sounds: a deck that only animates correctly on the
     first pass is a liability when you back up to answer a question. */
  var widgets = {};
  window.DeckWidgets = widgets;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---- scaling ---------------------------------------------------------- */

  function fit() {
    var scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.transform = "scale(" + scale + ")";
  }

  /* ---- steps ------------------------------------------------------------ */

  function stepsOf(slide) {
    var max = 0;
    $$("[data-step]", slide).forEach(function (el) {
      max = Math.max(max, parseInt(el.getAttribute("data-step"), 10) || 0);
    });
    return max;
  }

  function paintSteps() {
    var slide = slides[index];
    $$("[data-step]", slide).forEach(function (el) {
      var n = parseInt(el.getAttribute("data-step"), 10) || 0;
      el.classList.toggle("shown", n <= step);
    });
    var w = widgets[slide.id];
    if (w && w.onStep) w.onStep(step);
  }

  /* ---- navigation ------------------------------------------------------- */

  function go(n, atEnd) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === index && slides[index].classList.contains("is-active")) return;

    var prev = slides[index];
    if (prev) {
      prev.classList.remove("is-active");
      var pw = widgets[prev.id];
      if (pw && pw.onLeave) pw.onLeave();
    }

    index = n;
    var slide = slides[index];
    slide.classList.add("is-active");

    step = atEnd || showAllSteps ? stepsOf(slide) : 0;

    /* onEnter before paintSteps, always. Several widgets reset themselves in
       onEnter and rebuild from the step count in onStep — run them the other
       way round and arriving mid-deck wipes the builds you just painted. */
    var w = widgets[slide.id];
    if (w && w.onEnter) w.onEnter();
    paintSteps();

    rail.style.width = ((index + 1) / slides.length) * 100 + "%";
    stamp.textContent = String(index + 1).padStart(2, "0") + " / " + slides.length;
    renderNotes();
    syncOverview();

    try {
      history.replaceState(null, "", "?slide=" + (index + 1) + (showAllSteps ? "&steps=all" : ""));
    } catch (e) {
      /* file:// in some browsers rejects replaceState; navigation still works. */
    }
  }

  function next() {
    if (step < stepsOf(slides[index])) { step++; paintSteps(); }
    else go(index + 1);
  }

  function back() {
    if (step > 0) { step--; paintSteps(); }
    else if (index > 0) go(index - 1, true);
  }

  /* ---- presenter notes -------------------------------------------------- */

  function renderNotes() {
    if (!notesEl.classList.contains("open")) return;
    var src = $(".notes", slides[index]);
    var title = slides[index].getAttribute("data-title") || "";
    $(".hd", notesEl).textContent =
      String(index + 1).padStart(2, "0") + " — " + title;
    $(".bd", notesEl).innerHTML = src ? src.innerHTML : "<p>—</p>";
  }

  /* ---- overview --------------------------------------------------------- */

  function buildOverview() {
    slides.forEach(function (slide, i) {
      var card = document.createElement("button");
      card.className = "ov-card";
      card.innerHTML =
        '<span class="n">' + String(i + 1).padStart(2, "0") + "</span>" +
        "<span>" + (slide.getAttribute("data-title") || "") + "</span>" +
        '<span class="act">' + (slide.getAttribute("data-act") || "") + "</span>";
      card.addEventListener("click", function () {
        overview.classList.remove("open");
        go(i);
      });
      ovGrid.appendChild(card);
    });
  }

  function syncOverview() {
    $$(".ov-card", ovGrid).forEach(function (c, i) {
      c.classList.toggle("here", i === index);
    });
  }

  /* ---- input ------------------------------------------------------------ */

  function onKey(e) {
    var typing = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA");

    if (e.key === "Escape") {
      e.preventDefault();
      if (helpEl.classList.contains("open")) { helpEl.classList.remove("open"); return; }
      overview.classList.toggle("open");
      syncOverview();
      return;
    }

    if (typing && e.key !== "Enter") return;

    switch (e.key) {
      case "ArrowRight": case " ": case "PageDown": case "n":
        e.preventDefault(); next(); break;
      case "ArrowLeft": case "PageUp": case "p":
        e.preventDefault(); back(); break;
      case "ArrowDown":
        e.preventDefault(); go(index + 1); break;
      case "ArrowUp":
        e.preventDefault(); go(index - 1); break;
      case "Home":
        e.preventDefault(); go(0); break;
      case "End":
        e.preventDefault(); go(slides.length - 1); break;
      case "s": case "S":
        e.preventDefault();
        notesEl.classList.toggle("open");
        renderNotes();
        break;
      case "f": case "F":
        e.preventDefault();
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
        break;
      case "?":
        e.preventDefault(); helpEl.classList.toggle("open"); break;
    }
  }

  /* Click-to-advance so a presentation remote works, but never steal a click
     meant for a widget control. */
  function onClick(e) {
    if (e.target.closest("input, button, select, textarea, a, [data-interactive]")) return;
    if (overview.classList.contains("open")) return;
    next();
  }

  /* ---- boot ------------------------------------------------------------- */

  function boot() {
    viewport = $("#viewport");
    stage = $("#stage");
    rail = $("#rail");
    stamp = $("#stamp");
    overview = $("#overview");
    ovGrid = $("#ov-grid");
    notesEl = $("#notes");
    helpEl = $("#help");

    slides = $$(".slide", stage);
    buildOverview();

    fit();
    window.addEventListener("resize", fit);
    document.addEventListener("keydown", onKey);
    viewport.addEventListener("click", onClick);

    if (window.initWidgets) window.initWidgets(widgets);

    var start = 0;
    var m = /[?&]slide=(\d+)/.exec(window.location.search);
    if (m) start = parseInt(m[1], 10) - 1;

    index = -1;
    go(start);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.Deck = { go: go, next: next, back: back };
})();
