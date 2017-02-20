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
  return new Promise(function (resolve, reject) {
    var fileReader = new FileReader();
    
    fileReader.onloadend = function (evt) {
      LYNX.parse(evt.target.result)
        .then(node => {
          return {
            content,
            node
          };
        })
        .then(builders.nodeViewBuilder)
        .then(resolve)
        .catch(reject);
    };
    
    fileReader.readAsText(content.blob);
  });
}
