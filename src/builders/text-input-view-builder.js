export function textInputViewBuilder(node) {
  var view;
  
  var isLine = node.spec.hints.some(function (hint) { 
    return hint === "line";
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
  
  view.lynxGetValue = function () {
    return view.value;
  };
  
  view.lynxSetValue = function (val) {
    var priorValue = view.value;
    view.value = val;
    if (priorValue !== view.value) {
      raiseValueChangeEvent(view);
    }
  };
  
  return view;
}

function raiseValueChangeEvent(view) {
  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("change", true, false);
  view.dispatchEvent(changeEvent);
}
