import { Plugin, PluginManifest, PluginSchema, ToolInput, ToolOutput } from "./interfaces/plugin";

export interface PluginValidationError {
  field: string;
  message: string;
  code: string;
}

export class PluginValidator {
  validate(plugin: Partial<Plugin>): PluginValidationError[] {
    const errors: PluginValidationError[] = [];

    if (!plugin.manifest || typeof plugin.manifest !== "object") {
      errors.push({ field: "manifest", message: "Plugin manifest is required", code: "REQUIRED" });
      return errors;
    }

    errors.push(...this.validateManifest(plugin.manifest));

    if (plugin.schema) {
      errors.push(...this.validateSchema(plugin.schema));
    }

    if (plugin.seo) {
      errors.push(...this.validateSEO(plugin.seo));
    }

    if (plugin.permissions) {
      errors.push(...this.validatePermissions(plugin.permissions));
    }

    if (!plugin.execute || typeof plugin.execute !== "function") {
      errors.push({ field: "execute", message: "Plugin execute function is required", code: "REQUIRED" });
    }

    return errors;
  }

  validateManifest(manifest: PluginManifest): PluginValidationError[] {
    const errors: PluginValidationError[] = [];

    if (!manifest.id || typeof manifest.id !== "string") {
      errors.push({ field: "manifest.id", message: "Manifest id is required", code: "REQUIRED" });
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.id)) {
      errors.push({ field: "manifest.id", message: "Manifest id must be lowercase alphanumeric with hyphens", code: "INVALID_FORMAT" });
    }

    if (!manifest.name || typeof manifest.name !== "string") {
      errors.push({ field: "manifest.name", message: "Manifest name is required", code: "REQUIRED" });
    }

    if (!manifest.version || typeof manifest.version !== "string") {
      errors.push({ field: "manifest.version", message: "Manifest version is required", code: "REQUIRED" });
    } else if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      errors.push({ field: "manifest.version", message: "Manifest version must be semver (e.g., 1.0.0)", code: "INVALID_FORMAT" });
    }

    if (!manifest.description || typeof manifest.description !== "string") {
      errors.push({ field: "manifest.description", message: "Manifest description is required", code: "REQUIRED" });
    }

    if (!manifest.author || typeof manifest.author !== "string") {
      errors.push({ field: "manifest.author", message: "Manifest author is required", code: "REQUIRED" });
    }

    if (!manifest.category || typeof manifest.category !== "string") {
      errors.push({ field: "manifest.category", message: "Manifest category is required", code: "REQUIRED" });
    }

    if (manifest.tags !== undefined && !Array.isArray(manifest.tags)) {
      errors.push({ field: "manifest.tags", message: "Manifest tags must be an array", code: "INVALID_TYPE" });
    }

    return errors;
  }

  validateSchema(schema: PluginSchema): PluginValidationError[] {
    const errors: PluginValidationError[] = [];

    if (!Array.isArray(schema.inputs)) {
      errors.push({ field: "schema.inputs", message: "Schema inputs must be an array", code: "INVALID_TYPE" });
    }

    if (!Array.isArray(schema.outputs)) {
      errors.push({ field: "schema.outputs", message: "Schema outputs must be an array", code: "INVALID_TYPE" });
    }

    if (Array.isArray(schema.inputs)) {
      schema.inputs.forEach((input: ToolInput, i: number) => {
        if (!input.id) errors.push({ field: `schema.inputs[${i}].id`, message: "Input id is required", code: "REQUIRED" });
        if (!input.name) errors.push({ field: `schema.inputs[${i}].name`, message: "Input name is required", code: "REQUIRED" });
        if (!input.type) errors.push({ field: `schema.inputs[${i}].type`, message: "Input type is required", code: "REQUIRED" });
        if (!input.label) errors.push({ field: `schema.inputs[${i}].label`, message: "Input label is required", code: "REQUIRED" });
      });
    }

    if (Array.isArray(schema.outputs)) {
      schema.outputs.forEach((output: ToolOutput, i: number) => {
        if (!output.id) errors.push({ field: `schema.outputs[${i}].id`, message: "Output id is required", code: "REQUIRED" });
        if (!output.name) errors.push({ field: `schema.outputs[${i}].name`, message: "Output name is required", code: "REQUIRED" });
        if (!output.type) errors.push({ field: `schema.outputs[${i}].type`, message: "Output type is required", code: "REQUIRED" });
        if (!output.label) errors.push({ field: `schema.outputs[${i}].label`, message: "Output label is required", code: "REQUIRED" });
      });
    }

    return errors;
  }

  validateSEO(seo: Partial<Plugin["seo"]>): PluginValidationError[] {
    const errors: PluginValidationError[] = [];

    if (!seo.title || typeof seo.title !== "string") {
      errors.push({ field: "seo.title", message: "SEO title is required", code: "REQUIRED" });
    }

    if (!seo.description || typeof seo.description !== "string") {
      errors.push({ field: "seo.description", message: "SEO description is required", code: "REQUIRED" });
    }

    if (!Array.isArray(seo.keywords)) {
      errors.push({ field: "seo.keywords", message: "SEO keywords must be an array", code: "INVALID_TYPE" });
    }

    return errors;
  }

  validatePermissions(permissions: Partial<Plugin["permissions"]>): PluginValidationError[] {
    const errors: PluginValidationError[] = [];
    const validPermissions = ["public", "authenticated", "admin"];
    const validVisibilities = ["public", "hidden", "private"];

    if (permissions.permissions && !validPermissions.includes(permissions.permissions)) {
      errors.push({ field: "permissions.permissions", message: `Must be one of: ${validPermissions.join(", ")}`, code: "INVALID_ENUM" });
    }

    if (permissions.visibility && !validVisibilities.includes(permissions.visibility)) {
      errors.push({ field: "permissions.visibility", message: `Must be one of: ${validVisibilities.join(", ")}`, code: "INVALID_ENUM" });
    }

    return errors;
  }

  isValid(plugin: Partial<Plugin>): boolean {
    return this.validate(plugin).length === 0;
  }
}

export const pluginValidator = new PluginValidator();
