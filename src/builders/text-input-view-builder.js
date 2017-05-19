export function textInputViewBuilder(node) {
  var view = document.createElement("div");

  var isLine = node.spec.hints.some(function (hint) {
    return hint === "line";
  });

  var textView = isLine ?
    document.createElement("input") :
    document.createElement("textarea");

  textView.name = node.spec.input || "";

  if (node.value === null || node.value === undefined) {
    textView.value = "";
  } else {
    textView.value = node.value.toString();
  }

  view.appendChild(textView);

  view.lynxGetValue = function () {
    return textView.value;
  };

  view.lynxSetValue = function (val) {
    if (textView.value === val) return;
    textView.value = val;
    raiseValueChangeEvent(textView);
  };

  view.lynxHasValue = function (val) {
    return textView.value === val;
  };

  view.lynxClearValue = function () {
    view.lynxSetValue("");
  };

  return view;
}

function raiseValueChangeEvent(view) {
  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("change", true, false);
  view.dispatchEvent(changeEvent);
}
