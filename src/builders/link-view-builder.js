import * as containers from "./container-view-builder";

export function linkViewBuilder(node) {
  var view = document.createElement("a");
  
  view.href = node.value.href;
  view.type = node.value.type;
  
  if (node.value.follow !== undefined) {
    view.setAttribute("data-lynx-follow", node.value.follow);
  } else if (node.spec.follow !== undefined) {
    view.setAttribute("data-lynx-follow", node.spec.follow);
  }
  
  containers.buildChildViews(node).forEach(childView => view.appendChild(childView));
  
  if (view.children.length === 0) {
    view.textContent = view.href;
  }
    
  return view;
}
