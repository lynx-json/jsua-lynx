import * as containers from "./container-view-builder";
import * as url from "url";

export function submitViewBuilder(node) {
  var view = document.createElement("button");
  
  if (node.base) {
    view.formAction = url.resolve(node.base, node.value.action);  
  } else {
    view.formAction = node.value.action;
  }
  
  view.formEnctype = node.value.enctype || "";
  view.formMethod = node.value.method || "";
  
  if (node.value.send !== undefined) {
    view.setAttribute("data-lynx-send", node.value.send);
  } else if (node.spec.send !== undefined) {
    view.setAttribute("data-lynx-send", node.spec.send);
  }
  
  containers.buildChildViews(node).forEach(childView => view.appendChild(childView));
  
  if (view.children.length === 0) {
    view.textContent = "Submit";
  }
    
  return view;
}
