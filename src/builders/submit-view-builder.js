import * as containers from "./container-view-builder";
import * as url from "url";
import * as util from "../util";
import { fetch } from "jsua";

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
  
  view.addEventListener("click", function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    
    var formAction = view.formAction;
    var formMethod = view.formMethod && view.formMethod.toUpperCase() || "GET";
    var options = {
      method: formMethod,
      origin: view
    };
    
    var formData = util.buildFormData(view);

    if (formData) {
      if (formMethod === "POST" || formMethod === "PUT") {
        options.body = formData;
      } else {
        var temp = url.parse(formAction);
        temp.search = "?" + formData.toString();
        formAction = url.format(temp);
      }
    }

    fetch(formAction, options);
  });
  
  return containers.buildChildViews(node)
    .then(function (childViews) {
      childViews.forEach(childView => view.appendChild(childView));
      
      if (view.children.length === 0) {
        view.textContent = "Submit";
      }
      
      return view;
    });
}
