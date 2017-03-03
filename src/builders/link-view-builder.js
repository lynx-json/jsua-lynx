import * as containers from "./container-view-builder";

export function linkViewBuilder(node) {
  var view = document.createElement("a");
  
  view.href = node.value.href;
  view.type = node.value.type;
  
  containers.buildChildViews(node).forEach(childView => view.appendChild(childView));
  
  if (view.children.length === 0) {
    view.textContent = view.href;
  }
    
  return view;
}
