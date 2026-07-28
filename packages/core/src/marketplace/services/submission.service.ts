import type {
  PluginSubmission,
  MarketplacePlugin,
  PluginAuthor,
  PluginStats,
  MarketplaceMetadata,
} from "../types";
import type { SubmissionConfig } from "../types/config.types";
import { DEFAULT_MARKETPLACE_CONFIG } from "../types/config.types";
import { MarketplaceStore, marketplaceStore } from "../store/marketplace-store";
import { SecurityScanner } from "../security/scanner";
import { CompatibilityChecker } from "../compatibility/checker";

export interface SubmissionResult {
  submission: PluginSubmission;
  requiresReview: boolean;
  autoApproved: boolean;
}

export interface PluginRegistrationInput {
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  author: PluginAuthor;
  category: string;
  tags: string[];
  icon?: string;
  cover?: string;
  screenshots?: string[];
  website?: string;
  repository?: string;
  license: string;
  version: string;
  code: string;
  dependencies?: Array<{ name: string; version: string; license?: string }>;
  permissions?: string[];
  usedApis?: string[];
  metadata?: Partial<MarketplaceMetadata>;
}

export class SubmissionService {
  private config: SubmissionConfig;
  private store: MarketplaceStore;
  private securityScanner: SecurityScanner;
  private compatibilityChecker: CompatibilityChecker;

  constructor(
    config?: Partial<SubmissionConfig>,
    store?: MarketplaceStore,
    secScanner?: SecurityScanner,
    compatChecker?: CompatibilityChecker
  ) {
    this.config = { ...DEFAULT_MARKETPLACE_CONFIG.submission, ...config };
    this.store = store ?? marketplaceStore;
    this.securityScanner = secScanner ?? new SecurityScanner();
    this.compatibilityChecker = compatChecker ?? new CompatibilityChecker();
  }

  async registerPlugin(input: PluginRegistrationInput): Promise<MarketplacePlugin> {
    this.validateRegistrationInput(input);

    const now = Date.now();
    const pluginId = this.generatePluginId(input.slug);

    const existing = this.store.getPlugin(pluginId);
    if (existing) {
      throw new Error(`Plugin with slug "${input.slug}" already exists`);
    }

    const authorSubmissionCount = this.store
      .listSubmissions({ authorId: input.author.id })
      .items.filter((s) => !["rejected", "archived"].includes(s.status)).length;

    if (authorSubmissionCount >= this.config.maxSubmissionsPerAuthor) {
      throw new Error(
        `Author has reached maximum submissions (${this.config.maxSubmissionsPerAuthor})`
      );
    }

    const plugin: MarketplacePlugin = {
      id: pluginId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      longDescription: input.longDescription,
      author: input.author,
      category: input.category,
      tags: input.tags,
      icon: input.icon,
      cover: input.cover,
      screenshots: input.screenshots ?? [],
      website: input.website,
      repository: input.repository,
      license: input.license,
      visibility: "public",
      featured: false,
      status: "draft",
      currentVersion: input.version,
      latestVersion: input.version,
      versions: [],
      submissions: [],
      reviews: [],
      securityScans: [],
      compatibilityChecks: [],
      stats: this.createDefaultStats(),
      metadata: {
        seoTitle: input.name,
        seoDescription: input.description,
        seoKeywords: input.tags,
        changelog: "",
        minimumPlatformVersion: "18.0.0",
        ...input.metadata,
      },
      createdAt: now,
      updatedAt: now,
    };

    this.store.setPlugin(plugin);
    return plugin;
  }

  async submit(pluginId: string, options: {
    code: string;
    dependencies?: Array<{ name: string; version: string; license?: string }>;
    permissions?: string[];
    usedApis?: string[];
    notes?: string;
  }): Promise<SubmissionResult> {
    const plugin = this.store.getPlugin(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const now = Date.now();

    const submissionId = `sub-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const submission: PluginSubmission = {
      id: submissionId,
      pluginId,
      authorId: plugin.author.id,
      status: "submitted",
      submittedAt: now,
      updatedAt: now,
      version: plugin.currentVersion,
      notes: options.notes,
    };

    this.store.setSubmission(submission);

    plugin.submissions.push(submission);
    plugin.updatedAt = now;
    this.store.setPlugin(plugin);

    return {
      submission,
      requiresReview: true,
      autoApproved: false,
    };
  }

  async processSubmission(submissionId: string): Promise<{
    securityScan: import("../types").SecurityScan;
    compatibilityCheck: import("../types").CompatibilityCheck;
    readyForReview: boolean;
  }> {
    const submission = this.store.getSubmission(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    submission.status = "security_scan";
    submission.updatedAt = Date.now();
    this.store.setSubmission(submission);

    const plugin = this.store.getPlugin(submission.pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${submission.pluginId} not found`);
    }

    const securityScan = await this.securityScanner.scan(
      submission.pluginId,
      submission.version,
      "",
      [],
      []
    );
    this.store.setSecurityScan(securityScan);

