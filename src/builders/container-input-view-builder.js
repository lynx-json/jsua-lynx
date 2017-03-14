import * as containers from "./container-view-builder";
import { nodeViewBuilder } from "./node-view-builder";

export function containerInputViewBuilder(node) {
  function appendChildView(childView) {
    childView.setAttribute("data-lynx-container-input-value", true);
    
    var itemView = document.createElement("div");
    view.appendChild(itemView);
    itemView.setAttribute("data-lynx-container-input-item", true);
    itemView.appendChild(childView);
    
    var removeView = document.createElement("button");
    itemView.appendChild(removeView);
    removeView.setAttribute("data-lynx-container-input-remove", true);
    removeView.type = "button";
    removeView.textContent = "+";
    removeView.addEventListener("click", function () {
      view.removeChild(itemView);
    });
    
    return itemView;
  }
  
  var view = document.createElement("div");
  
  var addView = document.createElement("button");
  view.appendChild(addView);
  addView.setAttribute("data-lynx-container-input-add", true);
  addView.type = "button";
  addView.textContent = "+";
  addView.addEventListener("click", function () {
    return view.addValue();
  });
  
  view.addValue = function (val) {
    var childNode = {
      base: node.base,
      spec: JSON.parse(JSON.stringify(node.spec.children)),
      value: val || null
    };
    
    return Promise.resolve(childNode)
      .then(nodeViewBuilder)
      .then(appendChildView)
      .catch(function (err) {
        console.log("Error adding value to container input.", err);
      });
  };
  
  view.removeValue = function (val) {
    var valueToRemove = val || "";
    Array.from(view.querySelectorAll("[data-lynx-container-input-value]"))
      .filter(valueView => valueToRemove === valueView.value)
      .map(valueView => valueView.parentElement)
      .forEach(itemView => itemView.parentElement.removeChild(itemView));
  };
  
  return containers.buildChildViews(node)
    .then(function (childViews) {
      childViews.forEach(appendChildView);
      return view;
    });
}
