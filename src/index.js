import * as building from "./building";
import * as builders from "./builders";

building.register("text", builders.textViewBuilder);

export {
  building,
  builders
};