    submission.securityScanId = securityScan.id;
    submission.status = "compatibility_check";
    submission.updatedAt = Date.now();
    this.store.setSubmission(submission);

    const compatibilityCheck = await this.compatibilityChecker.check(
      submission.pluginId,
      submission.version,
      {}
    );
    this.store.setCompatibilityCheck(compatibilityCheck);

    submission.compatibilityCheckId = compatibilityCheck.id;
    submission.status = "under_review";
    submission.updatedAt = Date.now();
    this.store.setSubmission(submission);

    plugin.securityScans.push(securityScan);
    plugin.compatibilityChecks.push(compatibilityCheck);
    plugin.updatedAt = Date.now();
    this.store.setPlugin(plugin);

    const readyForReview =
      securityScan.riskLevel !== "critical" &&
      compatibilityCheck.overallStatus !== "incompatible";

    return { securityScan, compatibilityCheck, readyForReview };
  }

  async updateSubmission(
    submissionId: string,
    updates: {
      notes?: string;
      code?: string;
      dependencies?: Array<{ name: string; version: string; license?: string }>;
    }
  ): Promise<PluginSubmission> {
    const submission = this.store.getSubmission(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    if (!["draft", "submitted", "needs_changes"].includes(submission.status)) {
      throw new Error(`Cannot update submission in status "${submission.status}"`);
    }

    if (updates.notes !== undefined) submission.notes = updates.notes;
    submission.status = "submitted";
    submission.updatedAt = Date.now();

    this.store.setSubmission(submission);
    return submission;
  }

  async withdrawSubmission(submissionId: string): Promise<PluginSubmission> {
    const submission = this.store.getSubmission(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    if (!["draft", "submitted", "needs_changes"].includes(submission.status)) {
      throw new Error(`Cannot withdraw submission in status "${submission.status}"`);
    }

    submission.status = "archived";
    submission.updatedAt = Date.now();

    this.store.setSubmission(submission);
    return submission;
  }

  async publishPlugin(pluginId: string): Promise<MarketplacePlugin> {
    const plugin = this.store.getPlugin(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (plugin.status !== "approved") {
      throw new Error(`Plugin ${pluginId} is not approved (status: ${plugin.status})`);
    }

    const now = Date.now();
    plugin.status = "published";
    plugin.publishedAt = now;
    plugin.publishedVersion = plugin.currentVersion;
    plugin.updatedAt = now;

    this.store.setPlugin(plugin);
    return plugin;
  }

  async suspendPlugin(pluginId: string, _reason: string): Promise<MarketplacePlugin> {
    const plugin = this.store.getPlugin(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    plugin.status = "suspended";
    plugin.updatedAt = Date.now();

    this.store.setPlugin(plugin);
    return plugin;
  }

  async archivePlugin(pluginId: string): Promise<MarketplacePlugin> {
    const plugin = this.store.getPlugin(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    plugin.status = "archived";
    plugin.updatedAt = Date.now();

    this.store.setPlugin(plugin);
    return plugin;
  }

  getPlugin(pluginId: string): MarketplacePlugin | undefined {
    return this.store.getPlugin(pluginId);
  }

  searchPlugins(query: string): MarketplacePlugin[] {
    return this.store.listPlugins({ search: query, status: "published" }).items;
  }

  getPluginsByCategory(category: string): MarketplacePlugin[] {
    return this.store.listPlugins({ category, status: "published" }).items;
  }

  getFeaturedPlugins(): MarketplacePlugin[] {
    return this.store.listPlugins({ featured: true, status: "published" }).items;
  }

  getPluginsByAuthor(authorId: string): MarketplacePlugin[] {
    return this.store.listPlugins({ authorId }).items;
  }

  getPendingSubmissions(): PluginSubmission[] {
    return this.store.listPlugins({ status: ["submitted", "under_review", "security_scan", "compatibility_check"] } as never).items as never;
  }

  private validateRegistrationInput(input: PluginRegistrationInput): void {
    if (!input.name || input.name.length < 3) {
      throw new Error("Plugin name must be at least 3 characters");
    }
    if (!input.slug || !/^[a-z0-9-]+$/.test(input.slug)) {
      throw new Error("Plugin slug must be lowercase alphanumeric with hyphens");
    }
    if (!input.description || input.description.length < 10) {
      throw new Error("Description must be at least 10 characters");
    }
    if (!input.category) {
      throw new Error("Category is required");
    }
    if (!input.license) {
      throw new Error("License is required");
    }
    if (!input.version || !/^\d+\.\d+\.\d+$/.test(input.version)) {
      throw new Error("Version must be in semver format (x.y.z)");
    }
  }

  private generatePluginId(slug: string): string {
    return `plugin-${slug}`;
  }

  private createDefaultStats(): PluginStats {
    return {
      installs: 0,
      activeInstalls: 0,
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      reviews: 0,
      issues: 0,
    };
  }
}

export const submissionService = new SubmissionService();
