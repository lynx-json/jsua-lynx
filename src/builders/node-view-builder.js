import * as building from "../building";
import * as resolver from "./resolve-view-builder";

function hasScope(node) {
  return node.value &&
    typeof node.value === "object" &&
    "scope" in node.value;
}

export function nodeViewBuilder(node) {
  if (!node) throw new Error("'node' param is required.");
  if (!node.spec) throw new Error("'spec' property not found.");
  if (!node.spec.hints || node.spec.hints.length === 0) throw new Error("'hints' property not found or zero length.");
  
  var input = !!node.spec.input;
  var hints = node.spec.hints.map(hint => hint.name);
  var builder = resolver.resolveViewBuilder(building.registrations, hints, input);
  
  if (!builder) throw new Error("No builder registered for node with input=" + input + " and hints=" + hints.join(","));
  var view = builder(node);
  
  // Apply common node view attributes...
  view.setAttribute("data-lynx-hints", node.spec.hints.map(hint => hint.name).join(" "));
  if (node.spec.visibility) view.setAttribute("data-lynx-visibility", node.spec.visibility);
  if (node.spec.name) view.setAttribute("data-lynx-name", node.spec.name);
  if (hasScope(node)) view.setAttribute("data-lynx-scope", node.value.scope);
  if (input) view.setAttribute("data-lynx-input", "true");
  if (node.spec.options) view.setAttribute("data-lynx-options", node.spec.options);
  if (node.spec.option) view.setAttribute("data-lynx-option", "true");
  if (node.spec.labeledBy) view.setAttribute("data-lynx-labeled-by", node.spec.labeledBy);
  // data-lynx-marker-for
  // data-lynx-validation-formatted
  // data-lynx-validation-state
  // view.lynx.validation = node.spec.validation
  // data-lynx-data-* properties
  // data-lynx-submitter (submit should handle this)
  
  return view;
}
