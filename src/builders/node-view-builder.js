import * as building from "../building";
import * as resolver from "./resolve-view-builder";

export function nodeViewBuilder(node) {
  if (!node) throw new Error("'node' param is required.");
  if (!node.spec) throw new Error("'spec' property not found.");
  if (!node.spec.hints || node.spec.hints.length === 0) throw new Error("'hints' property not found or zero length.");
  
  var input = !!node.spec.input;
  var hints = node.spec.hints.map(hint => hint.name);
  var builder = resolver.resolveViewBuilder(building.registrations, hints, input);
  
  if (!builder) throw new Error("No builder registered for node with input=" + input + " and hints=" + hints.join(","));
  var view = builder(node);
  
  // apply common view attributes
  
  return view;
}
