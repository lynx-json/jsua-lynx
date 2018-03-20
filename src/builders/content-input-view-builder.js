import { contentViewBuilder } from "./content-view-builder";

export function contentInputViewBuilder(node) {
  return contentViewBuilder(node).then(function (view) {
    var inputView = document.createElement("input");
    inputView.type = "file";
    inputView.name = node.spec.input || "";
    
    if (view.firstElementChild) {
      view.insertBefore(inputView, view.firstElementChild);  
    } else {
      view.appendChild(inputView);
    }
    
    inputView.addEventListener("change", function (evt) {
      view.lynxSetValue(inputView.files[0]);
    });
    
    var contentViewLynxSetValue = view.lynxSetValue;
    view.lynxSetValue = function (blob) {
      var result = contentViewLynxSetValue(blob);
      if (result) {
        return result.then(function (newEmbeddedView) {
          if (newEmbeddedView) raiseValueChangeEvent(view);
          return newEmbeddedView;
        });
      }
      
      return result;
    };
    
    return view;
  });
}

function raiseValueChangeEvent(view) {
  var inputEvent = document.createEvent("Event");
  inputEvent.initEvent("input", true, false);
  view.dispatchEvent(inputEvent);
  
  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("change", true, false);
  view.dispatchEvent(changeEvent);
}
