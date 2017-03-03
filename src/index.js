import * as building from "./building";
import * as builders from "./builders";

building.register("container", builders.containerViewBuilder);
building.register("link", builders.linkViewBuilder);
building.register("text", builders.textViewBuilder);
building.register("text", builders.textInputViewBuilder, true);

export {
  building,
  builders
};
