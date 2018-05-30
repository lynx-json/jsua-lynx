import url from "url";
import { contentViewBuilder } from "./content-view-builder";
import { getBlob } from "./content-node-helpers";

function applyImageAttributes(node) {
  return function (view) {
    var embeddedView = view.lynxGetEmbeddedView();
    if (!embeddedView) return view;

    var height = parseInt(node.value.height);
    if (height) {
      embeddedView.height = height;
      embeddedView.setAttribute("data-lynx-height", height);
    }

    var width = parseInt(node.value.width);
    if (width) {
      embeddedView.width = width;
      embeddedView.setAttribute("data-lynx-width", width);
    }

    return view;
  };
}

function buildAsEmbeddedImageTag(node) {
  var emptyNode = {
    base: node.base,
    spec: { hints: ["image", "content"] },
    value: null
  };

  if (node.value && node.value.alt) emptyNode.value = { alt: node.value.alt };

  return contentViewBuilder(emptyNode)
    .then(function (view) {
      var imageView = document.createElement("img");
      imageView.src = url.resolve(node.base || "", node.value.src);
      imageView.setAttribute("data-content-url", imageView.src);
      imageView.setAttribute("data-content-type", node.value.type);
      view.lynxSetEmbeddedView(imageView, new Blob([], { type: node.value.type }));
      return view;
    });
}

export function imageViewBuilder(node) {
  if (node.value.src) return buildAsEmbeddedImageTag(node).then(applyImageAttributes(node));
  else return contentViewBuilder(node).then(applyImageAttributes(node));
}
