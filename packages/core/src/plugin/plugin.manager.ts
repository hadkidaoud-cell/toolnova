import { Plugin, PluginContext, PluginResult } from "./interfaces/plugin";
import { pluginRegistry } from "./plugin.registry";
import { pluginLoader } from "./plugin.loader";
import { pluginValidator } from "./plugin.validator";
import { PluginNotFoundError, PluginInvalidError, PluginExecutionError, PluginDuplicateError } from "./errors/plugin.errors";

export interface PluginManagerConfig {
  autoEnable?: boolean;
  validateOnLoad?: boolean;
  logLevel?: "silent" | "error" | "warn" | "info" | "debug";
}

export class PluginManager {
  private config: PluginManagerConfig;

  constructor(config: PluginManagerConfig = {}) {
    this.config = {
      autoEnable: true,
      validateOnLoad: true,
      logLevel: "warn",
      ...config,
    };
  }

  load(plugin: Plugin): Plugin {
    this.log("info", `Loading plugin: ${plugin.manifest.id}`);

    if (this.config.validateOnLoad) {
      const errors = pluginValidator.validate(plugin);
      if (errors.length > 0) {
        throw new PluginInvalidError(
          plugin.manifest.id,
          errors.map((e) => `${e.field}: ${e.message}`).join("; ")
        );
      }
    }

    if (pluginRegistry.isRegistered(plugin.manifest.id)) {
      this.log("warn", `Plugin already registered: ${plugin.manifest.id}`);
      throw new PluginDuplicateError(plugin.manifest.id);
    }

    const loaded = pluginLoader.load(plugin);

    if (this.config.autoEnable) {
      pluginRegistry.enable(loaded.manifest.id);
    }

    this.log("info", `Plugin loaded: ${loaded.manifest.id}`);
    return loaded;
  }

  loadMany(plugins: Plugin[]): Plugin[] {
    const results: Plugin[] = [];
    for (const plugin of plugins) {
      try {
        results.push(this.load(plugin));
      } catch (e) {
        this.log("error", `Failed to load ${plugin.manifest.id}: ${e instanceof Error ? e.message : e}`);
      }
    }
    return results;
  }

  unload(id: string): void {
    this.log("info", `Unloading plugin: ${id}`);
    pluginLoader.unload(id);
  }

  enable(id: string): void {
    if (!pluginRegistry.isRegistered(id)) {
      throw new PluginNotFoundError(id);
    }
    pluginRegistry.enable(id);
    this.log("info", `Plugin enabled: ${id}`);
  }

  disable(id: string): void {
    if (!pluginRegistry.isRegistered(id)) {
      throw new PluginNotFoundError(id);
    }
    pluginRegistry.disable(id);
    this.log("info", `Plugin disabled: ${id}`);
  }

  register(plugin: Plugin): Plugin {
    return this.load(plugin);
  }

  validate(plugin: Partial<Plugin>): ReturnType<typeof pluginValidator.validate> {
    return pluginValidator.validate(plugin);
  }

  execute(id: string, context: PluginContext): PluginResult | Promise<PluginResult> {
    if (!pluginRegistry.isEnabled(id)) {
      throw new PluginNotFoundError(id);
    }

    const plugin = pluginRegistry.get(id);

    if (plugin.validate) {
      const validationErrors = plugin.validate(context.inputs);
      if (validationErrors.length > 0) {
        throw new PluginExecutionError(id, `Validation failed: ${validationErrors.join(", ")}`);
      }
    }

    try {
      this.log("debug", `Executing plugin: ${id}`);
      const result = plugin.execute(context);
      this.log("debug", `Plugin executed: ${id}`);
      return result;
    } catch (e) {
      throw new PluginExecutionError(id, e instanceof Error ? e.message : "Unknown execution error");
    }
  }

  get(id: string): Plugin {
    return pluginRegistry.get(id);
  }

  getAll(): Plugin[] {
    return pluginRegistry.getAll();
  }

  getEnabled(): Plugin[] {
    return pluginRegistry.getEnabled();
  }

  getDisabled(): Plugin[] {
    return pluginRegistry.getDisabled();
  }

  isRegistered(id: string): boolean {
    return pluginRegistry.isRegistered(id);
  }

  isEnabled(id: string): boolean {
    return pluginRegistry.isEnabled(id);
  }

  count(): number {
    return pluginRegistry.count();
  }

  countEnabled(): number {
    return pluginRegistry.countEnabled();
  }

  search(query: string): Plugin[] {
    return pluginRegistry.search(query);
  }

  getByCategory(category: string): Plugin[] {
    return pluginRegistry.getByCategory(category);
  }

  getByTag(tag: string): Plugin[] {
    return pluginRegistry.getByTag(tag);
  }

  getFeatured(): Plugin[] {
    return pluginRegistry.getFeatured();
  }

  clear(): void {
    pluginLoader.clear();
    this.log("info", "All plugins cleared");
  }

  private log(level: string, message: string): void {
    const levels = ["silent", "error", "warn", "info", "debug"];
    const configLevel = levels.indexOf(this.config.logLevel || "warn");
    const messageLevel = levels.indexOf(level);

    if (messageLevel <= configLevel && configLevel > 0) {
      console.log(`[PluginManager] [${level.toUpperCase()}] ${message}`);
    }
  }
}

export const pluginManager = new PluginManager();
