import type {
  MarketplacePlugin,
  PluginSubmission,
  PluginReview,
  PluginVersion,
  SecurityScan,
  CompatibilityCheck,
  MarketplaceEvent,
  PluginSubmissionStatus,
} from "../types";

export interface StoreQuery {
  status?: PluginSubmissionStatus | PluginSubmissionStatus[];
  category?: string;
  authorId?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface StoreResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export class MarketplaceStore {
  private plugins = new Map<string, MarketplacePlugin>();
  private submissions = new Map<string, PluginSubmission>();
  private reviews = new Map<string, PluginReview>();
  private versions = new Map<string, PluginVersion>();
  private securityScans = new Map<string, SecurityScan>();
  private compatibilityChecks = new Map<string, CompatibilityCheck>();
  private events: MarketplaceEvent[] = [];

  // Plugins
  setPlugin(plugin: MarketplacePlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  getPlugin(id: string): MarketplacePlugin | undefined {
    return this.plugins.get(id);
  }

  deletePlugin(id: string): boolean {
    return this.plugins.delete(id);
  }

  listPlugins(query: StoreQuery = {}): StoreResult<MarketplacePlugin> {
    let items = Array.from(this.plugins.values());

    if (query.status) {
      const statuses = Array.isArray(query.status) ? query.status : [query.status];
      items = items.filter((p) => statuses.includes(p.status));
    }
    if (query.category) {
      items = items.filter((p) => p.category === query.category);
    }
    if (query.authorId) {
      items = items.filter((p) => p.author.id === query.authorId);
    }
    if (query.featured !== undefined) {
      items = items.filter((p) => p.featured === query.featured);
    }
    if (query.search) {
      const lower = query.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower) ||
          p.tags.some((t) => t.toLowerCase().includes(lower))
      );
    }

    const total = items.length;
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;

    if (query.sortBy) {
      const order = query.sortOrder ?? "desc";
      items.sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[query.sortBy!];
        const bVal = (b as unknown as Record<string, unknown>)[query.sortBy!];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return order === "asc" ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    items = items.slice(offset, offset + limit);
    return { items, total, limit, offset };
  }

  // Submissions
  setSubmission(submission: PluginSubmission): void {
    this.submissions.set(submission.id, submission);
  }

  getSubmission(id: string): PluginSubmission | undefined {
    return this.submissions.get(id);
  }

  listSubmissions(query: StoreQuery = {}): StoreResult<PluginSubmission> {
    let items = Array.from(this.submissions.values());

    if (query.status) {
      const statuses = Array.isArray(query.status) ? query.status : [query.status];
      items = items.filter((s) => statuses.includes(s.status));
    }
    if (query.authorId) {
      items = items.filter((s) => s.authorId === query.authorId);
    }

    const total = items.length;
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;
    items = items.slice(offset, offset + limit);

    return { items, total, limit, offset };
  }

  // Reviews
  setReview(review: PluginReview): void {
    this.reviews.set(review.id, review);
  }

  getReview(id: string): PluginReview | undefined {
    return this.reviews.get(id);
  }

  listReviews(pluginId?: string): PluginReview[] {
    const items = Array.from(this.reviews.values());
    if (pluginId) {
      return items.filter((r) => r.pluginId === pluginId);
    }
    return items;
  }

  // Versions
  setVersion(version: PluginVersion): void {
    this.versions.set(version.id, version);
  }

  getVersion(id: string): PluginVersion | undefined {
    return this.versions.get(id);
  }

  listVersions(pluginId: string): PluginVersion[] {
    return Array.from(this.versions.values()).filter((v) => v.pluginId === pluginId);
  }

  getVersionByNumber(pluginId: string, version: string): PluginVersion | undefined {
    return Array.from(this.versions.values()).find(
      (v) => v.pluginId === pluginId && v.version === version
    );
  }

  // Security Scans
  setSecurityScan(scan: SecurityScan): void {
    this.securityScans.set(scan.id, scan);
  }

  getSecurityScan(id: string): SecurityScan | undefined {
    return this.securityScans.get(id);
  }

  listSecurityScans(pluginId: string): SecurityScan[] {
    return Array.from(this.securityScans.values()).filter((s) => s.pluginId === pluginId);
  }

  // Compatibility Checks
  setCompatibilityCheck(check: CompatibilityCheck): void {
    this.compatibilityChecks.set(check.id, check);
  }

  getCompatibilityCheck(id: string): CompatibilityCheck | undefined {
    return this.compatibilityChecks.get(id);
  }

  listCompatibilityChecks(pluginId: string): CompatibilityCheck[] {
    return Array.from(this.compatibilityChecks.values()).filter((c) => c.pluginId === pluginId);
  }

  // Events
  addEvent(event: MarketplaceEvent): void {
    this.events.push(event);
  }

  listEvents(pluginId?: string, limit: number = 100): MarketplaceEvent[] {
    let items = this.events;
    if (pluginId) {
      items = items.filter((e) => e.pluginId === pluginId);
    }
    return items.slice(-limit);
  }

  clear(): void {
    this.plugins.clear();
    this.submissions.clear();
    this.reviews.clear();
    this.versions.clear();
    this.securityScans.clear();
    this.compatibilityChecks.clear();
    this.events = [];
  }

  getStats(): {
    totalPlugins: number;
    publishedPlugins: number;
    totalSubmissions: number;
    pendingSubmissions: number;
    totalVersions: number;
    totalEvents: number;
  } {
    return {
      totalPlugins: this.plugins.size,
      publishedPlugins: Array.from(this.plugins.values()).filter((p) => p.status === "published").length,
      totalSubmissions: this.submissions.size,
      pendingSubmissions: Array.from(this.submissions.values()).filter((s) =>
        ["submitted", "under_review", "security_scan", "compatibility_check"].includes(s.status)
      ).length,
      totalVersions: this.versions.size,
      totalEvents: this.events.length,
    };
  }
}

export const marketplaceStore = new MarketplaceStore();
