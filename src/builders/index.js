import * as building from "../building";

export function resolveViewBuilder(registrations, hints, input) {
  function matches(hint) {
    return function (registration) {
      return registration.hint === hint && registration.input === input;  
    };
  }
  
  var registration;
  hints.some(hint => {
    registration = registrations.find(matches(hint));
    return !!registration;
  });
  
  if (registration) return registration.builder;
  return null;
}

export function nodeViewBuilder(node) {
  if (!node) throw new Error("'node' param is required.");
  if (!node.spec) throw new Error("'spec' property not found.");
  if (!node.spec.hints || node.spec.hints.length === 0) throw new Error("'hints' property not found or zero length.");
  
  var input = !!node.spec.input;
  var hints = node.spec.hints.map(hint => hint.name);
  var builder = exports.resolveViewBuilder(building.registrations, hints, input);
  
  if (!builder) throw new Error("No builder registered for node with input=" + input + " and hints=" + hints.join(","));
  var view = builder(node);
  
  // apply common view attributes
  
  return view;
}

export function textViewBuilder(node) {
  var view = document.createElement("pre");
  
  if (node.value === null || node.value === undefined) {
    view.textContent = "";  
  } else {
    view.textContent = node.value.toString();  
  }
  
  return view;
}
