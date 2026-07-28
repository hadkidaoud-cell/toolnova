import type {
  ToolInputDefinition,
  ToolInputResult,
} from "../types/tool-input";

export interface ToolValidationResult {
  valid: boolean;
  errors: ToolValidationError[];
  warnings: ToolValidationWarning[];
}

export interface ToolValidationError {
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

export interface ToolValidationWarning {
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/;
const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export class ToolValidator {
  private customValidators: Map<string, (value: unknown) => boolean> = new Map();

  registerValidator(name: string, fn: (value: unknown) => boolean): void {
    this.customValidators.set(name, fn);
  }

  validateInputs(
    inputs: ToolInputDefinition[],
    values: ToolInputResult
  ): ToolValidationResult {
    const errors: ToolValidationError[] = [];
    const warnings: ToolValidationWarning[] = [];

    for (const input of inputs) {
      const value = values[input.id];
      const inputErrors = this.validateInput(input, value);
      errors.push(...inputErrors.errors);
      warnings.push(...inputErrors.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  validateInput(
    definition: ToolInputDefinition,
    value: unknown
  ): { errors: ToolValidationError[]; warnings: ToolValidationWarning[] } {
    const errors: ToolValidationError[] = [];
    const warnings: ToolValidationWarning[] = [];

    if (definition.required && (value === undefined || value === null || value === "")) {
      errors.push({
        field: definition.id,
        code: "REQUIRED",
        message: `${definition.label} is required`,
        value,
      });
      return { errors, warnings };
    }

    if (value === undefined || value === null) {
      if (definition.defaultValue !== undefined) {
        return { errors, warnings };
      }
      return { errors, warnings };
    }

    switch (definition.type) {
      case "text":
      case "textarea":
        this.validateText(definition, value, errors, warnings);
        break;
      case "number":
      case "range":
        this.validateNumber(definition, value, errors, warnings);
        break;
      case "boolean":
        this.validateBoolean(value, errors);
        break;
      case "email":
        this.validateEmail(value, definition.id, errors);
        break;
      case "url":
        this.validateUrl(value, definition.id, errors);
        break;
      case "color":
        this.validateColor(value, definition.id, errors);
        break;
      case "json":
        this.validateJson(value, definition.id, errors);
        break;
      case "date":
        this.validateDate(value, definition.id, errors);
        break;
      case "select":
        this.validateSelect(definition, value, errors);
        break;
      case "file":
        this.validateFile(definition, value, errors);
        break;
    }

    if (definition.validators) {
      for (const validator of definition.validators) {
        if (!validator.validate(value)) {
          errors.push({
            field: definition.id,
            code: validator.type.toUpperCase(),
            message: validator.message,
            value,
          });
        }
      }
    }

    return { errors, warnings };
  }

  private validateText(
    definition: ToolInputDefinition,
    value: unknown,
    errors: ToolValidationError[],
    _warnings: ToolValidationWarning[]
  ): void {
    if (typeof value !== "string") {
      errors.push({
        field: definition.id,
        code: "INVALID_TYPE",
        message: `${definition.label} must be a string`,
        value,
      });
      return;
    }

    if (definition.pattern) {
      const regex = new RegExp(definition.pattern);
      if (!regex.test(value)) {
        errors.push({
          field: definition.id,
          code: "INVALID_PATTERN",
          message: `${definition.label} does not match the required pattern`,
          value,
        });
      }
    }
  }

  private validateNumber(
    definition: ToolInputDefinition,
    value: unknown,
    errors: ToolValidationError[],
    _warnings: ToolValidationWarning[]
  ): void {
    const num = typeof value === "number" ? value : Number(value);

    if (isNaN(num)) {
      errors.push({
        field: definition.id,
        code: "INVALID_TYPE",
        message: `${definition.label} must be a number`,
        value,
      });
      return;
    }

    if (definition.min !== undefined && num < definition.min) {
      errors.push({
        field: definition.id,
        code: "MIN_VALUE",
        message: `${definition.label} must be at least ${definition.min}`,
        value,
      });
    }

    if (definition.max !== undefined && num > definition.max) {
      errors.push({
        field: definition.id,
        code: "MAX_VALUE",
        message: `${definition.label} must be at most ${definition.max}`,
        value,
      });
    }
  }

  private validateBoolean(value: unknown, errors: ToolValidationError[]): void {
    if (typeof value !== "boolean" && value !== "true" && value !== "false") {
      errors.push({
        field: "",
        code: "INVALID_TYPE",
        message: "Value must be a boolean",
        value,
      });
    }
  }

  private validateEmail(value: unknown, fieldId: string, errors: ToolValidationError[]): void {
    if (typeof value === "string" && !EMAIL_REGEX.test(value)) {
      errors.push({
        field: fieldId,
        code: "INVALID_EMAIL",
        message: "Invalid email address",
        value,
      });
    }
  }

  private validateUrl(value: unknown, fieldId: string, errors: ToolValidationError[]): void {
    if (typeof value === "string" && !URL_REGEX.test(value)) {
      errors.push({
        field: fieldId,
        code: "INVALID_URL",
        message: "Invalid URL",
        value,
      });
    }
  }

  private validateColor(value: unknown, fieldId: string, errors: ToolValidationError[]): void {
    if (typeof value === "string" && !HEX_COLOR_REGEX.test(value)) {
      errors.push({
        field: fieldId,
        code: "INVALID_COLOR",
        message: "Invalid color value (use hex format)",
        value,
      });
    }
  }

  private validateJson(value: unknown, fieldId: string, errors: ToolValidationError[]): void {
    if (typeof value === "string") {
      try {
        JSON.parse(value);
      } catch {
        errors.push({
          field: fieldId,
          code: "INVALID_JSON",
          message: "Invalid JSON",
          value,
        });
      }
    }
  }

  private validateDate(value: unknown, fieldId: string, errors: ToolValidationError[]): void {
    if (typeof value === "string" || typeof value === "number") {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push({
          field: fieldId,
          code: "INVALID_DATE",
          message: "Invalid date",
          value,
        });
      }
    }
  }

  private validateSelect(
    definition: ToolInputDefinition,
    value: unknown,
    errors: ToolValidationError[]
  ): void {
    if (definition.options && definition.options.length > 0) {
      const validValues = definition.options.map((o) => o.value);
      if (!validValues.includes(value as string | number)) {
        errors.push({
          field: definition.id,
          code: "INVALID_OPTION",
          message: `${definition.label} must be one of: ${validValues.join(", ")}`,
          value,
        });
      }
    }
  }

  private validateFile(
    definition: ToolInputDefinition,
    value: unknown,
    errors: ToolValidationError[]
  ): void {
    if (definition.accept && typeof value === "object" && value !== null) {
      const file = value as { type?: string; name?: string };
      if (file.type) {
        const acceptedTypes = definition.accept.split(",").map((t) => t.trim());
        const matches = acceptedTypes.some(
          (t) => file.type === t || (t.endsWith("/*") && file.type?.startsWith(t.replace("/*", "/")))
        );
        if (!matches) {
          errors.push({
            field: definition.id,
            code: "INVALID_FILE_TYPE",
            message: `File type not accepted. Accepted: ${definition.accept}`,
            value,
          });
        }
      }
    }
  }
}

export const toolValidator = new ToolValidator();

export function validateToolInputs(
  inputs: ToolInputDefinition[],
  values: ToolInputResult
): ToolValidationResult {
  return toolValidator.validateInputs(inputs, values);
}
