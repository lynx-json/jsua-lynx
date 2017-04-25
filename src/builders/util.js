export function findNearestElement(view, selector) {
  if (!view || !selector || view.matches("html")) return null;
  return view.querySelector(selector) || findNearestElement(view.parentElement, selector);
}

export function findNearestAncestor(view, selector) {
  if (!view || !selector || view.matches("html")) return null;
  var parent = view.parentElement;
  if (parent && parent.matches(selector)) return parent;
  return findNearestAncestor(parent, selector);
}

export function buildFormData(submitView) {
  var formView = exports.findNearestAncestor(submitView, "[data-lynx-hints~=form]");
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
