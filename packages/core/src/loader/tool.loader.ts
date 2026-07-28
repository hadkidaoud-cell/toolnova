import { Tool } from "../types";
import { toolRegistry } from "../registry";
import { parseToolDefinition } from "../parser";
import type { ToolDefinition } from "../parser";

export { type ToolDefinition } from "../parser";

export class ToolLoader {
  private definitions: Map<string, ToolDefinition> = new Map();

  define(id: string, definition: ToolDefinition): void {
    this.definitions.set(id, definition);
  }

  defineMany(entries: Record<string, ToolDefinition>): void {
    for (const [id, def] of Object.entries(entries)) {
      this.define(id, def);
    }
  }

  load(definition: ToolDefinition): Tool {
    const tool = parseToolDefinition(definition);
    toolRegistry.register(tool);
    return tool;
  }

  loadAll(): Tool[] {
    const loaded: Tool[] = [];

    for (const definition of this.definitions.values()) {
      const tool = this.load(definition);
      loaded.push(tool);
    }

    return loaded;
  }

  clear(): void {
    this.definitions.clear();
  }

  count(): number {
    return this.definitions.size;
  }
}

export const toolLoader = new ToolLoader();
