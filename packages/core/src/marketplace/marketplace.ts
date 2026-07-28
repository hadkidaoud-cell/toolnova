import type {
  MarketplacePlugin,
  PluginSubmission,
  PluginReview,
  PluginVersion,
  SecurityScan,
  CompatibilityCheck,
  MarketplaceEvent,
  MarketplaceEventType,
} from "./types";
import type { MarketplaceConfig } from "./types/config.types";
import { DEFAULT_MARKETPLACE_CONFIG } from "./types/config.types";
import { MarketplaceStore, marketplaceStore } from "./store/marketplace-store";
import { SecurityScanner } from "./security/scanner";
import { CompatibilityChecker } from "./compatibility/checker";
import { ApprovalWorkflow } from "./approval/workflow";
import { VersionManager } from "./versioning/version-manager";
import { SubmissionService } from "./services/submission.service";
import type { PluginRegistrationInput } from "./services/submission.service";

export interface MarketplaceStats {
  totalPlugins: number;
  publishedPlugins: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  totalVersions: number;
  totalEvents: number;
}

export class Marketplace {
  private config: MarketplaceConfig;
  private store: MarketplaceStore;
  private security: SecurityScanner;
  private compatibility: CompatibilityChecker;
  private approval: ApprovalWorkflow;
  private versions: VersionManager;
  private submissions: SubmissionService;
  private eventListeners: Map<MarketplaceEventType, Array<(event: MarketplaceEvent) => void>> = new Map();

  constructor(config?: Partial<MarketplaceConfig>) {
    this.config = { ...DEFAULT_MARKETPLACE_CONFIG, ...config };
    this.store = marketplaceStore;
    this.security = new SecurityScanner(this.config.security);
    this.compatibility = new CompatibilityChecker(this.config.compatibility);
    this.approval = new ApprovalWorkflow(this.config.review, this.store);
    this.versions = new VersionManager(this.config.versioning, this.store);
    this.submissions = new SubmissionService(
      this.config.submission,
      this.store,
      this.security,
      this.compatibility
    );
  }

  // Plugin Registration
  async registerPlugin(input: PluginRegistrationInput): Promise<MarketplacePlugin> {
    const plugin = await this.submissions.registerPlugin(input);
    this.emitEvent({
      type: "submission.created",
      pluginId: plugin.id,
      actorId: plugin.author.id,
      data: { name: plugin.name, version: plugin.currentVersion },
      timestamp: Date.now(),
    });
    return plugin;
  }

  // Submission
  async submit(pluginId: string, options: {
    code: string;
    dependencies?: Array<{ name: string; version: string; license?: string }>;
    permissions?: string[];
    usedApis?: string[];
    notes?: string;
  }): Promise<PluginSubmission> {
    const result = await this.submissions.submit(pluginId, options);
    this.emitEvent({
      type: "submission.created",
      pluginId,
      actorId: result.submission.authorId,
      data: { submissionId: result.submission.id, version: result.submission.version },
      timestamp: Date.now(),
    });
    return result.submission;
  }

  async processSubmission(submissionId: string): Promise<{
    securityScan: SecurityScan;
    compatibilityCheck: CompatibilityCheck;
    readyForReview: boolean;
  }> {
    const result = await this.submissions.processSubmission(submissionId);
    return result;
  }

  async updateSubmission(submissionId: string, updates: {
    notes?: string;
    code?: string;
    dependencies?: Array<{ name: string; version: string; license?: string }>;
  }): Promise<PluginSubmission> {
    return this.submissions.updateSubmission(submissionId, updates);
  }

  async withdrawSubmission(submissionId: string): Promise<PluginSubmission> {
    return this.submissions.withdrawSubmission(submissionId);
  }

