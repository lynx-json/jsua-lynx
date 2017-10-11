import * as containers from "./container-view-builder";
import url from "url";
import * as util from "../util";
import { fetch } from "@lynx-json/jsua";

export function submitViewBuilder(node) {
  var view = document.createElement("button");
  
  if (node.base) {
    view.formAction = url.resolve(node.base, node.value.action);  
  } else {
    view.formAction = node.value.action;
  }
  
  if (node.value.method) view.formMethod = node.value.method;
  if (node.value.enctype) view.formEnctype = node.value.enctype;
    
  var sendDirective = getSendDirective(node);
  if (sendDirective) {
    view.setAttribute("data-lynx-send", sendDirective);
    addSendExtensionToView(view);
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

function getSendDirective(node) {
  if (node.value.send === "change" || node.spec.send === "change") return "change";
  if (node.value.send === "ready") return "ready";
}

function addSendExtensionToView(view) {
  view.addEventListener("jsua-attach", function () {
    var sendDirective = view.getAttribute("data-lynx-send");
    var formView = util.findNearestAncestorView(view, "[data-lynx-hints~=form]");
    
    function autoSubmitFormIfValid() {
      if (formView && formView.lynxGetValidationState() === "invalid") return;
      view.click();
    }
    
    if (sendDirective === "ready") {
      setTimeout(function () {
        view.click();
      }, 10);
    } else if (sendDirective === "change") {
      formView.addEventListener("lynx-validated", autoSubmitFormIfValid);
      
      view.addEventListener("jsua-detach", function () {
        formView.removeEventListener("lynx-validated", autoSubmitFormIfValid);
      });
    }
  });
}
