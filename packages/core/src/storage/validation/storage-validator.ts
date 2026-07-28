import type {
  StorageConfig,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  FileValidationInput,
  MimeValidationResult,
  HashValidationResult,
} from "../types";
import { computeHash } from "../utils/hash-utils";
import { getExtension } from "../utils/file-utils";

export class StorageValidator {
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  validate(input: FileValidationInput): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    this.validateSize(input, errors, warnings);
    this.validateMime(input, errors, warnings);
    this.validateExtension(input, errors, warnings);
    this.validateName(input, errors, warnings);
    this.validateHash(input, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  validateSize(
    input: FileValidationInput,
    errors: ValidationError[] = [],
    warnings: ValidationWarning[] = []
  ): ValidationResult {
    if (input.size <= 0) {
      errors.push({
        rule: "min-size",
        type: "min-size",
        message: "File is empty",
        value: input.size,
        expected: "> 0",
      });
    }

    if (input.size > this.config.maxFileSize) {
      errors.push({
        rule: "max-size",
        type: "max-size",
        message: `File size ${input.size} exceeds maximum ${this.config.maxFileSize}`,
        value: input.size,
        expected: this.config.maxFileSize,
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateMime(
    input: FileValidationInput,
    errors: ValidationError[] = [],
    warnings: ValidationWarning[] = []
  ): ValidationResult {
    if (this.config.blockedMimeTypes.length > 0) {
      if (this.config.blockedMimeTypes.includes(input.mimeType)) {
        errors.push({
          rule: "mime-block",
          type: "mime-block",
          message: `MIME type "${input.mimeType}" is blocked`,
          value: input.mimeType,
        });
      }
    }

    if (this.config.allowedMimeTypes.length > 0) {
      if (!this.config.allowedMimeTypes.includes(input.mimeType)) {
        errors.push({
          rule: "mime-allow",
          type: "mime-allow",
          message: `MIME type "${input.mimeType}" is not in the allowed list`,
          value: input.mimeType,
          expected: this.config.allowedMimeTypes.join(", "),
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateExtension(
    input: FileValidationInput,
    errors: ValidationError[] = [],
    warnings: ValidationWarning[] = []
  ): ValidationResult {
    const ext = input.extension || getExtension(input.filename);

    if (this.config.blockedExtensions.length > 0) {
      if (this.config.blockedExtensions.includes(ext)) {
        errors.push({
          rule: "ext-block",
          type: "ext-block",
          message: `Extension "${ext}" is blocked`,
          value: ext,
        });
      }
    }

    if (this.config.allowedExtensions.length > 0) {
      if (!this.config.allowedExtensions.includes(ext)) {
        errors.push({
          rule: "ext-allow",
          type: "ext-allow",
          message: `Extension "${ext}" is not in the allowed list`,
          value: ext,
          expected: this.config.allowedExtensions.join(", "),
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateName(
    input: FileValidationInput,
    errors: ValidationError[] = [],
    warnings: ValidationWarning[] = []
  ): ValidationResult {
    if (input.filename.length > this.config.maxNameLength) {
      errors.push({
        rule: "name-length",
        type: "name-length",
        message: `Filename length ${input.filename.length} exceeds maximum ${this.config.maxNameLength}`,
        value: input.filename.length,
        expected: this.config.maxNameLength,
      });
    }

    if (input.filename.length === 0) {
      errors.push({
        rule: "name-length",
        type: "name-length",
        message: "Filename is empty",
        value: input.filename,
      });
    }

    const dangerousPattern = /[<>:"|?*\x00-\x1f]/;
    if (dangerousPattern.test(input.filename)) {
      warnings.push({
        rule: "name-pattern",
        type: "name-pattern",
        message: "Filename contains potentially dangerous characters",
        value: input.filename,
      });
    }

    if (input.filename.includes("..")) {
      errors.push({
        rule: "name-pattern",
        type: "name-pattern",
        message: "Filename contains path traversal sequences",
        value: input.filename,
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateHash(
    input: FileValidationInput,
    errors: ValidationError[] = [],
    warnings: ValidationWarning[] = []
  ): ValidationResult {
    if (this.config.requireHashValidation && input.hash) {
      const algorithm = input.hashAlgorithm ?? this.config.hashAlgorithm;
      const expectedLength = this.getHashLength(algorithm);

      if (input.hash.length !== expectedLength) {
        warnings.push({
          rule: "hash-match",
          type: "hash-match",
          message: `Hash length ${input.hash.length} doesn't match expected ${expectedLength} for ${algorithm}`,
          value: input.hash.length,
          expected: expectedLength,
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateProvidedHash(
    data: Buffer,
    providedHash: string,
    algorithm?: string
  ): HashValidationResult {
    const algo = (algorithm ?? this.config.hashAlgorithm) as import("../types/storage.types").HashAlgorithm;
    const computed = computeHash(data, algo);

    return {
      valid: computed === providedHash,
      computed,
      expected: providedHash,
      algorithm: algo,
    };
  }

  detectMime(filename: string, buffer?: Buffer): MimeValidationResult {
    const ext = getExtension(filename);

    const extMimeMap: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".bmp": "image/bmp",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".txt": "text/plain",
      ".csv": "text/csv",
      ".json": "application/json",
      ".xml": "application/xml",
      ".zip": "application/zip",
      ".tar": "application/x-tar",
      ".gz": "application/gzip",
      ".7z": "application/x-7z-compressed",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
    };

    let detectedMime = extMimeMap[ext] ?? "application/octet-stream";

    if (buffer && buffer.length >= 4) {
      const magicMime = this.detectMimeFromMagic(buffer);
      if (magicMime) {
        detectedMime = magicMime;
      }
    }

    const valid = this.isMimeAllowed(detectedMime);
    return {
      valid,
      detectedMime,
      extension: ext,
      reason: valid ? undefined : `MIME type "${detectedMime}" is not allowed`,
    };
  }

  private detectMimeFromMagic(buffer: Buffer): string | null {
    const magic: Array<{ mime: string; bytes: number[]; offset: number }> = [
      { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 },
      { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff], offset: 0 },
      { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38], offset: 0 },
      { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },
      { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 },
      { mime: "application/zip", bytes: [0x50, 0x4b, 0x03, 0x04], offset: 0 },
      { mime: "application/x-7z-compressed", bytes: [0x37, 0x7a, 0xbc, 0xaf], offset: 0 },
      { mime: "image/bmp", bytes: [0x42, 0x4d], offset: 0 },
      { mime: "image/tiff", bytes: [0x49, 0x49, 0x2a, 0x00], offset: 0 },
    ];

    for (const { mime, bytes, offset } of magic) {
      if (buffer.length >= offset + bytes.length) {
        const match = bytes.every((b, i) => buffer[offset + i] === b);
        if (match) return mime;
      }
    }

    return null;
  }

  private isMimeAllowed(mime: string): boolean {
    if (this.config.blockedMimeTypes.includes(mime)) return false;
    if (this.config.allowedMimeTypes.length > 0) {
      return this.config.allowedMimeTypes.includes(mime);
    }
    return true;
  }

  private getHashLength(algorithm: string): number {
    const lengths: Record<string, number> = {
      md5: 32,
      sha1: 40,
      sha256: 64,
      sha512: 128,
    };
    return lengths[algorithm] ?? 64;
  }
}
