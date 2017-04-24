import { getPromiseForRequest } from "./content-node-helpers";
import { transferring, building } from "jsua";

export function imageViewBuilder(node) {
  return getPromiseForRequest(node)
    .then(transferring.transfer)
    .then(building.build)
    .then(function (result) {
      var view = document.createElement("div");
      
      var embeddedView = result.view;
      view.appendChild(embeddedView);
      
      embeddedView.setAttribute("data-lynx-embedded-view", true);
      
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
