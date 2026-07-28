// ============================================================
// ToolNova Plugin Registry
// ============================================================

import type {
  ToolPlugin,
  PluginRegistryInterface,
  PluginRegistration,
} from "../types";

class PluginRegistry implements PluginRegistryInterface {
  private plugins: Map<string, PluginRegistration> = new Map();

  register(plugin: ToolPlugin): void {
    if (this.plugins.has(plugin.slug)) {
      console.warn(`Plugin "${plugin.slug}" already registered. Skipping.`);
      return;
    }

    this.plugins.set(plugin.slug, {
      plugin,
      registeredAt: new Date(),
    });
  }

  registerAll(plugins: ToolPlugin[]): void {
    plugins.forEach((plugin) => this.register(plugin));
  }

  get(slug: string): ToolPlugin | undefined {
    return this.plugins.get(slug)?.plugin;
  }

  getAll(): ToolPlugin[] {
    return Array.from(this.plugins.values())
      .filter((reg) => reg.plugin.isActive)
      .map((reg) => reg.plugin);
  }

  getByCategory(category: string): ToolPlugin[] {
    return this.getAll().filter((plugin) => plugin.category === category);
  }

  search(query: string): ToolPlugin[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAll();

    return this.getAll().filter((plugin) => {
      const text = [
        plugin.name,
        plugin.description,
        plugin.category,
        ...plugin.keywords,
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }

  getPopular(limit: number = 10): ToolPlugin[] {
    return this.getAll()
      .filter((plugin) => plugin.isPopular)
      .slice(0, limit);
  }

  getNew(limit: number = 10): ToolPlugin[] {
    return this.getAll()
      .filter((plugin) => plugin.isNew)
      .slice(0, limit);
  }

  getCount(): number {
    return this.getAll().length;
  }
}

export const pluginRegistry = new PluginRegistry();
