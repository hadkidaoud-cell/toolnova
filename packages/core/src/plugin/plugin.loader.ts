import { Plugin } from "./interfaces/plugin";
import { pluginRegistry } from "./plugin.registry";
import { pluginValidator } from "./plugin.validator";
import { PluginInvalidError, PluginDuplicateError } from "./errors/plugin.errors";

export class PluginLoader {
  private loaded: Map<string, Plugin> = new Map();

  load(plugin: Plugin): Plugin {
    const errors = pluginValidator.validate(plugin);
    if (errors.length > 0) {
      throw new PluginInvalidError(
        plugin.manifest.id,
        errors.map((e) => e.message).join(", ")
      );
    }

    if (pluginRegistry.isRegistered(plugin.manifest.id)) {
      throw new PluginDuplicateError(plugin.manifest.id);
    }

    pluginRegistry.register(plugin);
    this.loaded.set(plugin.manifest.id, plugin);
    return plugin;
  }

  loadMany(plugins: Plugin[]): Plugin[] {
    const loaded: Plugin[] = [];
    const errors: Array<{ id: string; error: string }> = [];

    for (const plugin of plugins) {
      try {
        const loadedPlugin = this.load(plugin);
        loaded.push(loadedPlugin);
      } catch (e) {
        errors.push({
          id: plugin.manifest.id,
          error: e instanceof Error ? e.message : "Unknown error",
        });
      }
    }

    if (errors.length > 0) {
      console.warn(`Failed to load ${errors.length} plugins:`, errors);
    }

    return loaded;
  }

  unload(id: string): void {
    pluginRegistry.unregister(id);
    this.loaded.delete(id);
  }

  getLoaded(): Plugin[] {
    return Array.from(this.loaded.values());
  }

  isLoaded(id: string): boolean {
    return this.loaded.has(id);
  }

  count(): number {
    return this.loaded.size;
  }

  clear(): void {
    for (const id of this.loaded.keys()) {
      pluginRegistry.unregister(id);
    }
    this.loaded.clear();
  }
}

export const pluginLoader = new PluginLoader();
