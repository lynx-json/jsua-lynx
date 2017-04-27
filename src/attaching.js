import * as util from "./util";
import * as url from "url";

export function scopeRealmAttacher(result) {
  var origin = exports.getOrigin(result);
  if (!origin) return;
  
  var view = result.view;
  
  var context = view.getAttribute("data-lynx-context");
  if (exports.isOutOfContext(origin, context)) return { discard: true };
  
  var realm = view.getAttribute("data-lynx-realm");
  if (!realm) return;
  
  var nearestContentView = exports.findNearestScopedContentView(origin, realm);
  if (!nearestContentView) return;
  
  return {
    attach: function () {
      return nearestContentView.lynxSetEmbeddedView(result.view, result.content.blob);
    }
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
    return exports.scopeIncludesRealm(context, url) || 
      exports.scopeIncludesRealm(context, realm);
  });
  
  return !contextView;
}

export function scopeIncludesRealm(scope, realm) {
  if (!scope || !realm) return false;
  scope = url.parse(scope).href;
  realm = url.parse(realm).href;
  return realm.indexOf(scope) === 0;
}

export function findNearestScopedContentView(origin, realm) {
  return util.findNearestView(origin, "[data-lynx-hints~=content][data-lynx-scope]", function (matching) {
    var scope = matching.getAttribute("data-lynx-scope");
    return exports.scopeIncludesRealm(scope, realm);
  });
}
