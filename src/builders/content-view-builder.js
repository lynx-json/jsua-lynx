import { getPromiseForRequest } from "./content-node-helpers";
import { transferring, building } from "jsua";

export function contentViewBuilder(node) {
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
      }
      
      view.lynxGetValue = function () {
        return result.content.blob;
      };
      
      return view;
    });
}
