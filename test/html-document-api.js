if (typeof window !== "undefined") return;

var jsdom = require("jsdom").jsdom;
global.document = jsdom();
global.window = document.defaultView;
global.Blob = window.Blob;
global.FileReader = window.FileReader;