  // Review
  async startReview(submissionId: string, reviewerId: string): Promise<PluginReview> {
    const review = await this.approval.startReview(submissionId, reviewerId);
    this.emitEvent({
      type: "review.started",
      pluginId: review.pluginId,
      actorId: reviewerId,
      data: { reviewId: review.id, submissionId },
      timestamp: Date.now(),
    });
    return review;
  }

  async addReviewComment(
    reviewId: string,
    authorId: string,
    content: string,
    category: PluginReview["comments"][0]["category"],
    severity: import("./types").SeverityLevel,
    location?: string
  ): Promise<import("./types").ReviewComment> {
    const comment = await this.approval.addComment(reviewId, authorId, content, category, severity, location);
    return comment;
  }

  async completeReview(
    reviewId: string,
    decision: "approve" | "reject" | "changes_requested",
    notes: string
  ): Promise<import("./approval/workflow").ReviewDecision> {
    const result = await this.approval.completeReview(reviewId, decision, notes);
    this.emitEvent({
      type: "review.completed",
      pluginId: result.submissionId,
      actorId: "",
      data: { reviewId, decision, notes },
      timestamp: Date.now(),
    });
    return result;
  }

  // Publishing
  async publishPlugin(pluginId: string): Promise<MarketplacePlugin> {
    const plugin = await this.submissions.publishPlugin(pluginId);
    this.emitEvent({
      type: "plugin.published",
      pluginId,
      actorId: plugin.author.id,
      data: { version: plugin.publishedVersion },
      timestamp: Date.now(),
    });
    return plugin;
  }

  async suspendPlugin(pluginId: string, reason: string): Promise<MarketplacePlugin> {
    const plugin = await this.submissions.suspendPlugin(pluginId, reason);
    this.emitEvent({
      type: "plugin.suspended",
      pluginId,
      actorId: "",
      data: { reason },
      timestamp: Date.now(),
    });
    return plugin;
  }

  async archivePlugin(pluginId: string): Promise<MarketplacePlugin> {
    const plugin = await this.submissions.archivePlugin(pluginId);
    this.emitEvent({
      type: "plugin.archived",
      pluginId,
      actorId: "",
      data: {},
      timestamp: Date.now(),
    });
    return plugin;
  }

  // Versioning
  async createVersion(
    pluginId: string,
    version: string,
    options: {
      channel?: import("./types").ReleaseChannel;
      changelog: string;
      checksum: string;
      dependencies?: import("./types").PluginDependency[];
      breakingChanges?: import("./types").BreakingChange[];
      assets?: import("./types").VersionAsset[];
      metadata?: Partial<import("./types").VersionMetadata>;
      minPlatformVersion?: string;
      maxPlatformVersion?: string;
    }
  ): Promise<PluginVersion> {
    return this.versions.createVersion(pluginId, version, options);
  }

  async publishVersion(versionId: string): Promise<PluginVersion> {
    const version = await this.versions.publishVersion(versionId);
    this.emitEvent({
      type: "version.published",
      pluginId: version.pluginId,
      version: version.version,
      actorId: "",
      data: { versionId },
      timestamp: Date.now(),
    });
    return version;
  }

  async deprecateVersion(versionId: string, reason: string): Promise<PluginVersion> {
    return this.versions.deprecateVersion(versionId, reason);
  }

  async yankVersion(versionId: string, reason: string): Promise<PluginVersion> {
    const version = await this.versions.yankVersion(versionId, reason);
    this.emitEvent({
      type: "version.yanked",
      pluginId: version.pluginId,
      version: version.version,
      actorId: "",
      data: { versionId, reason },
      timestamp: Date.now(),
    });
    return version;
  }

  async rollbackVersion(pluginId: string, toVersionId: string): Promise<PluginVersion> {
    return this.versions.rollbackVersion(pluginId, toVersionId);
  }

