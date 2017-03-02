import * as LYNX from "lynx-parser";
import * as builders from "../builders";

export var registrations = [];

export function register(hint, builder, input) {
  if (!hint) throw new Error("'hint' param is required.");
  if (!builder) throw new Error("'builder' param is required.");
  input = input || false;
  
  var newRegistration = { hint, builder, input };
  var oldRegistration = registrations.find(registration => registration.hint === hint && registration.input === input);
  
  if (oldRegistration) {
    let index = registrations.indexOf(oldRegistration);
    registrations[index] = newRegistration;
  } else {
    registrations.push(newRegistration);
  }
}

export function build(content) {
  if (!content) return Promise.reject(new Error("'content' param is required."));
  if (!content.blob) return Promise.reject(new Error("'content' object must have a 'blob' property."));
  
  return new Promise(function (resolve, reject) {
    var fileReader = new FileReader();
    
    fileReader.onloadend = function (evt) {
      if (!evt) reject(new Error("'evt' param is required."));
      if (evt.target === undefined) reject(new Error("'evt' object must have a 'target' property."));
      if (evt.target.result === undefined) reject(new Error("'evt.target' object must have a 'result' property."));
      
      LYNX.parse(evt.target.result, { location: content.url })
        .then(builders.nodeViewBuilder)
        .then(resolve, reject);
    };
    
    fileReader.readAsText(content.blob);
  });
}