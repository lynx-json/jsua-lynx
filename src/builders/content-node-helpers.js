import url from "url";

export function getBlob(node) {
  var data = node.value.data || "";
  
  if (typeof data === "object") {
    // JSON was parsed by Lynx JSON parser
    // convert it back to a string
    data = JSON.stringify(data);
  }
  
  var buf = new Buffer(data, node.value.encoding || "utf8");
  var blob = new Blob([buf], { type: node.value.type });
  
  return blob;
}

export function getPromiseForRequest(node) {
  if (node.value.src) {
    var src = url.resolve(node.base || "", node.value.src);
    return Promise.resolve({ url: src });
  }
  
  if (node.value.data && typeof node.value.data === "object") {
    if (node.value.type && node.value.type.indexOf("application/lynx+json") > -1) {
      // this Lynx JSON has already been parsed
      // we can optimize (do not serialize or parse again) 
      // its transferring and building by using the "lynx" protocol
      
      var request = {
        url: "lynx:?ts=" + new Date().valueOf(),
        options: {
          document: node.value.data
        }
      };
      
      return Promise.resolve(request);
    }
  }
  
  return new Promise(function (resolve) {
    var blob = getBlob(node);
    var fileReader = new FileReader();
    
    fileReader.onloadend = function (evt) {
      resolve({ url: evt.target.result });
    };
    
    fileReader.readAsDataURL(blob);
  });
}
