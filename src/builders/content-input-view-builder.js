import { getBlob, getPromiseForRequest } from "./content-node-helpers";
import { transfer } from "jsua/lib/transferring";
import { build } from "jsua/lib/views/building";

export function contentInputViewBuilder(node) {
  return new Promise(function (resolve, reject) {
    var view = document.createElement("div");
    
    var inputView = document.createElement("input");
    inputView.type = "file";
    inputView.name = node.spec.input.name || "";
    
    var value = null;
    
    view.getValue = function () {
      return value;
    };
    
    view.setValue = function (val) {
      if (val === value) return;
      value = val;
      
      var oldEmbeddedView = document.querySelector("[data-lynx-content-view]");
      
      if (!value) {
        if (oldEmbeddedView) view.removeChild(oldEmbeddedView);
        return;
      }
      
      var content = {
        url: value.name || "",
        blob: value
      };
      
      Promise.resolve(content)
        .then(build)
        .then(function (result) {
          var embeddedView = result.view;
          
          embeddedView.setAttribute("data-lynx-content-view", true);
          
          if (oldEmbeddedView) {
            view.replaceChild(embeddedView, oldEmbeddedView);
          } else {
            view.appendChild(embeddedView);
          }
        });
    };
    
    inputView.addEventListener("change", function (evt) {
      view.setValue(inputView.files[0]);
    });
    
    if (!node.value) return resolve(view);
    
    if (node.value.data) {
      view.setValue(getBlob(node));
      resolve(view);
    } else if (node.value.src) {
      getPromiseForRequest(node)
        .then(transfer)
        .then(function (content) {
          content.blob.name = content.url;
          view.setValue(content.blob);
          return view;
        })
        .then(resolve, reject);
    }
  });
}
