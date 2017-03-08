import { transfer } from "jsua/lib/transferring";
import { build } from "jsua/lib/views/building";
import * as url from "url";

function getPromiseForRequest(node) {
  if (node.value.src) {
    var src = url.resolve(node.base || "", node.value.src);
    return Promise.resolve({ url: src });
  }
  
  return new Promise(function (resolve) {
    var buf = new Buffer(node.value.data, node.value.encoding || "utf8");
    var blob = new Blob([buf], { type: node.value.type });
    var fileReader = new FileReader();
    
    fileReader.onloadend = function (evt) {
      resolve({ url: evt.target.result });
    };
    
    fileReader.readAsDataURL(blob);
  });
}

export function contentViewBuilder(node) {
  return getPromiseForRequest(node)
    .then(transfer)
    .then(build)
    .then(function (result) {
      var view = document.createElement("div");
      
      var embeddedView = result.view;
      view.appendChild(embeddedView);
      
      if (node.value.alt) {
        embeddedView.setAttribute("alt", node.value.alt);
      }
      
      return view;
    });
}

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
