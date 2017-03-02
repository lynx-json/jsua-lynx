export function textViewBuilder(node) {
  var view = document.createElement("pre");
  
  if (node.value === null || node.value === undefined) {
    view.textContent = "";  
  } else {
    view.textContent = node.value.toString();  
  }
  
  return view;
}
