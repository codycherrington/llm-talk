/**
 * Wires every widget to the slide that owns it. deck.js calls this once the
 * DOM is up, then drives onEnter / onLeave / onStep as you navigate.
 */
window.initWidgets = function (widgets) {
  window.registerRoomWidget(widgets, "s-apple", "w-room");
  window.registerEchoWidget(widgets, "s-howknow", "w-echo");
  window.registerTokenizerWidget(widgets, "s-tokens", "w-tokens");
  window.registerSpaceStatic(widgets, "s-space", "w-space");
  window.registerAttentionWidget(widgets, "s-attn-live", "w-attn");
  window.registerSpaceMove(widgets, "s-move", "w-move");
  window.registerMultiHead(widgets, "s-heads", "w-heads");
  window.registerPredictWidget(widgets, "s-predict", "w-predict");
  window.registerGenerateWidget(widgets, "s-loop", "w-loop");
  window.registerTrainingWidget(widgets, "s-train", "w-train");
};
