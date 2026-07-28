// ============================================================
// ToolNova Plugin Base
// ============================================================

import type { ToolPlugin, ToolPluginProps } from "../types";

export function createToolPlugin(config: Omit<ToolPlugin, "isActive">): ToolPlugin {
  return {
    ...config,
    isActive: true,
  };
}

export const ToolPlaceholder: React.ComponentType<ToolPluginProps> = ({ plugin }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-4 text-4xl">🔧</div>
      <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
        {plugin.name}
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400">
        {plugin.description}
      </p>
      <p className="mt-4 text-sm text-neutral-500">
        Tool implementation coming soon...
      </p>
    </div>
  );
};
