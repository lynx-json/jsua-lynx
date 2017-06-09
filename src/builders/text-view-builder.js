export function textViewBuilder(node) {
  var view = document.createElement("div");
  var textView = document.createElement("pre");

  view.appendChild(textView);

  if (node.value === null || node.value === undefined) {
    textView.textContent = "";
  } else {
    textView.textContent = node.value.toString();
  }

  view.lynxGetValue = function () {
    return textView.textContent;
  };

  return view;
}
