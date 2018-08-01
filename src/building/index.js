import * as LYNX from "@lynx-json/lynx-parser";
import * as builders from "../builders";
import * as util from "../util";
import * as nodes from "../builders/node-view-builder";

export var registrations = [];
nodes.setRegistrations(registrations);

export function register(hint, builder, condition) {
  if (!hint) throw new Error("'hint' param is required.");
  if (!builder) throw new Error("'builder' param is required.");
  if (condition && typeof condition !== "function") throw new Error("'condition' param must be a function.");

  var newRegistration = { hint, builder, condition };
  var oldRegistration = registrations.find(registration => registration.hint === hint && registration.condition === condition);

  if (oldRegistration) {
    let index = registrations.indexOf(oldRegistration);
    registrations[index] = newRegistration;
  } else {
    registrations.push(newRegistration);
  }
}

export function build(content) {
  if (!content) return Promise.reject(new Error("'content' param is required."));
  if (!content.blob) return Promise.reject(new Error("'content' object must have a 'blob' property."));

  return new Promise(function (resolve, reject) {
    var fileReader = new FileReader();

    fileReader.onloadend = function (evt) {
      if (!evt) reject(new Error("'evt' param is required."));
      if (evt.target === undefined) reject(new Error("'evt' object must have a 'target' property."));
      if (evt.target.result === undefined) reject(new Error("'evt.target' object must have a 'result' property."));

      LYNX.parse(evt.target.result, { location: content.url, resolveSpecURL: util.resolveSpecFromUrl })
        .then(function (document) {
          content.options = content.options || {};
          content.options.document = document;
          return content;
        })
        .then(exports.documentViewBuilder)
        .then(resolve, reject);
    };

    fileReader.readAsText(content.blob);
  });
}

export function documentViewBuilder(content) {
  return Promise.resolve(content.options.document)
  .then(builders.nodeViewBuilder)
  .then(view => {
    if (content.options.startedAt) view.setAttribute("data-transfer-started-at", content.options.startedAt.valueOf());
    if (content.url) view.setAttribute("data-content-url", content.url);
    if (content.blob && content.blob.type) view.setAttribute("data-content-type", content.blob.type);
    if (content.options.document.realm) view.setAttribute("data-lynx-realm", content.options.document.realm);
    if (content.options.document.context) view.setAttribute("data-lynx-context", content.options.document.context);
    if (content.options.document.focus) view.setAttribute("data-lynx-focus", content.options.document.focus);
    return view;
  });
}

export function setNodeViewBuilder(builder) {
  nodes.nodeViewBuilder = builder;
}
