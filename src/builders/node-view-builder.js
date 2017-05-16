import * as building from "../building";
import * as resolver from "./resolve-view-builder";
import * as validation from "./validation";
import * as options from "./options";
import * as util from "../util";

function hasScope(node) {
  return node.value &&
    typeof node.value === "object" &&
    "scope" in node.value;
}

function didNotUnderstandNodeViewBuilder(node) {
  return document.createElement("div");
}

export function nodeViewBuilder(node) {
  if (!node) return Promise.reject(new Error("'node' param is required."));
  if (!node.spec) return Promise.reject(new Error("'spec' property not found."));
  if (!node.spec.hints || node.spec.hints.length === 0) return Promise.reject(new Error("'hints' property not found or zero length."));

  if (node.spec.input && node.spec.input === true) node.spec.input = node.spec.name;

  var input = !!node.spec.input;
  var hints = node.spec.hints;
  var builder = resolver.resolveViewBuilder(building.registrations, hints, input);

  if (!builder) builder = didNotUnderstandNodeViewBuilder;

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
    if (input) view.setAttribute("data-lynx-input", node.spec.input);
    if (node.spec.labeledBy) view.setAttribute("data-lynx-labeled-by", node.spec.labeledBy);
    if (node.spec.submitter) addSubmitterExtensionsToView(view, node.spec.submitter);
    if (node.spec.validation || node.spec.hints.some(hint => hint === "form")) validation.addValidationExtensionsToView(view, node.spec.validation || {});
    if (node.spec.option) view.setAttribute("data-lynx-option", "true");
    if (node.spec.options) options.addOptionsExtensionsToView(view, node.spec);
    if (node.spec.hints.indexOf("marker") > -1 && node.value && node.value.for) view.setAttribute("data-lynx-marker-for", node.value.for);
    // data-lynx-data-* properties
    return view;
  });
}

function addSubmitterExtensionsToView(view, submitterName) {
  function handleKeyDown(e) {
    if (e.keyCode !== 13) return;

    let submitter = util.findNearestView(view, "[data-lynx-name='" + submitterName + "']");

    if (submitter && submitter.click && typeof (submitter.click) === "function") {
      e.stopPropagation();
      e.preventDefault();
      submitter.click();
    }
  }
  view.setAttribute("data-lynx-submitter", submitterName);
  view.addEventListener("keydown", handleKeyDown);
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
