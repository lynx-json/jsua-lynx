import * as containers from "./container-view-builder";
import * as nodes from "./node-view-builder";

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
    removeView.textContent = "-";
    removeView.addEventListener("click", function () {
      view.removeChild(itemView);
      raiseValueChangeEvent(view);
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
    view.lynxAddValue();
  });

  view.lynxAddValue = function (val) {
    function initializeChildNode() {
      var childNode = {
        base: node.base,
        spec: JSON.parse(JSON.stringify(node.spec.children))
      };

      if (!val) {
        childNode.value = null;
        return Promise.resolve(childNode);
      }

      if (childNode.spec.hints.some(hint => hint === "text")) {
        childNode.value = val;
        return Promise.resolve(childNode);
      }

      if (childNode.spec.hints.some(hint => hint === "content")) {
        return new Promise(function (resolve) {
          var reader = new FileReader();

          reader.onload = function () {
            childNode.value = {
              src: reader.result
            };
            resolve(childNode);
          };

          reader.onerror = function () {
            childNode.value = null;
            resolve(childNode);
          };

          reader.readAsDataURL(val);
        });
      }

      childNode.value = null;
      return Promise.resolve(childNode);
    }

    return initializeChildNode()
      .then(nodes.nodeViewBuilder)
      .then(appendChildView)
      .then(function (itemView) {
        raiseValueChangeEvent(view);
        return itemView;
      })
      .catch(function (err) {
        console.log("Error adding value to container input.", err);
      });
  };

  view.lynxRemoveValue = function (val) {
    var valueToRemove = val || "";

    var itemViewsToRemove = Array.from(view.querySelectorAll("[data-lynx-container-input-value]"))
      .filter(valueView => valueToRemove === valueView.lynxGetValue())
      .map(valueView => valueView.parentElement);

    if (itemViewsToRemove.length === 0) return;
    itemViewsToRemove.forEach(itemView => itemView.parentElement.removeChild(itemView));
    raiseValueChangeEvent(view);
  };

  view.lynxGetValue = function () {
    return Array.from(view.querySelectorAll("[data-lynx-container-input-value]"))
      .map(valueView => valueView.lynxGetValue());
  };

  view.lynxSetValue = function (values) {
    view.lynxClearValue();
    if (!values) return;

    if (!Array.isArray(values)) values = [values];
    values.forEach(value => view.lynxAddValue(value));
  };

  view.lynxHasValue = function (val) {
    var valueViews = Array.from(view.querySelectorAll("[data-lynx-container-input-value]"));
    var promisesForHasValue = valueViews.map(valueView => valueView.lynxHasValue(val));
    return Promise.all(promisesForHasValue)
      .then(hasValues => hasValues.some(hasValue => hasValue));
  };

  view.lynxClearValue = function () {
    Array.from(view.querySelectorAll("[data-lynx-container-input-item]"))
      .forEach(itemView => itemView.parentElement.removeChild(itemView));
  };

  return containers.buildChildViews(node)
    .then(function (childViews) {
      childViews.forEach(appendChildView);
      return view;
    });
}

function raiseValueChangeEvent(view) {
  var inputEvent = document.createEvent("Event");
  inputEvent.initEvent("input", true, false);
  view.dispatchEvent(inputEvent);

  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("change", true, false);
  view.dispatchEvent(changeEvent);
}
