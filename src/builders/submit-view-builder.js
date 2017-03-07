import * as containers from "./container-view-builder";
import * as url from "url";

export function submitViewBuilder(node) {
  var view = document.createElement("button");
  
  if (node.base) {
    view.formAction = url.resolve(node.base, node.value.action);  
  } else {
    view.formAction = node.value.action;
  }
  
  if (node.value.method) view.formMethod = node.value.method;
  if (node.value.enctype) view.formEnctype = node.value.enctype;
  
  if (node.value.send !== undefined) {
    view.setAttribute("data-lynx-send", node.value.send);
  } else if (node.spec.send !== undefined) {
    view.setAttribute("data-lynx-send", node.spec.send);
  }
  
  return containers.buildChildViews(node)
    .then(function (childViews) {
      childViews.forEach(childView => view.appendChild(childView));
      
      if (view.children.length === 0) {
        view.textContent = "Submit";
      }
      
      return view;
    });
}
