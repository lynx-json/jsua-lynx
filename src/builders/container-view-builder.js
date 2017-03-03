import * as nodes from "./node-view-builder";

export function containerViewBuilder(node) {
  var view = document.createElement("div");
  buildChildViews(node).forEach(childView => view.appendChild(childView));
  return view;
}

export function buildChildViews(node) {
  function isNotNullOrUndefined(childNode) {
    return childNode !== undefined && childNode !== null;
  }
  
  if (node.value === undefined || node.value === null) return [];
  
  if (Array.isArray(node.value)) {
    return node.value.map(nodes.nodeViewBuilder);
  }
  
  if (typeof node.value === "object") {
    if (!Array.isArray(node.spec.children)) return [];
    
    return node.spec.children
      .map(childSpec => node.value[childSpec.name])
      .filter(isNotNullOrUndefined)
      .map(nodes.nodeViewBuilder);
  }
  
  console.log("Unable to determine child nodes for node: ", node);
  return [];
}
