import { getPromiseForRequest } from "./content-node-helpers";
import { transferring, building } from "@lynx-json/jsua";

export function contentViewBuilder(node) {
  var view = document.createElement("div");
  var embeddedView, value;

  view.lynxGetValue = function () {
    return value;
  };

  view.lynxGetEmbeddedView = function () {
    return embeddedView;
  };

  view.lynxSetEmbeddedView = function (newView, newBlob) {
    var detached = [];

    value = newBlob;

    embeddedView.parentElement.replaceChild(newView, embeddedView);
    detached.push(embeddedView);

    embeddedView = newView;

    embeddedView.setAttribute("data-lynx-embedded-view", true);

    if (node.value.alt) {
      embeddedView.setAttribute("alt", node.value.alt);
    }

    return detached;
  };

  embeddedView = document.createElement("div");
  embeddedView.setAttribute("role", "presentation");
  embeddedView.setAttribute("data-lynx-embedded-view", true);
  view.appendChild(embeddedView);

  if (node.value.src || node.value.data) {
    return getPromiseForRequest(node)
      .then(transferring.transfer)
      .then(building.build)
      .then(function (result) {
        view.lynxSetEmbeddedView(result.view, result.content.blob);
        return view;
      });
  }

  return Promise.resolve(view);
}
