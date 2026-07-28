import type { Plugin } from "@toolnova/core";
import { manifest } from "./manifest";
import { schema } from "./schema";
import { seo } from "./seo";
import { icon } from "./icon";
import { permissions } from "./permissions";
import { tool, validator } from "./tool";

const wordCounterPlugin: Plugin = {
  manifest,
  schema,
  seo,
  icon,
  permissions,
  execute: tool,
  validate: validator,
};

export default wordCounterPlugin;
