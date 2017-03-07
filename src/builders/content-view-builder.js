import { transfer } from "jsua/lib/transferring";
import { build } from "jsua/lib/views/building";

export function contentViewBuilder(node) {
  var url = node.value.src;
  
  if (!url) {
    url = "data:" + node.value.type;
    
    if (node.value.encoding) {
      url += ";" + node.value.encoding;
    }
    
    url += "," + node.value.data;
  }
  
  return transfer({ url })
    .then(build)
    .then(function (view) {
      if (node.value.alt) {
        view.setAttribute("alt", node.value.alt);
      }
      
      return view;
    });
}
