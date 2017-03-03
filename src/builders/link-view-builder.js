export function linkViewBuilder(node) {
  var view = document.createElement("a");
  
  var href = node.document.resolveURI(node.value.href);
  rootElement.href = href;
  
  if (node.value.type) {
    rootElement.type = node.value.type;
  }

  function appendChild(child) {
    rootElement.appendChild(child);
  }
  
  function appendChildren(children) {
    if (children.length === 0) {
      rootElement.textContent = href;
    }
    else {
      children.forEach(appendChild);  
    }
  }
  
  return app.extensions.lynx.rendering.children(node)
    .then(appendChildren)
    .then(function () { return rootElement; });
    
  return view;
}
