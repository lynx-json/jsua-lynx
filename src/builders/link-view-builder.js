import * as containers from "./container-view-builder";
import * as url from "url";
import { fetch } from "jsua";

export function linkViewBuilder(node) {
  var view = document.createElement("a");
  
  if (node.base) {
    view.href = url.resolve(node.base, node.value.href);  
  } else {
    view.href = node.value.href;
  }
  
  view.type = node.value.type;
  
  if (node.value.follow !== undefined) {
    view.setAttribute("data-lynx-follow", node.value.follow);
  } else if (node.spec.follow !== undefined) {
    view.setAttribute("data-lynx-follow", node.spec.follow);
  }
  
  view.addEventListener("click", function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    fetch(view.href, { origin: view });
  });
  
  return containers.buildChildViews(node)
    .then(function (childViews) {
      childViews.forEach(childView => view.appendChild(childView));
      
      if (view.children.length === 0) {
        view.textContent = view.href;
      }
      
      return view;
    });
}
