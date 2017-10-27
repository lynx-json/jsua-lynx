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

  if (node.value.method) view.setAttribute("data-lynx-submit-method", node.value.method);
  if (node.value.enctype) view.setAttribute("data-lynx-submit-enctype", node.value.enctype);

  if ("change" === node.value.send || "change" === node.spec.send) {
    addSendOnChangeExtensionToView(view);
  }

  view.addEventListener("click", function (evt) {
    evt.preventDefault();
    evt.stopPropagation();

    var formAction = view.formAction;
    var formMethod = view.getAttribute("data-lynx-submit-method") && view.getAttribute("data-lynx-submit-method").toUpperCase() || "GET";
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

function addSendOnChangeExtensionToView(view) {
  view.addEventListener("jsua-attach", function () {
    var formView = util.findNearestAncestorView(view, "[data-lynx-hints~=form]");
    if (!formView) return;

    function autoSubmitFormIfValid() {
      if (formView.lynxGetValidationState() === "invalid") return;
      view.click();
    }

    formView.addEventListener("lynx-validated", autoSubmitFormIfValid);

    view.addEventListener("jsua-detach", function () {
      formView.removeEventListener("lynx-validated", autoSubmitFormIfValid);
    });
  });
}
