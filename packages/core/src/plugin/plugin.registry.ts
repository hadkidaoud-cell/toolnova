import { Plugin } from "./interfaces/plugin";
import { PluginDuplicateError, PluginNotFoundError } from "./errors/plugin.errors";

export class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private enabled: Set<string> = new Set();

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.manifest.id)) {
      throw new PluginDuplicateError(plugin.manifest.id);
    }
    this.plugins.set(plugin.manifest.id, plugin);
    this.enabled.add(plugin.manifest.id);
  }

  unregister(id: string): void {
    if (!this.plugins.has(id)) {
      throw new PluginNotFoundError(id);
    }
    this.plugins.delete(id);
    this.enabled.delete(id);
  }

  get(id: string): Plugin {
    const plugin = this.plugins.get(id);
    if (!plugin) throw new PluginNotFoundError(id);
    return plugin;
  }

  getSafe(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabled(): Plugin[] {
    return this.getAll().filter((p) => this.enabled.has(p.manifest.id));
  }

  getDisabled(): Plugin[] {
    return this.getAll().filter((p) => !this.enabled.has(p.manifest.id));
  }

  enable(id: string): void {
    if (!this.plugins.has(id)) {
      throw new PluginNotFoundError(id);
    }
    this.enabled.add(id);
  }

  disable(id: string): void {
    if (!this.plugins.has(id)) {
      throw new PluginNotFoundError(id);
    }
    this.enabled.delete(id);
  }

  isEnabled(id: string): boolean {
    return this.enabled.has(id);
  }

  isRegistered(id: string): boolean {
    return this.plugins.has(id);
  }

  count(): number {
    return this.plugins.size;
  }

  countEnabled(): number {
    return this.enabled.size;
  }

  has(id: string): boolean {
    return this.plugins.has(id);
  }

  clear(): void {
    this.plugins.clear();
    this.enabled.clear();
  }

  getByCategory(category: string): Plugin[] {
    return this.getEnabled().filter((p) => p.manifest.category === category);
  }

  getByTag(tag: string): Plugin[] {
    return this.getEnabled().filter((p) => p.manifest.tags.includes(tag));
  }

  getFeatured(): Plugin[] {
    return this.getEnabled().filter((p) => p.manifest.featured);
  }

  search(query: string): Plugin[] {
    const lower = query.toLowerCase();
    return this.getEnabled().filter(
      (p) =>
        p.manifest.name.toLowerCase().includes(lower) ||
        p.manifest.description.toLowerCase().includes(lower) ||
        p.manifest.tags.some((t: string) => t.toLowerCase().includes(lower))
    );
  }
}

export const pluginRegistry = new PluginRegistry();
