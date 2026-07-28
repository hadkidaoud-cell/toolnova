import { ToolNovaError } from "../tool-nova.error";
import { ErrorContext } from "../error.types";

export class ValidationError extends ToolNovaError {
  public readonly fields: Array<{ field: string; message: string; code?: string }>;

  constructor(
    message: string,
    fields: Array<{ field: string; message: string; code?: string }> = [],
    context?: Partial<ErrorContext>
  ) {
    super({
      code: context?.code || "VALIDATION_001",
      message,
      severity: "low",
      category: "validation",
      details: { fields },
      ...context,
    });
    this.name = "ValidationError";
    this.fields = fields;
  }

  static fromFieldErrors(
    errors: Array<{ field: string; message: string; code?: string }>
  ): ValidationError {
    return new ValidationError(
      `Validation failed: ${errors.length} error(s)`,
      errors
    );
  }

  addField(field: string, message: string, code?: string): this {
    this.fields.push({ field, message, code });
    return this;
  }

  hasErrors(): boolean {
    return this.fields.length > 0;
  }

  getFieldErrors(field: string): Array<{ field: string; message: string; code?: string }> {
    return this.fields.filter((e) => e.field === field);
  }
}
