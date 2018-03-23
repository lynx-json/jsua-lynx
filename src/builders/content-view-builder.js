import { brokenContent, getPromiseForContent, areBlobsEqual } from "./content-node-helpers";
import { media, building } from "@lynx-json/jsua";

export function contentViewBuilder(node) {
  var view = document.createElement("div");
  var value, embeddedView;

  function setEmbeddedView(newView) {
    var detached = [];
    
    embeddedView.parentElement.replaceChild(newView, embeddedView);
    detached.push(embeddedView);
    
    embeddedView = newView;
    embeddedView.setAttribute("data-lynx-embedded-view", true);

    if (node.value && node.value.alt) {
      embeddedView.setAttribute("alt", node.value.alt);
    }

    return detached;
  }

  view.lynxGetValue = function () {
    return value;
  };

  view.lynxSetValue = function (blobOrContent, isContent) {
    var blob, content;
    
    if (isContent) {
      content = blobOrContent;
      blob = content.blob;
    } else {
      blob = blobOrContent;
    }
    
    return new Promise(function (resolve) {
      view.lynxHasValue(blob).then(function (hasValue) {
        if (hasValue) {
          return resolve();
        }
        
        value = blob;

        if (!blob) {
          setEmbeddedView(document.createElement("div"));
          return resolve(view);
        }
        
        if (!content) {
          content = {
            url: blob.name || "",
            blob: blob
          };
        }

        Promise.resolve(content)
          .then(building.build)
          .catch(function (err) {
            console.log("Error building embedded view for content:", err);
            return building.build(brokenContent);
          })
          .then(function (result) {
            setEmbeddedView(result.view);
            resolve(view);
          });
      });  
    });
  };

  view.lynxClearValue = function () {
    view.lynxSetValue(null);
  };

  view.lynxHasValue = function (blob) {
    return areBlobsEqual(value, blob);
  };

  view.lynxSetEmbeddedView = function (newView, newBlob) {
    value = newBlob;
    return setEmbeddedView(newView);
  };
  
  view.lynxGetEmbeddedView = function () {
    return embeddedView;
  };
  
  embeddedView = document.createElement("div");
  embeddedView.setAttribute("role", "presentation");
  embeddedView.setAttribute("data-lynx-embedded-view", true);
  view.appendChild(embeddedView);

  if (!node.value) return Promise.resolve(view);
  
  function tryGetPromiseForView(source) {
    if (!media.supports(source)) return;
    
    return getPromiseForContent(source, node.base)
      .then(function (content) {
        return view.lynxSetValue(content, true);
      }).then(function () {
        return view;
      });
  }
  
  var sources = [];
  if (node.value.sources) node.value.sources.forEach(source => sources.push(source.value));
  sources.push(node.value);
  
  var promiseForView = sources.reduce(function (pv, cv) {
    if (pv) return pv;
    return tryGetPromiseForView(cv);
  }, null);
  
  return promiseForView || view.lynxSetValue(brokenContent.blob);
}
