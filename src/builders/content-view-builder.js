import { getBlob, getPromiseForRequest, areBlobsEqual } from "./content-node-helpers";
import { transferring, building } from "@lynx-json/jsua";

const brokenContentBlob = new Blob(['<svg fill="#000000" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z"/></svg>'], { type: "image/svg+xml" });

export function contentViewBuilder(node) {
  return new Promise(function (resolve, reject) {
    var view = document.createElement("div");

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
      return new Promise(function (resolve) {
        view.lynxHasValue(blob).then(function (hasValue) {
          if (hasValue) {
            return resolve();
          }
          
          value = blob;

          if (!blob) {
            setEmbeddedView(null);
            return resolve(view);
          }

          var content = {
            url: blob.name || "",
            blob: blob
          };

          Promise.resolve(content)
            .then(building.build)
            .catch(function (err) {
              console.log("Error building embedded view for content:", err);
              return building.build({
                url: "",
                blob: brokenContentBlob
              });
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

    if (!node.value) return resolve(view);

    if ("data" in node.value) {
      return view.lynxSetValue(getBlob(node)).then(resolve, reject);
    } else if ("src" in node.value) {
      return getPromiseForRequest(node)
        .then(transferring.transfer)
        .catch(function (err) {
          console.log("Error transferring content for embedded view from: " + node.value.src);
          return {
            url: "",
            blob: brokenContentBlob
          };
        })
        .then(function (content) {
          content.blob.name = content.url;
          return view.lynxSetValue(content.blob);
        }).then(resolve, reject);
    }
    
    resolve(view);
  });
}
