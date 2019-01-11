import * as containers from "./container-view-builder";
import url from "url";
import * as util from "../util";
import { fetch } from "@lynx-json/jsua";

export function createDataUri(link) {
  var contentType = link.type;
  var encoding = link.encoding || "utf-8";

  if (encoding !== "utf-8" && encoding !== "base64") throw new Error("The 'encoding' property value for a link must be 'utf-8' or 'base64'.");

  var dataUri = "data:" + contentType;

  if (encoding === "base64") {
    dataUri += ";base64,";
  } else {
    dataUri += ",";
  }

  if (encoding === "utf-8" && typeof link.data !== "string") {
    dataUri += JSON.stringify(link.data);
  } else {
    dataUri += link.data;
  }

  return dataUri;
}

export function getHref(node) {
  var link = node.value;

  if ("data" in link) {
    // data
    if (!link.type) throw new Error("A link with a 'data' property must have a valid 'type' property.");

    if (link.type.indexOf("application/lynx+json") > -1) {
      return "lynx:?ts=" + new Date().valueOf();
    } else {
      return exports.createDataUri(link);
    }
  } else {
    // href
    return util.resolveUrlForNode(node, link.href);
  }
}

export function linkViewBuilder(node) {
  var view = document.createElement("a");
  var followTimerId;

  view.href = getHref(node);
  if (node.value.type) view.type = node.value.type;

  var followTimeout = tryGetFollowTimeout(node);

  function getOptions(automatic) {
    var options = { origin: view };

    if (automatic) options.automatic = true;

    if (view.protocol === "lynx:") {
      options.document = node.value.data;
    }

    return options;
  }

  if (followTimeout) {
    view.addEventListener("jsua-attach", function () {
      followTimerId = setTimeout(function () {
        fetch(view.href, getOptions(true));
      }, followTimeout);
    });
  }

  view.addEventListener("click", function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (followTimerId) clearTimeout(followTimerId);
    fetch(view.href, getOptions());
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
  if (node.value.follow === null) delete node.value.follow;
  if (node.spec.follow === null) delete node.spec.follow;
  var follow = +node.value.follow;
  if (isNaN(follow)) follow = +node.spec.follow;
  if (isNaN(follow)) return;
  return follow < 10 ? 10 : follow;
}
