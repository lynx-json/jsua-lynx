if (typeof window === "undefined") {
  var jsdom = require("jsdom").jsdom;
  global.document = jsdom();
  global.window = document.defaultView;
  global.Blob = window.Blob;
  global.FileReader = window.FileReader;
  global.CustomEvent = window.CustomEvent;
  global.Node = window.Node;
  global.FormData = window.FormData;
  
  if (!window.URLSearchParams) {
    window.URLSearchParams = require("url-search-params");
  }
  
  global.URLSearchParams = window.URLSearchParams;
}
