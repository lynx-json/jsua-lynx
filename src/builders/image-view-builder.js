import { contentViewBuilder } from "./content-view-builder";

export function imageViewBuilder(node) {
  return contentViewBuilder(node).then(function (result) {
    var view = result.view;
    
    if (node.value.alt) {
      view.setAttribute("title", node.value.alt);
    }

    var height = parseInt(node.value.height);
    if (height) view.setAttribute("data-lynx-height", height);

    var width = parseInt(node.value.width);
    if (width) view.setAttribute("data-lynx-width", width);
    
    return view;
  });
}
