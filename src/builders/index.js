import * as building from "../building";

export function nodeViewBuilder(result) {
  if (!result) throw new Error("'result' param is required.");
  
  var node = result.node;
  if (!node) throw new Error("'node' param is required.");
  if (!node.spec) throw new Error("'spec' property not found.");
  if (!node.spec.hints || node.spec.hints.length === 0) throw new Error("'hints' property not found or zero length.");
  
  var len = node.spec.hints.length;
  var input = !!node.spec.input;
  var registration;
  
  function matches(hint) {
    return function (registration) {
      return registration.hint === hint && registration.input === input;  
    };
  }
  
  for (var i = 0; i < len; i++) {
    let hint = node.spec.hints[i].name;
    registration = building.registrations.find(matches(hint));
    if (registration) break;
  }
  
  if (!registration) throw new Error("No registration found for node (input = " + input + ") and (hints = " + node.spec.hints.map(hint => hint.name).join(", ") + ").");
  
  return registration.builder(result);
}

export function textViewBuilder(result) {
  var view = document.createElement("pre");
  view.textContent = result.node.value !== null ? result.node.value.toString() : "";
  return view;
}
