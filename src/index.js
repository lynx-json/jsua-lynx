import * as building from "./building";
import * as builders from "./builders";
import * as attaching from "./attaching";
import * as util from "./util";

building.register("container", builders.containerViewBuilder);
building.register("container", builders.containerInputViewBuilder, true);
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
  builders,
  attaching,
  util
};
