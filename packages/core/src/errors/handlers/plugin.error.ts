import { ToolNovaError } from "../tool-nova.error";
import { ErrorContext } from "../error.types";

export class PluginError extends ToolNovaError {
  public readonly pluginId: string;

  constructor(
    pluginId: string,
    message: string,
    context?: Partial<ErrorContext>
  ) {
    super({
      code: context?.code || "PLUGIN_001",
      message: `[Plugin: ${pluginId}] ${message}`,
      severity: "high",
      category: "plugin",
      details: { pluginId },
      ...context,
    });
    this.name = "PluginError";
    this.pluginId = pluginId;
  }

  static notFound(pluginId: string): PluginError {
    return new PluginError(pluginId, "Plugin not found", {
      code: "PLUGIN_001",
    });
  }

  static alreadyRegistered(pluginId: string): PluginError {
    return new PluginError(pluginId, "Plugin already registered", {
      code: "PLUGIN_002",
    });
  }

  static invalidManifest(pluginId: string, details: string): PluginError {
    return new PluginError(pluginId, `Invalid manifest: ${details}`, {
      code: "PLUGIN_003",
    });
  }

  static loadFailed(pluginId: string, cause: Error): PluginError {
    return new PluginError(pluginId, `Load failed: ${cause.message}`, {
      code: "PLUGIN_004",
      cause,
    });
  }

  static executionFailed(pluginId: string, cause: Error): PluginError {
    return new PluginError(pluginId, `Execution failed: ${cause.message}`, {
      code: "PLUGIN_005",
      retryable: true,
      cause,
    });
  }

  static validationFailed(pluginId: string, details: string): PluginError {
    return new PluginError(pluginId, `Validation failed: ${details}`, {
      code: "PLUGIN_006",
    });
  }

  static dependencyMissing(pluginId: string, dependency: string): PluginError {
    return new PluginError(pluginId, `Missing dependency: ${dependency}`, {
      code: "PLUGIN_007",
    });
  }
}
