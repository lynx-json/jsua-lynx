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
    
    let request = { url: src };
    if (node.value.type) request.options = { type: node.value.type };
    
    return Promise.resolve(request);
  }
  
  if (node.value.data && typeof node.value.data === "object") {
    if (node.value.type && node.value.type.indexOf("application/lynx+json") > -1) {
      // this Lynx JSON has already been parsed
      // we can optimize (do not serialize or parse again) 
      // its transferring and building by using the "lynx" protocol
      
      let request = {
        url: "lynx:?ts=" + new Date().valueOf(),
        options: {
          document: node.value.data,
          type: node.value.type
        }
      };
      
      return Promise.resolve(request);
    }
  }
  
  return new Promise(function (resolve, reject) {
    var blob = getBlob(node);
    var fileReader = new FileReader();
    
    fileReader.onloadend = function (evt) {
      var request = { 
        url: evt.target.result, 
        options: { 
          type: node.value.type 
        } 
      };
      
      resolve(request);
    };
    
    fileReader.onerror = function (evt) {
      reject(evt.target.error);
    };
    
    fileReader.readAsDataURL(blob);
  });
}
