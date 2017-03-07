import * as nodes from "./node-view-builder";

export function containerViewBuilder(node) {
  var view = document.createElement("div");
  
  return buildChildViews(node)
    .then(function (childViews) {
      childViews.forEach(childView => view.appendChild(childView));
      return view;
    });
}

export function buildChildViews(node) {
  function isNotNullOrUndefined(childNode) {
    return childNode !== undefined && childNode !== null;
  }
  
  if (node.value === undefined || node.value === null) return Promise.resolve([]);
  
  if (Array.isArray(node.value)) {
    let promisesForChildViews = node.value.map(child => {
        child.base = node.base;
        return child;
      }).map(nodes.nodeViewBuilder);
      
    return Promise.all(promisesForChildViews);
  }
  
  if (typeof node.value === "object") {
    if (!Array.isArray(node.spec.children)) return Promise.resolve([]);
    
    let promisesForChildViews = node.spec.children
      .map(childSpec => node.value[childSpec.name])
      .filter(isNotNullOrUndefined)
      .map(child => {
        child.base = node.base;
        return child;
      })
      .map(nodes.nodeViewBuilder);
    
    return Promise.all(promisesForChildViews);
  }
  
  console.log("Unable to determine child nodes for node: ", node);
  return Promise.resolve([]);
}
