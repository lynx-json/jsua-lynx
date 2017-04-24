import { getBlob, getPromiseForRequest } from "./content-node-helpers";
import { transferring, building } from "jsua";

function updateEmbeddedView(contentInputView, blob) {
  var oldEmbeddedView = contentInputView.querySelector("[data-lynx-content-view]");
  
  if (!blob) {
    if (oldEmbeddedView) contentInputView.removeChild(oldEmbeddedView);
    return Promise.resolve(contentInputView);
  }
  
  var content = {
    url: blob.name || "",
    blob: blob
  };
  
  return Promise.resolve(content)
    .then(building.build)
    .catch(function (err) {
      console.log("Error building embedded content view in content input view.", err);
    })
    .then(function (result) {
      var embeddedView;
      
      if (result && result.view) {
        embeddedView = result.view;
      } else {
        embeddedView = document.createElement("div");
        embeddedView.textContent = "View Unavailable";
      }
      
      embeddedView.setAttribute("data-lynx-embedded-view", true);
      
      if (oldEmbeddedView) {
        contentInputView.replaceChild(embeddedView, oldEmbeddedView);
      } else {
        contentInputView.appendChild(embeddedView);
      }
      
      return contentInputView;
    });
}

export function contentInputViewBuilder(node) {
  return new Promise(function (resolve, reject) {
    var view = document.createElement("div");
    
    var inputView = document.createElement("input");
    inputView.type = "file";
    inputView.name = node.spec.input.name || "";
    view.appendChild(inputView);
    
    var value = null;
    
    view.lynxGetValue = function () {
      return value;
    };
    
    view.lynxSetValue = function (blob) {
      if (view.lynxHasValue(blob)) return;
      value = blob;
      raiseValueChangeEvent(view);
      return updateEmbeddedView(view, value);
    };
    
    view.lynxClearValue = function () {
      view.lynxSetValue(null);
    };
    
    view.lynxHasValue = function (blob) {
      // TODO: this should compare blob.type and the bytes in the blob
      return value === blob;
    };
    
    inputView.addEventListener("change", function (evt) {
      view.lynxSetValue(inputView.files[0]);
    });
    
    if (!node.value) return resolve(view);
    
    var promiseForView;
    
    if ("data" in node.value) {
      promiseForView = view.lynxSetValue(getBlob(node));
    } else if ("src" in node.value) {
      promiseForView = getPromiseForRequest(node)
        .then(transferring.transfer)
        .catch(function (err) {
          // intentionally eat a transfer error here b/c primary task is file upload
          return null;
        })
        .then(function (content) {
          if (!content) return view;
          content.blob.name = content.url;
          return view.lynxSetValue(content.blob);
        });
    }
    
    promiseForView.then(resolve, reject);
  });
}

function raiseValueChangeEvent(view) {
  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("change", true, false);
  view.dispatchEvent(changeEvent);
}
