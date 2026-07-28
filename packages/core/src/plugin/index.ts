// Interfaces
export type {
  Plugin,
  PluginManifest,
  PluginSchema,
  PluginSEO,
  PluginIcon,
  PluginPermissions,
  PluginContext,
  PluginResult,
} from "./interfaces";

// Errors
export {
  PluginError,
  PluginNotFoundError,
  PluginDuplicateError,
  PluginInvalidError,
  PluginExecutionError,
} from "./errors";

// Validator
export { PluginValidator, pluginValidator } from "./plugin.validator";
export type { PluginValidationError } from "./plugin.validator";

// Registry
export { PluginRegistry, pluginRegistry } from "./plugin.registry";

// Loader
export { PluginLoader, pluginLoader } from "./plugin.loader";

// Manager
export { PluginManager, pluginManager } from "./plugin.manager";
export type { PluginManagerConfig } from "./plugin.manager";
