import * as util from "./util";

export function initialize(rootView) {
  rootView.addEventListener("jsua-attach", function () {
    var inputViews = Array.from(rootView.querySelectorAll("[data-lynx-options-name]"));
    if (inputViews.length === 0) return;
    inputViews.forEach(inputView => inputView.lynxConnectOptions());
  });
}
