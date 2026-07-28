export class PluginError extends Error {
  constructor(
    message: string,
    public readonly pluginId: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "PluginError";
  }
}

export class PluginNotFoundError extends PluginError {
  constructor(pluginId: string) {
    super(`Plugin not found: ${pluginId}`, pluginId, "PLUGIN_NOT_FOUND");
    this.name = "PluginNotFoundError";
  }
}

export class PluginDuplicateError extends PluginError {
  constructor(pluginId: string) {
    super(`Duplicate plugin: ${pluginId}`, pluginId, "PLUGIN_DUPLICATE");
    this.name = "PluginDuplicateError";
  }
}

export class PluginInvalidError extends PluginError {
  constructor(pluginId: string, details: string) {
    super(`Invalid plugin ${pluginId}: ${details}`, pluginId, "PLUGIN_INVALID");
    this.name = "PluginInvalidError";
  }
}

export class PluginExecutionError extends PluginError {
  constructor(pluginId: string, details: string) {
    super(`Execution error in plugin ${pluginId}: ${details}`, pluginId, "PLUGIN_EXECUTION_ERROR");
    this.name = "PluginExecutionError";
  }
}
