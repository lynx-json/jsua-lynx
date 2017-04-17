import * as building from "../building";
import * as resolver from "./resolve-view-builder";
import { addValidationExtensionsToView } from "./validation";

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
    if (node.spec.validation) addValidationExtensionsToView(view, node.spec.validation);
    // data-lynx-marker-for
    // data-lynx-validation-formatted
    // data-lynx-data-* properties
    return view;
  });
}

function addVisibilityExtensionsToView(view, initialVisibility) {
  view.lynxGetVisibility = function () {
    return view.getAttribute("data-lynx-visibility");
  };
  
  view.lynxSetVisibility = function (visibility) {
    if (view.lynxGetVisibility() === visibility) return;
    view.setAttribute("data-lynx-visibility", visibility);
    raiseVisibilityChangedEvent(view);
  };
  
  initialVisibility = initialVisibility || "visible";
  view.setAttribute("data-lynx-visibility", initialVisibility);
  
  if (initialVisibility !== "concealed" && initialVisibility !== "revealed") return;
  
  var concealmentControlView = exports.createConcealmentControlView(view);
  if (view.firstElementChild) {
    view.insertBefore(concealmentControlView, view.firstElementChild);
  } else {
    view.appendChild(concealmentControlView);
  }
}

function raiseVisibilityChangedEvent(view) {
  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("lynx-visibility-change", true, false);
  view.dispatchEvent(changeEvent);
}

export function createConcealmentControlView(view) {
  let visibilityControlView = document.createElement("button");
  visibilityControlView.type = "button";
  visibilityControlView.setAttribute("data-lynx-visibility-conceal", true);
  
  
  var concealView = document.createTextNode("Conceal");
  
  view.lynxGetConcealView = function () {
    return concealView;
  };
  
  view.lynxSetConcealView = function (cv) {
    concealView = cv;
    synchronizeVisibilityControlView();
  };
  
  
  var revealView = document.createTextNode("Reveal");
  
  view.lynxGetRevealView = function () {
    return revealView;
  };
  
  view.lynxSetRevealView = function (rv) {
    revealView = rv;
    synchronizeVisibilityControlView();
  };
  
  
  function synchronizeVisibilityControlView() {
    while (visibilityControlView.firstChild) {
      visibilityControlView.removeChild(visibilityControlView.firstChild);
    }
    
    var visibility = view.lynxGetVisibility();
    
    if (visibility === "concealed") {
      visibilityControlView.appendChild(view.lynxGetRevealView());
    } else if (visibility === "revealed") {
      visibilityControlView.appendChild(view.lynxGetConcealView());
    } else {
      view.removeEventListener("lynx-visibility-change", synchronizeVisibilityControlView);
      view.removeChild(visibilityControlView);
      delete view.lynxGetConcealView;
      delete view.lynxSetConcealView;
      delete view.lynxGetRevealView;
      delete view.lynxSetRevealView;
      visibilityControlView = revealView = concealView = null;
    }
  }
  
  
  view.addEventListener("lynx-visibility-change", synchronizeVisibilityControlView);
  
  
  visibilityControlView.addEventListener("click", function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    
    var visibility = view.lynxGetVisibility();
    
    if (visibility === "concealed") {
      view.lynxSetVisibility("revealed");
    } else if (visibility === "revealed") {
      view.lynxSetVisibility("concealed");
    }
  });
  
  synchronizeVisibilityControlView();
  
  return visibilityControlView;
}
