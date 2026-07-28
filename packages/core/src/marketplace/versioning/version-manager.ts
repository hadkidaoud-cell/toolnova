import type {
  PluginVersion,
  ReleaseChannel,
  PluginDependency,
  BreakingChange,
  VersionAsset,
  VersionMetadata,
} from "../types";
import type { VersioningConfig } from "../types/config.types";
import { DEFAULT_MARKETPLACE_CONFIG } from "../types/config.types";
import { MarketplaceStore, marketplaceStore } from "../store/marketplace-store";

export interface VersionBumpResult {
  previousVersion: string;
  newVersion: string;
  channel: ReleaseChannel;
  isBreaking: boolean;
}

export class VersionManager {
  private config: VersioningConfig;
  private store: MarketplaceStore;

  constructor(config?: Partial<VersioningConfig>, store?: MarketplaceStore) {
    this.config = { ...DEFAULT_MARKETPLACE_CONFIG.versioning, ...config };
    this.store = store ?? marketplaceStore;
  }

  async createVersion(
    pluginId: string,
    version: string,
    options: {
      channel?: ReleaseChannel;
      changelog: string;
      checksum: string;
      dependencies?: PluginDependency[];
      breakingChanges?: BreakingChange[];
      assets?: VersionAsset[];
      metadata?: Partial<VersionMetadata>;
      minPlatformVersion?: string;
      maxPlatformVersion?: string;
    }
  ): Promise<PluginVersion> {
    const existing = this.store.getVersionByNumber(pluginId, version);
    if (existing) {
      throw new Error(`Version ${version} already exists for plugin ${pluginId}`);
    }

    const allVersions = this.store.listVersions(pluginId);
    if (allVersions.length >= this.config.maxVersionsPerPlugin) {
      throw new Error(
        `Maximum versions (${this.config.maxVersionsPerPlugin}) reached for plugin ${pluginId}`
      );
    }

    if (this.config.requireChangelog && !options.changelog) {
      throw new Error("Changelog is required");
    }

    if (
      this.config.requireMigrationGuide &&
      options.breakingChanges &&
      options.breakingChanges.length > 0
    ) {
      const missing = options.breakingChanges.filter((bc) => !bc.migrationGuide);
      if (missing.length > 0) {
        throw new Error(
          `Migration guide required for ${missing.length} breaking change(s)`
        );
      }
    }

    if (
      options.breakingChanges &&
      options.breakingChanges.length > this.config.maxBreakingChanges
    ) {
      throw new Error(
        `Maximum ${this.config.maxBreakingChanges} breaking changes allowed per version`
      );
    }

    const versionId = `ver-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const versionObj: PluginVersion = {
      id: versionId,
      pluginId,
      version,
      channel: options.channel ?? "stable",
      status: "draft",
      publishedAt: undefined,
      changelog: options.changelog,
      downloadCount: 0,
      checksum: options.checksum,
      checksumAlgorithm: "sha256",
      minPlatformVersion: options.minPlatformVersion,
      maxPlatformVersion: options.maxPlatformVersion,
      dependencies: options.dependencies ?? [],
      breakingChanges: options.breakingChanges ?? [],
      assets: options.assets ?? [],
      metadata: {
        fileSize: 0,
        entryPoint: "index.js",
        exports: [],
        peerDependencies: {},
        keywords: [],
        ...options.metadata,
      },
    };

    this.store.setVersion(versionObj);
    return versionObj;
  }

  async publishVersion(versionId: string): Promise<PluginVersion> {
    const version = this.store.getVersion(versionId);
    if (!version) {
      throw new Error(`Version ${versionId} not found`);
    }

    if (version.status !== "draft") {
      throw new Error(`Version ${versionId} is not in draft status`);
    }

    const allVersions = this.store.listVersions(version.pluginId);
    const publishedVersions = allVersions.filter(
      (v) => v.status === "published" && v.id !== versionId
    );

    for (const pv of publishedVersions) {
      if (pv.version === version.version) {
        throw new Error(`Version ${version.version} is already published`);
      }
    }

    version.status = "published";
    version.publishedAt = Date.now();

    this.store.setVersion(version);
    return version;
  }

  async deprecateVersion(versionId: string, _reason: string): Promise<PluginVersion> {
    const version = this.store.getVersion(versionId);
    if (!version) {
      throw new Error(`Version ${versionId} not found`);
    }

    if (version.status !== "published") {
      throw new Error(`Version ${versionId} is not published`);
    }

    version.status = "deprecated";
    version.deprecatedAt = Date.now();

    this.store.setVersion(version);
    return version;
  }

  async yankVersion(versionId: string, reason: string): Promise<PluginVersion> {
    if (!this.config.yankAllowed) {
      throw new Error("Version yanking is not enabled");
    }

    const version = this.store.getVersion(versionId);
    if (!version) {
      throw new Error(`Version ${versionId} not found`);
    }

    if (version.status !== "published") {
      throw new Error(`Version ${versionId} is not published`);
    }

    version.status = "yanked";
    version.yankedAt = Date.now();
    version.yankedReason = reason;

    this.store.setVersion(version);
    return version;
  }

  async rollbackVersion(pluginId: string, toVersionId: string): Promise<PluginVersion> {
    if (!this.config.rollbackAllowed) {
      throw new Error("Version rollback is not enabled");
    }

    const targetVersion = this.store.getVersion(toVersionId);
    if (!targetVersion || targetVersion.pluginId !== pluginId) {
      throw new Error(`Version ${toVersionId} not found for plugin ${pluginId}`);
    }

    if (targetVersion.status === "yanked") {
      throw new Error(`Cannot rollback to yanked version ${toVersionId}`);
    }

    const allVersions = this.store.listVersions(pluginId);
    const currentPublished = allVersions.find(
      (v) => v.status === "published" && v.channel === targetVersion.channel
    );

    if (currentPublished) {
      currentPublished.status = "deprecated";
      currentPublished.deprecatedAt = Date.now();
      this.store.setVersion(currentPublished);
    }

    targetVersion.status = "published";
    targetVersion.publishedAt = Date.now();
    this.store.setVersion(targetVersion);

    return targetVersion;
  }

  getLatestVersion(pluginId: string, channel: ReleaseChannel = "stable"): PluginVersion | undefined {
    const allVersions = this.store.listVersions(pluginId);
    return allVersions
      .filter((v) => v.status === "published" && v.channel === channel)
      .sort((a, b) => {
        const aTime = a.publishedAt ?? 0;
        const bTime = b.publishedAt ?? 0;
        return bTime - aTime;
      })[0];
  }

  getLatestStableVersion(pluginId: string): PluginVersion | undefined {
    return this.getLatestVersion(pluginId, "stable");
  }

  getVersionHistory(pluginId: string): PluginVersion[] {
    return this.store
      .listVersions(pluginId)
      .sort((a, b) => {
        const aTime = a.publishedAt ?? a.id.localeCompare(b.id);
        const bTime = b.publishedAt ?? b.id.localeCompare(b.id);
        if (typeof aTime === "number" && typeof bTime === "number") {
          return bTime - aTime;
        }
        return 0;
      });
  }

  validateVersionFormat(version: string): boolean {
    if (this.config.strategy === "semver") {
      return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/.test(version);
    }
    return /^\d{4}\.\d{2}\.\d{2}$/.test(version);
  }

  bumpVersion(currentVersion: string, type: "major" | "minor" | "patch"): string {
    const parts = currentVersion.split(".").map(Number);
    if (parts.length !== 3 || parts.some((p) => isNaN(p))) {
      throw new Error(`Invalid version format: ${currentVersion}`);
    }

    const [major, minor, patch] = parts as [number, number, number];

    switch (type) {
      case "major":
        return `${major + 1}.0.0`;
      case "minor":
        return `${major}.${minor + 1}.0`;
      case "patch":
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  detectBreakingChanges(oldVersion: string, newVersion: string): boolean {
    const oldParts = oldVersion.split(".").map(Number);
    const newParts = newVersion.split(".").map(Number);
    return newParts[0]! > oldParts[0]!;
  }

  getConfig(): VersioningConfig {
    return { ...this.config };
  }
}

export const versionManager = new VersionManager();
