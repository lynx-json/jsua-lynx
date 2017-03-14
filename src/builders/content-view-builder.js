import { getPromiseForRequest } from "./content-node-helpers";
import { transfer } from "jsua/lib/transferring";
import { build } from "jsua/lib/views/building";

export function contentViewBuilder(node) {
  return getPromiseForRequest(node)
    .then(transfer)
    .then(build)
    .then(function (result) {
      var view = document.createElement("div");
      
      var embeddedView = result.view;
      view.appendChild(embeddedView);
      
      embeddedView.setAttribute("data-lynx-embedded-view", true);
      
      if (node.value.alt) {
        embeddedView.setAttribute("alt", node.value.alt);
      }
      
      return view;
    });
}
