import { getPromiseForRequest } from "./content-node-helpers";
import { transfer } from "jsua/lib/transferring";
import { build } from "jsua/lib/views/building";

export function imageViewBuilder(node) {
  return getPromiseForRequest(node)
    .then(transfer)
    .then(build)
    .then(function (result) {
      var view = document.createElement("div");
      
      var embeddedView = result.view;
      view.appendChild(embeddedView);
      
      if (node.value.alt) {
        embeddedView.setAttribute("alt", node.value.alt);
        embeddedView.setAttribute("title", node.value.alt);
      }

      var height = parseInt(node.value.height);
      if (height) embeddedView.setAttribute("data-lynx-height", height);

      var width = parseInt(node.value.width);
      if (width) embeddedView.setAttribute("data-lynx-width", width);
      
      return view;
    });
}
