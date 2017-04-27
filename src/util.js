export function findNearestView(view, selector, predicate) {
  if (!view || !selector || view.matches("[data-jsua-app]")) return null;
  
  var matching = view.querySelector(selector);
  if (!matching) return findNearestView(view.parentElement, selector, predicate);
  
  if (predicate) {
    if (predicate(matching)) return matching;
    return findNearestView(view.parentElement, selector, predicate);  
  }
  
  return matching;
}

export function findNearestAncestorView(view, selector) {
  if (!view || !selector || view.matches("[data-jsua-app]")) return null;
  var parent = view.parentElement;
  if (parent && parent.matches(selector)) return parent;
  return findNearestAncestorView(parent, selector);
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
  
  var inputViews = formView.querySelectorAll("[data-lynx-input]");

  Array.from(inputViews).forEach(function (inputView) {
    var inputValues = inputView.lynxGetValue();
    if (!Array.isArray(inputValues)) inputValues = [ inputValues ];
    
    inputValues.forEach(function (inputValue) {
      formData.append(inputView.getAttribute("data-lynx-input"), inputValue);  
    });
  });
  
  return formData;
}
