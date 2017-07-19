import * as containers from "./container-view-builder";
import url from "url";
import { fetch } from "@lynx-json/jsua";

export function createDataUri(link) {
  var contentType = link.type;
  var encoding = link.encoding || "utf-8";
  
  if (!contentType) throw new Error("A link with a 'data' property must have a valid 'type' property.");
  if (encoding !== "utf-8" && encoding !== "base64") throw new Error("The 'encoding' property value for a link must be 'utf-8' or 'base64'.");
  
  var dataUri = "data:" + contentType;
  
  if (encoding === "base64") {
    dataUri += ";base64,";
  } else {
    dataUri += ",";
  }
  
  var isJSON = /\/json|\+json/;
  
  if (encoding === "utf-8" && isJSON.test(contentType)) {
    dataUri += JSON.stringify(link.data);
  } else {
    dataUri += link.data;
  }
  
  return dataUri;
}

export function linkViewBuilder(node) {
  var view = document.createElement("a");
  
  if (node.value.data) {
    node.value.href = exports.createDataUri(node.value);
  }
  
  if (node.base) {
    view.href = url.resolve(node.base, node.value.href);  
  } else {
    view.href = node.value.href;
  }
  
  view.type = node.value.type;
  
  var followTimeout = tryGetFollowTimeout(node);
  
  if (followTimeout) {
    view.addEventListener("jsua-attach", function () {
      setTimeout(function () {
        view.click();
      }, followTimeout);
    });
  }
  
  view.addEventListener("click", function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    fetch(view.href, { origin: view });
  });
  
  return containers.buildChildViews(node)
    .then(function (childViews) {
      childViews.forEach(childView => view.appendChild(childView));
      
      if (view.children.length === 0) {
        view.textContent = view.href;
      }
      
      return view;
    });
}

function tryGetFollowTimeout(node) {
  var follow = +node.value.follow;
  if (isNaN(follow)) follow = +node.spec.follow;
  if (isNaN(follow)) return;
  return follow < 10 ? 10 : follow;
}
