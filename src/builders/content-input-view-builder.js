import { getBlob, getPromiseForRequest } from "./content-node-helpers";
import { transferring, building } from "@lynx-json/jsua";

export function contentInputViewBuilder(node) {
  return new Promise(function (resolve, reject) {
    var view = document.createElement("div");
    
    var inputView = document.createElement("input");
    inputView.type = "file";
    inputView.name = node.spec.input.name || "";
    view.appendChild(inputView);
    
    var value, embeddedView;
    
    function setEmbeddedView(newEmbeddedView) {
      var detached = [];
      
      if (embeddedView) {
        detached.push(view.removeChild(embeddedView));
      }
      
      embeddedView = newEmbeddedView;
      if (!embeddedView) return detached;
      
      view.appendChild(embeddedView);
      embeddedView.setAttribute("data-lynx-embedded-view", true);
      
      if (node.value && node.value.alt) {
        embeddedView.setAttribute("alt", node.value.alt);
      }
      
      return detached;
    }
    
    view.lynxGetValue = function () {
      return value;
    };
    
    view.lynxSetValue = function (blob) {
      if (view.lynxHasValue(blob)) return;
      value = blob;
      
      if (!blob) {
        setEmbeddedView(null);
        raiseValueChangeEvent(view);
        return Promise.resolve(view);
      }
      
      var content = {
        url: blob.name || "",
        blob: blob
      };
      
      return Promise.resolve(content)
        .then(building.build)
        .catch(function (err) {
          console.log("Error building the embedded view for a content input view.", err);
        })
        .then(function (result) {
          setEmbeddedView(result.view);
          raiseValueChangeEvent(view);
          return view;
        });
    };
    
    view.lynxClearValue = function () {
      view.lynxSetValue(null);
    };
    
    view.lynxHasValue = function (blob) {
      return value === blob; // TODO: fix this comparison
    };
    
    view.lynxSetEmbeddedView = function (newView, newBlob) {
      if (view.lynxHasValue(newBlob)) return;
      value = newBlob;
      
      var detached = setEmbeddedView(newView);
      raiseValueChangeEvent(view);
      
      return detached;
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
