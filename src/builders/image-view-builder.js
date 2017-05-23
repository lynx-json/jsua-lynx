import url from "url";
import { contentViewBuilder } from "./content-view-builder";
import { getBlob } from "./content-node-helpers";

function applyImageAttributes(node) {
  return function (view) {
    var embeddedView = view.lynxGetEmbeddedView();
    if (!embeddedView) return view;

    var height = parseInt(node.value.height);
    if (height) embeddedView.setAttribute("data-lynx-height", height);

    var width = parseInt(node.value.width);
    if (width) embeddedView.setAttribute("data-lynx-width", width);

    return view;
  };
}

function buildAsEmbeddedImageTag(node) {
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

    if (embeddedView) {
      detached.push(view.removeChild(embeddedView));
    }

    embeddedView = newView;
    value = newBlob;

    if (!embeddedView) return detached;

    view.appendChild(embeddedView);
    embeddedView.setAttribute("data-lynx-embedded-view", true);

    if (node.value.alt) {
      embeddedView.setAttribute("alt", node.value.alt);
    }

    return detached;
  };

  var imageView = document.createElement("img");
  imageView.src = url.resolve(node.base || "", node.value.src);
  imageView.setAttribute("data-content-url", imageView.src);
  imageView.setAttribute("data-content-type", node.value.type);
  view.lynxSetEmbeddedView(imageView, getBlob(node));

  return Promise.resolve(view);
}

export function imageViewBuilder(node) {
  if (node.value.src) return buildAsEmbeddedImageTag(node).then(applyImageAttributes(node));
  else return contentViewBuilder(node).then(applyImageAttributes(node));
}
