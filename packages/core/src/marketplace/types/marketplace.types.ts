export type PluginSubmissionStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "security_scan"
  | "compatibility_check"
  | "needs_changes"
  | "approved"
  | "rejected"
  | "published"
  | "suspended"
  | "archived";

export type PluginReviewStatus =
  | "pending"
  | "in_progress"
  | "changes_requested"
  | "approved"
  | "rejected";

export type PluginReviewType =
  | "initial"
  | "update"
  | "security_audit"
  | "compliance_review";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export type ReleaseChannel = "stable" | "beta" | "alpha" | "dev";

export type CompatibilityStatus = "compatible" | "incompatible" | "untested" | "deprecated";

export interface PluginSubmission {
  id: string;
  pluginId: string;
  authorId: string;
  status: PluginSubmissionStatus;
  submittedAt: number;
  updatedAt: number;
  reviewedAt?: number;
  publishedAt?: number;
  rejectionReason?: string;
  reviewId?: string;
  securityScanId?: string;
  compatibilityCheckId?: string;
  version: string;
  notes?: string;
}

export interface PluginReview {
  id: string;
  submissionId: string;
  pluginId: string;
  reviewerId: string;
  type: PluginReviewType;
  status: PluginReviewStatus;
  startedAt: number;
  completedAt?: number;
  updatedAt?: number;
  comments: ReviewComment[];
  checklist: ReviewChecklistItem[];
  decision?: "approve" | "reject" | "changes_requested";
  decisionNotes?: string;
}

export interface ReviewComment {
  id: string;
  authorId: string;
  content: string;
  category: "bug" | "security" | "performance" | "style" | "documentation" | "other";
  severity: SeverityLevel;
  location?: string;
  createdAt: number;
  resolvedAt?: number;
  resolvedBy?: string;
}

export interface ReviewChecklistItem {
  id: string;
  label: string;
  category: "security" | "quality" | "documentation" | "legal" | "compatibility";
  required: boolean;
  passed: boolean;
  notes?: string;
  checkedAt?: number;
  checkedBy?: string;
}

export interface PluginVersion {
  id: string;
  pluginId: string;
  version: string;
  channel: ReleaseChannel;
  status: "draft" | "published" | "deprecated" | "yanked";
  publishedAt?: number;
  deprecatedAt?: number;
  yankedAt?: number;
  yankedReason?: string;
  changelog: string;
  downloadCount: number;
  checksum: string;
  checksumAlgorithm: string;
  minPlatformVersion?: string;
  maxPlatformVersion?: string;
  dependencies: PluginDependency[];
  breakingChanges: BreakingChange[];
  assets: VersionAsset[];
  metadata: VersionMetadata;
}

export interface PluginDependency {
  pluginId: string;
  versionRange: string;
  optional: boolean;
}

export interface BreakingChange {
  description: string;
  migrationGuide?: string;
  affectedApis: string[];
}

export interface VersionAsset {
  id: string;
  name: string;
  type: "source" | "binary" | "docs" | "example";
  url: string;
  size: number;
  checksum: string;
}

export interface VersionMetadata {
  fileSize: number;
  entryPoint: string;
  exports: string[];
  peerDependencies: Record<string, string>;
  keywords: string[];
}

export interface SecurityScan {
  id: string;
  pluginId: string;
  version: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  startedAt: number;
  completedAt?: number;
  scanner: string;
  scannerVersion: string;
  results: SecurityScanResult;
  overallScore: number;
  riskLevel: SeverityLevel;
}

export interface SecurityScanResult {
  vulnerabilities: SecurityVulnerability[];
  malwareIndicators: MalwareIndicator[];
  codeAnalysis: CodeAnalysisResult;
  permissionAudit: PermissionAuditResult;
  dependencyAudit: DependencyAuditResult;
  licenseCompliance: LicenseComplianceResult;
}

export interface SecurityVulnerability {
  id: string;
  cve?: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  category: string;
  location?: string;
  recommendation: string;
  references: string[];
}

export interface MalwareIndicator {
  type: string;
  confidence: number;
  description: string;
  evidence: string;
  recommendation: string;
}

