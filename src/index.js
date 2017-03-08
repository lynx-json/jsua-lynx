import * as building from "./building";
import * as builders from "./builders";

building.register("container", builders.containerViewBuilder);
building.register("form", builders.formViewBuilder);
building.register("content", builders.contentViewBuilder);
building.register("content", builders.contentInputViewBuilder, true);
building.register("image", builders.imageViewBuilder);
building.register("link", builders.linkViewBuilder);
building.register("submit", builders.submitViewBuilder);
building.register("text", builders.textViewBuilder);
building.register("text", builders.textInputViewBuilder, true);

export {
  building,
  builders
};
