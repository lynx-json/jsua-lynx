import { contentViewBuilder } from "./content-view-builder";

export function imageViewBuilder(node) {
  return contentViewBuilder(node).then(function (view) {
    var embeddedView = view.lynxGetEmbeddedView();
    if (!embeddedView) return view;
    
    var height = parseInt(node.value.height);
    if (height) embeddedView.setAttribute("data-lynx-height", height);

    var width = parseInt(node.value.width);
    if (width) embeddedView.setAttribute("data-lynx-width", width);
    
    return view;
  });
}
