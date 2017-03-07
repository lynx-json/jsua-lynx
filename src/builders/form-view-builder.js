import * as containers from "./container-view-builder";

export function formViewBuilder(node) {
  var view = document.createElement("form");
  view.autocomplete = "off";
  view.setAttribute("novalidate", "novalidate");
  
  return containers.buildChildViews(node)
    .then(function (childViews) {
      childViews.forEach(childView => view.appendChild(childView));
      return view;
    });
}
