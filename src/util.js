import url from "url";
import * as jsua from "@lynx-json/jsua";

export function resolveSpecFromUrl(specUrl) {
  return new Promise(function (resolve, reject) {
    jsua.transferring.transfer({ url: specUrl })
      .catch(reject)
      .then(function (content) {
        let reader = new FileReader();
        reader.addEventListener("loadend", function () {
          resolve(JSON.parse(reader.result));
        });
        reader.readAsText(content.blob);
      })
      .catch(reject);
  });
}

export function findNearestView(view, selector, predicate, origin) {
  function query() {
    var result = Array.from(view.querySelectorAll(selector));

    if (view !== origin && view.matches(selector)) {
      result.push(view);
    }

    return result;
  }

  if (!view || !selector || view.matches("[data-jsua-context~=app]")) return null;
  origin = origin || view;

  var matches = query();
  if (matches.length === 0) return findNearestView(view.parentElement, selector, predicate, origin);

  if (predicate) {
    let matching = matches.find(predicate);
    if (matching) return matching;
    return findNearestView(view.parentElement, selector, predicate, origin);
  }

  return matches[0];
}

export function findNearestAncestorView(view, selector, predicate) {
  if (!view || !selector || view.matches("[data-jsua-context~=app]")) return null;
  var parent = view.parentElement;
  if (parent && parent.matches(selector) && (!predicate || predicate(parent))) return parent;
  return findNearestAncestorView(parent, selector, predicate);
}

export function buildFormData(submitView) {
  var formView = exports.findNearestAncestorView(submitView, "[data-lynx-hints~=form]");
  if (!formView) return null;

  var formData;

  if (submitView.formEnctype === "multipart/form-data") {
    formData = new FormData();
  } else {
    formData = new URLSearchParams();
  }

  var inputViews = formView.querySelectorAll("[data-lynx-input]:not([data-lynx-hints~=container])");

  Array.from(inputViews).forEach(function (inputView) {
    var inputValues = inputView.lynxGetValue();
    if (!Array.isArray(inputValues)) inputValues = [inputValues];

    inputValues.forEach(function (inputValue) {
      formData.append(inputView.getAttribute("data-lynx-input"), inputValue);
    });
  });

  return formData;
}

export function scopeIncludesRealm(scope, realm) {
  if (!scope || !realm) return false;
  scope = url.parse(scope).href;
  realm = url.parse(realm).href;
  return realm.indexOf(scope) === 0;
}