export interface CodeAnalysisResult {
  totalLines: number;
  executableLines: number;
  complexity: number;
  duplications: number;
  issues: CodeIssue[];
}

export interface CodeIssue {
  id: string;
  rule: string;
  severity: SeverityLevel;
  message: string;
  line: number;
  column?: number;
  effort?: string;
}

export interface PermissionAuditResult {
  requested: PluginRequiredPermission[];
  unnecessary: string[];
  excessive: string[];
  score: number;
}

export interface PluginRequiredPermission {
  permission: string;
  justification: string;
  riskLevel: SeverityLevel;
}

export interface DependencyAuditResult {
  total: number;
  outdated: number;
  vulnerable: number;
  licenses: Record<string, string>;
  blockedLicenses: string[];
  risks: DependencyRisk[];
}

export interface DependencyRisk {
  name: string;
  currentVersion: string;
  latestVersion: string;
  severity: SeverityLevel;
  reason: string;
}

export interface LicenseComplianceResult {
  pluginLicense: string;
  compatible: boolean;
  violations: LicenseViolation[];
  requiredNotices: string[];
}

export interface LicenseViolation {
  dependency: string;
  dependencyLicense: string;
  conflictReason: string;
}

export interface CompatibilityCheck {
  id: string;
  pluginId: string;
  version: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  startedAt: number;
  completedAt?: number;
  results: CompatibilityResult;
  overallStatus: CompatibilityStatus;
}

export interface CompatibilityResult {
  platforms: PlatformCompatibility[];
  runtime: RuntimeCompatibility;
  dependencies: DependencyCompatibility[];
  apis: ApiCompatibility[];
  warnings: CompatibilityWarning[];
}

export interface PlatformCompatibility {
  platform: string;
  status: CompatibilityStatus;
  testedVersion: string;
  notes?: string;
}

export interface RuntimeCompatibility {
  nodeVersion: string;
  status: CompatibilityStatus;
  minVersion: string;
  maxVersion: string;
}

export interface DependencyCompatibility {
  pluginId: string;
  requiredVersion: string;
  installedVersion?: string;
  status: CompatibilityStatus;
}

export interface ApiCompatibility {
  api: string;
  used: boolean;
  available: boolean;
  deprecated: boolean;
  status: CompatibilityStatus;
}

export interface CompatibilityWarning {
  category: string;
  message: string;
  severity: SeverityLevel;
  recommendation: string;
}

export interface MarketplacePlugin {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  author: PluginAuthor;
  category: string;
  tags: string[];
  icon?: string;
  cover?: string;
  screenshots: string[];
  website?: string;
  repository?: string;
  license: string;
  visibility: "public" | "hidden" | "private";
  featured: boolean;
  status: PluginSubmissionStatus;
  currentVersion: string;
  latestVersion: string;
  publishedVersion?: string;
  versions: PluginVersion[];
  submissions: PluginSubmission[];
  reviews: PluginReview[];
  securityScans: SecurityScan[];
  compatibilityChecks: CompatibilityCheck[];
  stats: PluginStats;
  metadata: MarketplaceMetadata;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

export interface PluginAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  verified: boolean;
  reputation: number;
  totalPlugins: number;
}

export interface PluginStats {
  installs: number;
  activeInstalls: number;
  downloads: number;
  rating: number;
  ratingCount: number;
  reviews: number;
  issues: number;
  lastInstallAt?: number;
}

export interface MarketplaceMetadata {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  changelog: string;
  minimumPlatformVersion: string;
  maximumPlatformVersion?: string;
}

export interface MarketplaceEvent {
  id: string;
  type: MarketplaceEventType;
  pluginId: string;
  version?: string;
  actorId: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export type MarketplaceEventType =
  | "submission.created"
  | "submission.updated"
  | "submission.withdrawn"
  | "review.started"
  | "review.completed"
  | "review.comment_added"
  | "security.scan_started"
  | "security.scan_completed"
  | "compatibility.check_started"
  | "compatibility.check_completed"
  | "version.published"
  | "version.deprecated"
  | "version.yanked"
  | "plugin.published"
  | "plugin.suspended"
  | "plugin.archived";
