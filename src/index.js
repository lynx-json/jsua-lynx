import * as building from "./building";
import * as builders from "./builders";

building.register("text", builders.textViewBuilder);
building.register("text", builders.textInputViewBuilder, true);

export {
  building,
  builders
};
