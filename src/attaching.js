import * as util from "./util";
import url from "url";
import * as markers from "./markers";
import * as options from "./options";

export function scopeRealmAttacher(result) {
  var origin = exports.getOrigin(result);
  if (!origin) return;

  var view = result.view;

  var context = view.getAttribute("data-lynx-context");
  if (exports.isOutOfContext(origin, context)) return { discard: true };

  var transferStartedAt = view.getAttribute("data-transfer-started-at");
  if (exports.isStaleContent(origin, transferStartedAt)) return { discard: true };

  var realm = view.getAttribute("data-lynx-realm");
  if (!realm) return;

  var nearestContentView = exports.findNearestScopedContentView(origin, realm);
  if (!nearestContentView) return;

  return {
    attach: function () {
      var detachedViews = nearestContentView.lynxSetEmbeddedView(result.view, result.content.blob);
      setFocusedView(result.view);
      return detachedViews;
    }
  };
}

export function createRootAttacher(rootView) {
  if (!rootView) throw new Error("'rootView' param is required.");

  markers.initialize(rootView);
  options.initialize(rootView);

  return function rootAttacher(result) {
    if (!rootView) return;

    function attachViewToRoot() {
      var detachedViews = [];

      while (rootView.firstElementChild) {
        detachedViews.push(rootView.removeChild(rootView.firstElementChild));
      }

      rootView.appendChild(result.view);

      var focusedView = exports.setFocusedView(result.view);
      if (!focusedView) result.view.setAttribute("data-jsua-focus", true);

      return detachedViews;
    }

    return {
      attach: attachViewToRoot
    };
  };
}

export function getOrigin(result) {
  if (!result) return;
  if (!result.content) return;
  if (!result.content.options) return;
  return result.content.options.origin;
}

export function isOutOfContext(origin, context) {
  if (!context) return false;

  var contextView = util.findNearestView(origin, "[data-content-url],[data-lynx-realm]", function (matching) {
    var url = matching.getAttribute("data-content-url");
    var realm = matching.getAttribute("data-lynx-realm");
    return util.scopeIncludesRealm(context, url) ||
      util.scopeIncludesRealm(context, realm);
  });

  return !contextView;
}

export function isStaleContent(origin, transferStartedAt) {
  transferStartedAt = parseInt(transferStartedAt);
  if (!transferStartedAt) return false;
  var newerAncestor = util.findNearestAncestorView(origin, "[data-transfer-started-at]", function (matching) {
    var ancestorStartedAt = parseInt(matching.getAttribute("data-transfer-started-at"));
    if (!ancestorStartedAt) return false;
    return ancestorStartedAt > transferStartedAt;
  });

  return !!newerAncestor;
}

export function findNearestScopedContentView(origin, realm) {
  return util.findNearestView(origin, "[data-lynx-hints~=content][data-lynx-scope]", function (matching) {
    var scope = matching.getAttribute("data-lynx-scope");
    return util.scopeIncludesRealm(scope, realm);
  });
}

export function setFocusedView(view) {
  var focusedViewName;

  if (view.hasAttribute("data-content-url")) {
    var contentUrl = url.parse(view.getAttribute("data-content-url"));
    if (contentUrl.hash) focusedViewName = contentUrl.hash.substring(1);
  }

  if (!focusedViewName && view.hasAttribute("data-lynx-focus")) focusedViewName = view.getAttribute("data-lynx-focus");
  if (!focusedViewName) return;

  var focusedView = util.findNearestView(view, "[data-lynx-name='" + focusedViewName + "']");
  if (!focusedView) return;

  if (focusedView.lynxGetFocusableView) {
    focusedView = focusedView.lynxGetFocusableView();
  }

  focusedView.setAttribute("data-jsua-focus", true);
  return focusedView;
}
