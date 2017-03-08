import { transfer } from "jsua/lib/transferring";
import { build } from "jsua/lib/views/building";
import * as url from "url";

export function imageViewBuilder(node) {
  var src = node.value.src;
  
  if (src) {
    src = url.resolve(node.base || "", src);
  } else {
    src = "data:" + node.value.type;
    
    if (node.value.encoding) {
      src += ";" + node.value.encoding;
    }
    
    src += "," + node.value.data;
  }
  
  return transfer({ url: src })
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
