// ============================================================
// ToolNova Tools - Plugin Registry
// Register all tools here
// ============================================================

import { pluginRegistry } from "@/plugins";
import { wordCounterPlugin } from "./word-counter";

// Register all plugins
pluginRegistry.registerAll([
  wordCounterPlugin,
]);

export { pluginRegistry };
