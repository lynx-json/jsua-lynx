import * as building from "../building";
import * as resolver from "./resolve-view-builder";

function hasScope(node) {
  return node.value &&
    typeof node.value === "object" &&
    "scope" in node.value;
}

export function nodeViewBuilder(node) {
  if (!node) return Promise.reject(new Error("'node' param is required."));
  if (!node.spec) return Promise.reject(new Error("'spec' property not found."));
  if (!node.spec.hints || node.spec.hints.length === 0) return Promise.reject(new Error("'hints' property not found or zero length."));
  
  var input = !!node.spec.input;
  var hints = node.spec.hints;
  var builder = resolver.resolveViewBuilder(building.registrations, hints, input);
  
  if (!builder) return Promise.reject(new Error("No builder registered for node with input=" + input + " and hints=" + hints.join(",")));
  
  return new Promise(function (resolve, reject) {
    try {
      let view = builder(node);
      resolve(view);
    } catch (e) {
      reject(e);
    }
  }).then(function (view) {
    view.setAttribute("data-lynx-hints", node.spec.hints.join(" "));
    addVisibilityExtensionsToView(view, node.spec.visibility);
    if (node.spec.name) view.setAttribute("data-lynx-name", node.spec.name);
    if (hasScope(node)) view.setAttribute("data-lynx-scope", node.value.scope);
    if (input) view.setAttribute("data-lynx-input", "true");
    if (node.spec.options) view.setAttribute("data-lynx-options", node.spec.options);
    if (node.spec.option) view.setAttribute("data-lynx-option", "true");
    if (node.spec.labeledBy) view.setAttribute("data-lynx-labeled-by", node.spec.labeledBy);
    if (node.spec.submitter) view.setAttribute("data-lynx-submitter", node.spec.submitter);
    // data-lynx-marker-for
    // data-lynx-validation-formatted
    // data-lynx-validation-state
    // view.lynx.validation = node.spec.validation
    // data-lynx-data-* properties
    return view;
  });
}

function addVisibilityExtensionsToView(view, initialVisibility) {
  view.lynxGetVisibility = function () {
    return view.getAttribute("data-lynx-visibility");
  };
  
  view.lynxSetVisibility = function (visibility) {
    var priorVisibility = view.lynxGetVisibility();
    view.setAttribute("data-lynx-visibility", visibility);
    if (priorVisibility !== visibility) raiseVisibilityChangedEvent(view);
  };
  
  initialVisibility = initialVisibility || "visible";
  view.setAttribute("data-lynx-visibility", initialVisibility);
}

function raiseVisibilityChangedEvent(view) {
  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("lynx-visibility-change", true, false);
  view.dispatchEvent(changeEvent);
}
