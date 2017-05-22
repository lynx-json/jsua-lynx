import url from "url";

export function getBlob(node) {
  var data = node.value.data || "";
  
  if (typeof data === "object") {
    if (node.value.type.indexOf("application/lynx+json") > -1) {
      data.base = data.base || node.base;
    }
    
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
  
  return new Promise(function (resolve) {
    var blob = getBlob(node);
    var fileReader = new FileReader();
    
    fileReader.onloadend = function (evt) {
      resolve({ url: evt.target.result });
    };
    
    fileReader.readAsDataURL(blob);
  });
}
