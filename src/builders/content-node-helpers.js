import url from "url";
import { transferring } from "@lynx-json/jsua";

export var brokenContent = {
  url: "",
  blob: new Blob(['<svg fill="#000000" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z"/></svg>'], { type: "image/svg+xml" })
};

export function getPromiseForContent(source, base) {
  if (source.src) {
    var src = url.resolve(base || "", source.src);
    
    let request = { url: src };
    if (source.type) request.options = { type: source.type };
    
    return transferring.transfer(request)
      .catch(function (err) {
        console.log("Error transferring content for embedded view:", request.url, err);
        return brokenContent;
      });
  } else if (source.data) {
    var data = source.data || "";
    
    if (typeof data === "object") {
      data = JSON.stringify(data);
    }
    
    var buf = new Buffer(data, source.encoding || "utf8");
    var blob = new Blob([buf], { type: source.type });
    blob.name = "";
    
    var content = { 
      url: "", 
      blob: blob,
      options: {
        base: base
      }
    };
    
    return Promise.resolve(content);
  }
  
  return Promise.resolve({ url: "", blob: null });
}

export function areBlobsEqual(left, right) {
  if (left && !right) return Promise.resolve(false);
  if (!left && right) return Promise.resolve(false);
  if (!left && !right) return Promise.resolve(true);
  if (left.size !== right.size) return Promise.resolve(false);
  
  var mediaTypeExp = /^([^\/]*)\/([^;]*)(;|$)/;
  var leftMediaType = mediaTypeExp.exec(left.type);
  var rightMediaType = mediaTypeExp.exec(right.type);
  var mediaTypesAreEqual = leftMediaType &&
    rightMediaType &&
    leftMediaType.length >= 3 &&
    rightMediaType.length >= 3 &&
    leftMediaType[1] === rightMediaType[1] &&
    leftMediaType[2] === rightMediaType[2];
  
  if (!mediaTypesAreEqual) return Promise.resolve(true);
  
  return new Promise(function (resolve) {
    var leftFileReader = new FileReader();
    
    leftFileReader.onload = function () {
      var leftBytes = leftFileReader.result;
      var rightFileReader = new FileReader();
      
      rightFileReader.onload = function () {
        var rightBytes = rightFileReader.result;
        
        for (var i = 0; i < leftBytes.length; i++) {
          if (leftBytes[i] !== rightBytes[i]) return resolve(false);
        }
        
        resolve(true);
      };
      
      rightFileReader.onerror = function () {
        resolve(false);
      };
      
      rightFileReader.readAsArrayBuffer(right);
    };
    
    leftFileReader.onerror = function () {
      resolve(false);
    };
    
    leftFileReader.readAsArrayBuffer(left);
  });  
}