  // Security
  async runSecurityScan(
    pluginId: string,
    version: string,
    code: string,
    dependencies: Array<{ name: string; version: string; license?: string }>,
    permissions: string[]
  ): Promise<SecurityScan> {
    const scan = await this.security.scan(pluginId, version, code, dependencies, permissions);
    this.store.setSecurityScan(scan);
    this.emitEvent({
      type: "security.scan_completed",
      pluginId,
      version,
      actorId: "",
      data: { scanId: scan.id, riskLevel: scan.riskLevel, score: scan.overallScore },
      timestamp: Date.now(),
    });
    return scan;
  }

  // Compatibility
  async runCompatibilityCheck(
    pluginId: string,
    version: string,
    options: {
      minPlatformVersion?: string;
      maxPlatformVersion?: string;
      dependencies?: Array<{ pluginId: string; versionRange: string }>;
      usedApis?: string[];
    }
  ): Promise<CompatibilityCheck> {
    const check = await this.compatibility.check(pluginId, version, options);
    this.store.setCompatibilityCheck(check);
    this.emitEvent({
      type: "compatibility.check_completed",
      pluginId,
      version,
      actorId: "",
      data: { checkId: check.id, status: check.overallStatus },
      timestamp: Date.now(),
    });
    return check;
  }

  // Queries
  getPlugin(pluginId: string): MarketplacePlugin | undefined {
    return this.store.getPlugin(pluginId);
  }

  listPlugins(query?: import("./store/marketplace-store").StoreQuery): import("./store/marketplace-store").StoreResult<MarketplacePlugin> {
    return this.store.listPlugins(query);
  }

  searchPlugins(query: string): MarketplacePlugin[] {
    return this.submissions.searchPlugins(query);
  }

  getPluginsByCategory(category: string): MarketplacePlugin[] {
    return this.submissions.getPluginsByCategory(category);
  }

  getFeaturedPlugins(): MarketplacePlugin[] {
    return this.submissions.getFeaturedPlugins();
  }

  getPluginsByAuthor(authorId: string): MarketplacePlugin[] {
    return this.submissions.getPluginsByAuthor(authorId);
  }

  getVersionHistory(pluginId: string): PluginVersion[] {
    return this.versions.getVersionHistory(pluginId);
  }

  getLatestVersion(pluginId: string): PluginVersion | undefined {
    return this.versions.getLatestStableVersion(pluginId);
  }

  getSecurityScans(pluginId: string): SecurityScan[] {
    return this.store.listSecurityScans(pluginId);
  }

  getCompatibilityChecks(pluginId: string): CompatibilityCheck[] {
    return this.store.listCompatibilityChecks(pluginId);
  }

  getEvents(pluginId?: string, limit?: number): MarketplaceEvent[] {
    return this.store.listEvents(pluginId, limit);
  }

  getStats(): MarketplaceStats {
    return this.store.getStats();
  }

  // Event System
  on(type: MarketplaceEventType, listener: (event: MarketplaceEvent) => void): () => void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
    return () => {
      const listeners = this.eventListeners.get(type);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      }
    };
  }

  // Lifecycle
  clear(): void {
    this.store.clear();
    this.eventListeners.clear();
  }

  getConfig(): MarketplaceConfig {
    return { ...this.config };
  }

  // Sub-services access
  getSecurityScanner(): SecurityScanner {
    return this.security;
  }

  getCompatibilityChecker(): CompatibilityChecker {
    return this.compatibility;
  }

  getApprovalWorkflow(): ApprovalWorkflow {
    return this.approval;
  }

  getVersionManager(): VersionManager {
    return this.versions;
  }

  getSubmissionService(): SubmissionService {
    return this.submissions;
  }

  private emitEvent(event: Omit<MarketplaceEvent, "id">): void {
    const fullEvent: MarketplaceEvent = {
      ...event,
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const listeners = this.eventListeners.get(fullEvent.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(fullEvent);
        } catch {
          // listener error
        }
      }
    }

    this.store.addEvent(fullEvent);
  }
}

export const marketplace = new Marketplace();
