import type { SeverityLevel } from "./marketplace.types";

export interface MarketplaceConfig {
  submission: SubmissionConfig;
  review: ReviewConfig;
  security: SecurityConfig;
  versioning: VersioningConfig;
  compatibility: CompatibilityConfig;
}

export interface SubmissionConfig {
  maxSubmissionsPerAuthor: number;
  maxImagesPerSubmission: number;
  maxImageSizeBytes: number;
  allowedImageTypes: string[];
  requireDescription: boolean;
  requireScreenshots: boolean;
  requireLicense: boolean;
  requireChangelog: boolean;
  maxDescriptionLength: number;
  maxChangelogLength: number;
  autoAssignReview: boolean;
  submissionCooldownMs: number;
}

export interface ReviewConfig {
  minReviewers: number;
  maxReviewers: number;
  reviewTimeoutMs: number;
  requireSecurityApproval: boolean;
  requireCompatibilityApproval: boolean;
  autoApproveAfterDays: number;
  checklistRequiredCategories: string[];
}

export interface SecurityConfig {
  enabled: boolean;
  scannerName: string;
  scannerVersion: string;
  scanTimeoutMs: number;
  maxRiskScore: number;
  blockedLicenses: string[];
  blockedPatterns: string[];
  maxFileSize: number;
  requireCodeAnalysis: boolean;
  requireDependencyAudit: boolean;
  requireLicenseCompliance: boolean;
  autoRejectOnCritical: boolean;
  severityThresholds: Record<SeverityLevel, number>;
}

export interface VersioningConfig {
  strategy: "semver" | "calver";
  requireChangelog: boolean;
  maxVersionsPerPlugin: number;
  maxBreakingChanges: number;
  requireMigrationGuide: boolean;
  deprecationPeriodDays: number;
  yankAllowed: boolean;
  rollbackAllowed: boolean;
}

export interface CompatibilityConfig {
  platforms: string[];
  nodeVersions: string[];
  testOnPublish: boolean;
  requireMinimumVersion: boolean;
  allowBackwardsCompatibility: boolean;
  maxDependencyDepth: number;
}

export const DEFAULT_MARKETPLACE_CONFIG: MarketplaceConfig = {
  submission: {
    maxSubmissionsPerAuthor: 50,
    maxImagesPerSubmission: 10,
    maxImageSizeBytes: 5 * 1024 * 1024,
    allowedImageTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    requireDescription: true,
    requireScreenshots: false,
    requireLicense: true,
    requireChangelog: true,
    maxDescriptionLength: 5000,
    maxChangelogLength: 10000,
    autoAssignReview: true,
    submissionCooldownMs: 60 * 1000,
  },
  review: {
    minReviewers: 1,
    maxReviewers: 3,
    reviewTimeoutMs: 7 * 24 * 60 * 60 * 1000,
    requireSecurityApproval: true,
    requireCompatibilityApproval: true,
    autoApproveAfterDays: 30,
    checklistRequiredCategories: ["security", "quality", "documentation", "legal"],
  },
  security: {
    enabled: true,
    scannerName: "toolnova-security-scanner",
    scannerVersion: "1.0.0",
    scanTimeoutMs: 5 * 60 * 1000,
    maxRiskScore: 70,
    blockedLicenses: ["GPL-3.0", "AGPL-3.0"],
    blockedPatterns: [
      "eval\\(",
      "Function\\(",
      "child_process",
      "process\\.env",
      "fs\\.writeFile",
      "\\.exec\\(",
      "require\\(['\"]http['\"]\\)",
      "require\\(['\"]net['\"]\\)",
    ],
    maxFileSize: 10 * 1024 * 1024,
    requireCodeAnalysis: true,
    requireDependencyAudit: true,
    requireLicenseCompliance: true,
    autoRejectOnCritical: true,
    severityThresholds: {
      low: 100,
      medium: 50,
      high: 10,
      critical: 0,
    },
  },
  versioning: {
    strategy: "semver",
    requireChangelog: true,
    maxVersionsPerPlugin: 50,
    maxBreakingChanges: 5,
    requireMigrationGuide: true,
    deprecationPeriodDays: 90,
    yankAllowed: true,
    rollbackAllowed: true,
  },
  compatibility: {
    platforms: ["linux", "macos", "windows", "web"],
    nodeVersions: ["18.x", "20.x", "22.x"],
    testOnPublish: true,
    requireMinimumVersion: true,
    allowBackwardsCompatibility: true,
    maxDependencyDepth: 5,
  },
};

export const marketplaceConfig: MarketplaceConfig = { ...DEFAULT_MARKETPLACE_CONFIG };
