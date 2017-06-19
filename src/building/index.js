import * as LYNX from "@lynx-json/lynx-parser";
import * as builders from "../builders";
import * as util from "../util";

export var registrations = [];

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

      var doc;
      LYNX.parse(evt.target.result, { location: content.url, resolveSpecURL: util.resolveSpecFromUrl })
        .then(node => doc = node)
        .then(builders.nodeViewBuilder)
        .then(view => {
          if (content.options && content.options.startedAt) view.setAttribute("data-transfer-started-at", content.options.startedAt.valueOf());
          view.setAttribute("data-content-url", content.url);
          view.setAttribute("data-content-type", content.blob.type);
          if (doc.realm) view.setAttribute("data-lynx-realm", doc.realm);
          if (doc.context) view.setAttribute("data-lynx-context", doc.context);
          if (doc.focus) view.setAttribute("data-lynx-focus", doc.focus);
          return view;
        })
        .then(resolve, reject);
    };

    fileReader.readAsText(content.blob);
  });
}
