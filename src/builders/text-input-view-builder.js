function createTextView(node, view) {
  var result;
  var isLine = node.spec.hints.some(function (hint) {
    return hint === "line";
  });

  if (isLine) {
    result = document.createElement("input");

    if (node.spec.visibility === "concealed") {
      result.type = "password";
    }

    if (node.spec.visibility === "concealed" || node.spec.visibility === "revealed") {
      view.addEventListener("lynx-visibility-change", function () {
        if (view.lynxGetVisibility() === "concealed") {
          result.type = "password";
        } else {
          result.type = "text";
        }
      });
    }
  } else {
    result = document.createElement("textarea");
  }

  return result;
}

export function textInputViewBuilder(node) {
  var view = document.createElement("div");
  var textView = createTextView(node, view);

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
    return Promise.resolve(textView.value === val);
  };

  view.lynxClearValue = function () {
    view.lynxSetValue("");
  };

  view.lynxGetFocusableView = function () {
    return textView;
  };

  return view;
}

function raiseValueChangeEvent(view) {
  var inputEvent = document.createEvent("Event");
  inputEvent.initEvent("input", true, false);
  view.dispatchEvent(inputEvent);

  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("change", true, false);
  view.dispatchEvent(changeEvent);
}
