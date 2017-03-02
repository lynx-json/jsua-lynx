export function textInputViewBuilder(node) {
  var view;
  
  var isLine = node.spec.hints.some(function (hint) { 
    return hint.name === "line";
  });
  
  if (isLine) {
    view = document.createElement("input");
    
    if (node.spec.visibility === "concealed") {
      view.type = "password";
    } else {
      view.type = "text";
    }
  } else {
     view = document.createElement("textarea");
  }
  
  view.name = node.spec.input.name || "";
  
  if (node.value === null || node.value === undefined) {
    view.value = "";
  } else {
    view.value = node.value.toString();
  }
  
  view.setAttribute("data-lynx-input", true);
  
  if (node.spec.options) view.setAttribute("data-lynx-options-value-hint", node.spec.hints[0].name);
  
  return view;
}
