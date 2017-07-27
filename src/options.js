import * as util from "./util";

export function initialize(rootView) {
  rootView.addEventListener("jsua-attach", function (evt) {
    var inputViews = Array.from(rootView.querySelectorAll("[data-lynx-options-name]:not([data-lynx-options-connected])"));
    if (inputViews.length === 0) return;
    inputViews.forEach(inputView => inputView.lynxConnectOptions());
  });
}
