import * as building from "./building";
import * as builders from "./builders";
import * as attaching from "./attaching";
import * as util from "./util";

function isInput(node) {
  return !!node.spec.input;
}

building.register("container", builders.containerInputViewBuilder, isInput);
building.register("container", builders.containerViewBuilder);
building.register("form", builders.formViewBuilder);
building.register("content", builders.contentInputViewBuilder, isInput);
building.register("content", builders.contentViewBuilder);
building.register("image", builders.imageViewBuilder);
building.register("link", builders.linkViewBuilder);
building.register("submit", builders.submitViewBuilder);
building.register("text", builders.textInputViewBuilder, isInput);
building.register("text", builders.textViewBuilder);

export {
  building,
  builders,
  attaching,
  util
};
