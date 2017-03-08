import { transfer } from "jsua/lib/transferring";
import { build } from "jsua/lib/views/building";
import * as url from "url";

export function contentViewBuilder(node) {
  var src = node.value.src;
  
  if (src) {
    src = url.resolve(node.base || "http:", src);
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
      var view = result.view;
      
      if (node.value.alt) {
        view.setAttribute("alt", node.value.alt);
      }
      
      return view;
    });
}
