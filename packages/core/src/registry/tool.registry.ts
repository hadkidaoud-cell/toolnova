import { Tool, ToolFilter } from "../types";
import { TOOL_FIELD_DEFAULTS } from "../defaults";
import { sortTools } from "../utils";
import { validateTool, ValidationError } from "../validators";
import { PAGINATION } from "../constants";

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool): void {
    const errors = validateTool(tool);
    if (errors.length > 0) {
      throw new Error(`Invalid tool: ${errors.map((e) => e.message).join(", ")}`);
    }

    this.tools.set(tool.id, {
      ...TOOL_FIELD_DEFAULTS,
      ...tool,
      slug: tool.slug || tool.id,
      version: tool.version || TOOL_FIELD_DEFAULTS.version,
      author: tool.author || TOOL_FIELD_DEFAULTS.author,
      seo: tool.seo || TOOL_FIELD_DEFAULTS.seo,
      permissions: tool.permissions || TOOL_FIELD_DEFAULTS.permissions,
      visibility: tool.visibility || TOOL_FIELD_DEFAULTS.visibility,
      status: tool.status || TOOL_FIELD_DEFAULTS.status,
      featured: tool.featured ?? TOOL_FIELD_DEFAULTS.featured,
      popularity: tool.popularity ?? TOOL_FIELD_DEFAULTS.popularity,
      inputs: tool.inputs || TOOL_FIELD_DEFAULTS.inputs,
      outputs: tool.outputs || TOOL_FIELD_DEFAULTS.outputs,
      tags: tool.tags || TOOL_FIELD_DEFAULTS.tags,
      keywords: tool.keywords || TOOL_FIELD_DEFAULTS.keywords,
    } as Tool);
  }

  unregister(id: string): boolean {
    return this.tools.delete(id);
  }

  get(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  getBySlug(slug: string): Tool | undefined {
    for (const tool of this.tools.values()) {
      if (tool.slug === slug) return tool;
    }
    return undefined;
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  count(): number {
    return this.tools.size;
  }

  filter(options: ToolFilter): Tool[] {
    let results = this.getAll();

    if (options.visible !== undefined) {
      const isVisible = options.visible;
      results = results.filter((t) => t.visibility === "public" ? isVisible : !isVisible);
    }

    if (options.featured !== undefined) {
      results = results.filter((t) => t.featured === options.featured);
    }

    if (options.status !== undefined) {
      results = results.filter((t) => t.status === options.status);
    }

    if (options.permissions !== undefined) {
      results = results.filter((t) => t.permissions === options.permissions);
    }

    if (options.category) {
      results = results.filter((t) => t.category === options.category);
    }

    if (options.tags && options.tags.length > 0) {
      results = results.filter((t) => options.tags!.some((tag) => t.tags.includes(tag)));
    }

    results = sortTools(results, options.sortBy, options.sortOrder);

    if (options.offset || options.limit) {
      const offset = options.offset ?? 0;
      const limit = options.limit ?? PAGINATION.defaultLimit;
      results = results.slice(offset, offset + limit);
    }

    return results;
  }

  featured(): Tool[] {
    return this.filter({ featured: true, visible: true });
  }

  byCategory(category: string): Tool[] {
    return this.filter({ category, visible: true });
  }

  published(): Tool[] {
    return this.filter({ status: "published" as const });
  }

  clear(): void {
    this.tools.clear();
  }

  validate(tool: Partial<Tool>): ValidationError[] {
    return validateTool(tool);
  }
}

export const toolRegistry = new ToolRegistry();
