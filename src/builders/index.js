import { resolveViewBuilder } from "./resolve-view-builder";
import * as nodes from "./node-view-builder";
import { textViewBuilder } from "./text-view-builder";
import { textInputViewBuilder } from "./text-input-view-builder";
import { containerViewBuilder } from "./container-view-builder";
import { containerInputViewBuilder } from "./container-input-view-builder";
import { formViewBuilder } from "./form-view-builder";
import { contentViewBuilder } from "./content-view-builder";
import { imageViewBuilder } from "./image-view-builder";
import { contentInputViewBuilder } from "./content-input-view-builder";
import { linkViewBuilder } from "./link-view-builder";
import { submitViewBuilder } from "./submit-view-builder";

var nodeViewBuilder = nodes.nodeViewBuilder;

export {
  resolveViewBuilder,
  nodeViewBuilder,
  textViewBuilder,
  textInputViewBuilder,
  containerViewBuilder,
  containerInputViewBuilder,
  formViewBuilder,
  contentViewBuilder,
  contentInputViewBuilder,
  imageViewBuilder,
  linkViewBuilder,
  submitViewBuilder
};
