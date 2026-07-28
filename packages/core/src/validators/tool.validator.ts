import { Tool, ToolStatus, ToolPermission, InputType } from "../types";

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

const VALID_STATUSES: ToolStatus[] = ["draft", "published", "archived", "deprecated"];
const VALID_PERMISSIONS: ToolPermission[] = ["public", "authenticated", "admin"];
const VALID_VISIBILITIES = ["public", "hidden", "private"];
const VALID_INPUT_TYPES: InputType[] = [
  "text", "number", "boolean", "file", "color",
  "select", "textarea", "date", "range", "json",
];
const VALID_OUTPUT_TYPES = ["text", "html", "json", "file", "data-url"];

export function validateTool(tool: Partial<Tool>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!tool.id || typeof tool.id !== "string" || tool.id.trim() === "") {
    errors.push({ field: "id", message: "Tool id is required and must be a non-empty string", code: "REQUIRED" });
  }

  if (!tool.slug || typeof tool.slug !== "string" || tool.slug.trim() === "") {
    errors.push({ field: "slug", message: "Tool slug is required and must be a non-empty string", code: "REQUIRED" });
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.slug)) {
    errors.push({ field: "slug", message: "Tool slug must be lowercase alphanumeric with hyphens", code: "INVALID_FORMAT" });
  }

  if (!tool.name || typeof tool.name !== "string" || tool.name.trim() === "") {
    errors.push({ field: "name", message: "Tool name is required and must be a non-empty string", code: "REQUIRED" });
  } else if (tool.name.length > 100) {
    errors.push({ field: "name", message: "Tool name must be 100 characters or less", code: "MAX_LENGTH" });
  }

  if (!tool.description || typeof tool.description !== "string" || tool.description.trim() === "") {
    errors.push({ field: "description", message: "Tool description is required and must be a non-empty string", code: "REQUIRED" });
  } else if (tool.description.length > 500) {
    errors.push({ field: "description", message: "Tool description must be 500 characters or less", code: "MAX_LENGTH" });
  }

  if (tool.longDescription !== undefined && typeof tool.longDescription !== "string") {
    errors.push({ field: "longDescription", message: "Tool longDescription must be a string", code: "INVALID_TYPE" });
  }

  if (!tool.category || typeof tool.category !== "string") {
    errors.push({ field: "category", message: "Tool category is required and must be a string", code: "REQUIRED" });
  }

  if (tool.tags !== undefined) {
    if (!Array.isArray(tool.tags)) {
      errors.push({ field: "tags", message: "Tool tags must be an array", code: "INVALID_TYPE" });
    } else if (tool.tags.some((t) => typeof t !== "string")) {
      errors.push({ field: "tags", message: "Tool tags must contain only strings", code: "INVALID_ITEMS" });
    }
  }

  if (tool.keywords !== undefined) {
    if (!Array.isArray(tool.keywords)) {
      errors.push({ field: "keywords", message: "Tool keywords must be an array", code: "INVALID_TYPE" });
    } else if (tool.keywords.some((k) => typeof k !== "string")) {
      errors.push({ field: "keywords", message: "Tool keywords must contain only strings", code: "INVALID_ITEMS" });
    }
  }

  if (!tool.author || typeof tool.author !== "object") {
    errors.push({ field: "author", message: "Tool author is required and must be an object", code: "REQUIRED" });
  } else {
    if (!tool.author.name || typeof tool.author.name !== "string") {
      errors.push({ field: "author.name", message: "Tool author name is required and must be a string", code: "REQUIRED" });
    }
  }

  if (!tool.version || typeof tool.version !== "object") {
    errors.push({ field: "version", message: "Tool version is required and must be an object", code: "REQUIRED" });
  } else {
    if (!tool.version.current || typeof tool.version.current !== "string") {
      errors.push({ field: "version.current", message: "Tool version current is required and must be a string", code: "REQUIRED" });
    }
    if (tool.version.history !== undefined && !Array.isArray(tool.version.history)) {
      errors.push({ field: "version.history", message: "Tool version history must be an array", code: "INVALID_TYPE" });
    }
  }

  if (!tool.seo || typeof tool.seo !== "object") {
    errors.push({ field: "seo", message: "Tool seo is required and must be an object", code: "REQUIRED" });
  } else {
    if (!tool.seo.title || typeof tool.seo.title !== "string") {
      errors.push({ field: "seo.title", message: "Tool seo title is required and must be a string", code: "REQUIRED" });
    }
    if (!tool.seo.description || typeof tool.seo.description !== "string") {
      errors.push({ field: "seo.description", message: "Tool seo description is required and must be a string", code: "REQUIRED" });
    }
    if (!Array.isArray(tool.seo.keywords)) {
      errors.push({ field: "seo.keywords", message: "Tool seo keywords must be an array", code: "INVALID_TYPE" });
    }
  }

  if (tool.permissions !== undefined && !VALID_PERMISSIONS.includes(tool.permissions)) {
    errors.push({ field: "permissions", message: `Tool permissions must be one of: ${VALID_PERMISSIONS.join(", ")}`, code: "INVALID_ENUM" });
  }

  if (tool.visibility !== undefined && !VALID_VISIBILITIES.includes(tool.visibility)) {
    errors.push({ field: "visibility", message: `Tool visibility must be one of: ${VALID_VISIBILITIES.join(", ")}`, code: "INVALID_ENUM" });
  }

  if (tool.status !== undefined && !VALID_STATUSES.includes(tool.status)) {
    errors.push({ field: "status", message: `Tool status must be one of: ${VALID_STATUSES.join(", ")}`, code: "INVALID_ENUM" });
  }

  if (tool.inputs !== undefined) {
    if (!Array.isArray(tool.inputs)) {
      errors.push({ field: "inputs", message: "Tool inputs must be an array", code: "INVALID_TYPE" });
    } else {
      tool.inputs.forEach((input, i) => {
        if (!input.id) errors.push({ field: `inputs[${i}].id`, message: "Input id is required", code: "REQUIRED" });
        if (!input.name) errors.push({ field: `inputs[${i}].name`, message: "Input name is required", code: "REQUIRED" });
        if (!input.type || !VALID_INPUT_TYPES.includes(input.type)) {
          errors.push({ field: `inputs[${i}].type`, message: `Input type must be one of: ${VALID_INPUT_TYPES.join(", ")}`, code: "INVALID_ENUM" });
        }
        if (!input.label) errors.push({ field: `inputs[${i}].label`, message: "Input label is required", code: "REQUIRED" });
      });
    }
  }

  if (tool.outputs !== undefined) {
    if (!Array.isArray(tool.outputs)) {
      errors.push({ field: "outputs", message: "Tool outputs must be an array", code: "INVALID_TYPE" });
    } else {
      tool.outputs.forEach((output, i) => {
        if (!output.id) errors.push({ field: `outputs[${i}].id`, message: "Output id is required", code: "REQUIRED" });
        if (!output.name) errors.push({ field: `outputs[${i}].name`, message: "Output name is required", code: "REQUIRED" });
        if (!output.type || !VALID_OUTPUT_TYPES.includes(output.type)) {
          errors.push({ field: `outputs[${i}].type`, message: `Output type must be one of: ${VALID_OUTPUT_TYPES.join(", ")}`, code: "INVALID_ENUM" });
        }
        if (!output.label) errors.push({ field: `outputs[${i}].label`, message: "Output label is required", code: "REQUIRED" });
      });
    }
  }

  return errors;
}

export function isValidTool(tool: Partial<Tool>): boolean {
  return validateTool(tool).length === 0;
}
