import type {
  CompatibilityCheck,
  CompatibilityResult,
  PlatformCompatibility,
  RuntimeCompatibility,
  DependencyCompatibility,
  ApiCompatibility,
  CompatibilityWarning,
  CompatibilityStatus,
} from "../types";
import type { CompatibilityConfig } from "../types/config.types";
import { DEFAULT_MARKETPLACE_CONFIG } from "../types/config.types";

export class CompatibilityChecker {
  private config: CompatibilityConfig;

  constructor(config?: Partial<CompatibilityConfig>) {
    this.config = { ...DEFAULT_MARKETPLACE_CONFIG.compatibility, ...config };
  }

  async check(
    pluginId: string,
    version: string,
    options: {
      minPlatformVersion?: string;
      maxPlatformVersion?: string;
      dependencies?: Array<{ pluginId: string; versionRange: string }>;
      usedApis?: string[];
      peerDependencies?: Record<string, string>;
    }
  ): Promise<CompatibilityCheck> {
    const checkId = `compat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    const results: CompatibilityResult = {
      platforms: this.checkPlatforms(options.minPlatformVersion, options.maxPlatformVersion),
      runtime: this.checkRuntime(options.minPlatformVersion, options.maxPlatformVersion),
      dependencies: this.checkDependencies(options.dependencies ?? []),
      apis: this.checkApis(options.usedApis ?? []),
      warnings: this.generateWarnings(options),
    };

    const overallStatus = this.determineOverallStatus(results);

    return {
      id: checkId,
      pluginId,
      version,
      status: "completed",
      startedAt: now,
      completedAt: now,
      results,
      overallStatus,
    };
  }

  private checkPlatforms(
    _minVersion?: string,
    _maxVersion?: string
  ): PlatformCompatibility[] {
    return this.config.platforms.map((platform) => ({
      platform,
      status: "compatible" as CompatibilityStatus,
      testedVersion: this.config.nodeVersions[this.config.nodeVersions.length - 1] ?? "20.x",
    }));
  }

  private checkRuntime(
    minVersion?: string,
    maxVersion?: string
  ): RuntimeCompatibility {
    const min = minVersion ?? "18.0.0";
    const max = maxVersion ?? "22.x";
    const latestNode = this.config.nodeVersions[this.config.nodeVersions.length - 1] ?? "20.x";

    return {
      nodeVersion: latestNode,
      status: "compatible",
      minVersion: min,
      maxVersion: max,
    };
  }

  private checkDependencies(
    dependencies: Array<{ pluginId: string; versionRange: string }>
  ): DependencyCompatibility[] {
    return dependencies.map((dep) => ({
      pluginId: dep.pluginId,
      requiredVersion: dep.versionRange,
      installedVersion: undefined,
      status: "untested" as CompatibilityStatus,
    }));
  }

  private checkApis(usedApis: string[]): ApiCompatibility[] {
    const knownApis = [
      "ImageEngine",
      "FileStorage",
      "SearchService",
      "AnalyticsService",
      "SEOService",
      "PluginRegistry",
      "ToolRegistry",
    ];

    return usedApis.map((api) => ({
      api,
      used: true,
      available: knownApis.includes(api),
      deprecated: false,
      status: knownApis.includes(api) ? ("compatible" as CompatibilityStatus) : ("incompatible" as CompatibilityStatus),
    }));
  }

  private generateWarnings(options: {
    minPlatformVersion?: string;
    maxPlatformVersion?: string;
    dependencies?: Array<{ pluginId: string; versionRange: string }>;
    usedApis?: string[];
  }): CompatibilityWarning[] {
    const warnings: CompatibilityWarning[] = [];

    if (options.dependencies && options.dependencies.length > this.config.maxDependencyDepth) {
      warnings.push({
        category: "dependencies",
        message: `Plugin has ${options.dependencies.length} dependencies, exceeding max depth of ${this.config.maxDependencyDepth}`,
        severity: "medium",
        recommendation: "Reduce the number of dependencies to improve compatibility",
      });
    }

    if (options.usedApis) {
      for (const api of options.usedApis) {
        if (!["ImageEngine", "FileStorage", "SearchService"].includes(api)) {
          warnings.push({
            category: "api_usage",
            message: `Using API "${api}" which may have limited compatibility`,
            severity: "low",
            recommendation: "Verify API availability across all target platforms",
          });
        }
      }
    }

    if (options.minPlatformVersion) {
      const minParts = options.minPlatformVersion.split(".").map(Number);
      if (minParts[0] && minParts[0] > 20) {
        warnings.push({
          category: "platform",
          message: `Minimum platform version ${options.minPlatformVersion} may not be available on all systems`,
          severity: "medium",
          recommendation: "Consider lowering the minimum version requirement",
        });
      }
    }

    return warnings;
  }

  private determineOverallStatus(results: CompatibilityResult): CompatibilityStatus {
    const hasIncompatible = results.platforms.some((p) => p.status === "incompatible") ||
      results.runtime.status === "incompatible" ||
      results.dependencies.some((d) => d.status === "incompatible") ||
      results.apis.some((a) => a.status === "incompatible");

    if (hasIncompatible) return "incompatible";

    const hasWarnings = results.warnings.some((w) => w.severity === "high" || w.severity === "critical");
    if (hasWarnings) return "untested";

    return "compatible";
  }

  getConfig(): CompatibilityConfig {
    return { ...this.config };
  }
}

export const compatibilityChecker = new CompatibilityChecker();
