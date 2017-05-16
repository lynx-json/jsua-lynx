import * as util from "./util";

export function initialize(rootView) {
  rootView.addEventListener("jsua-attach", function () {
    var markerViews = Array.from(rootView.querySelectorAll("[data-lynx-marker-for]"));
    if (markerViews.length === 0) return;
    
    var contexts = Array.from(rootView.querySelectorAll("[data-content-url],[data-lynx-realm]"))
      .reduce((acc, view) => {
        if (view.hasAttribute("data-content-url")) acc.push(view.getAttribute("data-content-url"));
        if (view.hasAttribute("data-lynx-realm")) acc.push(view.getAttribute("data-lynx-realm"));
        return acc;
      }, []);
    
    markerViews.forEach(markerView => {
      let scope = markerView.getAttribute("data-lynx-marker-for");
      let oldWhere = markerView.getAttribute("data-lynx-marker-where");
      let newWhere = "there";
      
      if (contexts.some(context => util.scopeIncludesRealm(scope, context))) newWhere = "here";
      if (oldWhere === newWhere) return;
      
      markerView.setAttribute("data-lynx-marker-where", newWhere);
      
      let changeEvent = document.createEvent("Event");
      let type = newWhere === "here" ? "lynx-marker-here" : "lynx-marker-there";
      changeEvent.initEvent(type, true, false);
      markerView.dispatchEvent(changeEvent);
    });
  });
}
