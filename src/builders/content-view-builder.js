import { getPromiseForRequest } from "./content-node-helpers";
import { transferring, building } from "jsua";

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
