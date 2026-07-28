import type {
  SecurityScan,
  SecurityScanResult,
  SecurityVulnerability,
  MalwareIndicator,
  CodeAnalysisResult,
  CodeIssue,
  PermissionAuditResult,
  DependencyAuditResult,
  LicenseComplianceResult,
  SeverityLevel,
} from "../types";
import type { SecurityConfig } from "../types/config.types";
import { DEFAULT_MARKETPLACE_CONFIG } from "../types/config.types";

export class SecurityScanner {
  private config: SecurityConfig;

  constructor(config?: Partial<SecurityConfig>) {
    this.config = { ...DEFAULT_MARKETPLACE_CONFIG.security, ...config };
  }

  async scan(
    pluginId: string,
    version: string,
    code: string,
    dependencies: Array<{ name: string; version: string; license?: string }>,
    permissions: string[]
  ): Promise<SecurityScan> {
    const scanId = `scan-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    const results: SecurityScanResult = {
      vulnerabilities: this.scanVulnerabilities(code),
      malwareIndicators: this.scanMalware(code),
      codeAnalysis: this.analyzeCode(code),
      permissionAudit: this.auditPermissions(permissions),
      dependencyAudit: this.auditDependencies(dependencies),
      licenseCompliance: this.checkLicenseCompliance(dependencies),
    };

    const overallScore = this.calculateOverallScore(results);
    const riskLevel = this.determineRiskLevel(overallScore, results);

    return {
      id: scanId,
      pluginId,
      version,
      status: "completed",
      startedAt: now,
      completedAt: now,
      scanner: this.config.scannerName,
      scannerVersion: this.config.scannerVersion,
      results,
      overallScore,
      riskLevel,
    };
  }

  private scanVulnerabilities(code: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];
    const lines = code.split("\n");

    for (const pattern of this.config.blockedPatterns) {
      const regex = new RegExp(pattern, "gi");
      let match: RegExpExecArray | null;
      while ((match = regex.exec(code)) !== null) {
        const lineNumber = code.substring(0, match.index).split("\n").length;
        const line = lines[lineNumber - 1] ?? "";

        vulnerabilities.push({
          id: `vuln-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          title: `Potentially dangerous pattern detected`,
          description: `Code contains pattern "${pattern}" which may indicate a security risk`,
          severity: this.classifyPatternSeverity(pattern),
          category: "code_injection",
          location: `Line ${lineNumber}: ${line.trim().substring(0, 100)}`,
          recommendation: `Review and remove or properly sanitize the use of this pattern`,
          references: [],
        });
      }
    }

    if (code.includes("eval(") || code.includes("new Function(")) {
      vulnerabilities.push({
        id: `vuln-eval-${Date.now().toString(36)}`,
        title: "Dynamic code execution detected",
        description: "Code uses eval() or new Function() which can execute arbitrary code",
        severity: "critical",
        category: "code_injection",
        recommendation: "Remove eval/Function usage and use safer alternatives",
        references: ["https://owasp.org/www-community/attacks/Code_Injection"],
      });
    }

    if (code.includes("process.exit")) {
      vulnerabilities.push({
        id: `vuln-exit-${Date.now().toString(36)}`,
        title: "Process exit detected",
        description: "Code calls process.exit() which can terminate the host application",
        severity: "high",
        category: "denial_of_service",
        recommendation: "Remove process.exit() calls and use proper error handling",
        references: [],
      });
    }

    return vulnerabilities;
  }

  private scanMalware(code: string): MalwareIndicator[] {
    const indicators: MalwareIndicator[] = [];

    if (code.includes("require('http')") || code.includes('require("http")')) {
      indicators.push({
        type: "network_access",
        confidence: 0.7,
        description: "Code accesses HTTP module which may indicate data exfiltration",
        evidence: "require('http') or require(\"http\") found",
        recommendation: "Verify network access is necessary and properly scoped",
      });
    }

    if (code.includes("require('child_process')") || code.includes('require("child_process")')) {
      indicators.push({
        type: "system_access",
        confidence: 0.9,
        description: "Code accesses child_process module which allows system command execution",
        evidence: "require('child_process') found",
        recommendation: "Remove child_process usage unless absolutely necessary",
      });
    }

    if (code.includes("process.env") && code.includes("send")) {
      indicators.push({
        type: "data_exfiltration",
        confidence: 0.8,
        description: "Code accesses environment variables and sends data",
        evidence: "process.env combined with send() found",
        recommendation: "Review data being sent and ensure no secrets are leaked",
      });
    }

    return indicators;
  }

  private analyzeCode(code: string): CodeAnalysisResult {
    const lines = code.split("\n");
    const totalLines = lines.length;
    const executableLines = lines.filter((l) => {
      const trimmed = l.trim();
      return trimmed.length > 0 && !trimmed.startsWith("//") && !trimmed.startsWith("*");
    }).length;

    const complexity = this.calculateComplexity(code);
    const issues = this.findCodeIssues(lines);

    return {
      totalLines,
      executableLines,
      complexity,
      duplications: 0,
      issues,
    };
  }

  private calculateComplexity(code: string): number {
    let complexity = 1;
    const patterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bswitch\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\b\?\b/g,
      /&&/g,
      /\|\|/g,
    ];

    for (const pattern of patterns) {
      const matches = code.match(pattern);
      if (matches) complexity += matches.length;
    }

    return complexity;
  }

  private findCodeIssues(lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = [];

    lines.forEach((line, index) => {
      if (line.length > 120) {
        issues.push({
          id: `issue-line-${index}`,
          rule: "max-line-length",
          severity: "low",
          message: `Line exceeds 120 characters (${line.length})`,
          line: index + 1,
        });
      }

      if (line.includes("console.log") && !line.trim().startsWith("//")) {
        issues.push({
          id: `issue-console-${index}`,
          rule: "no-console",
          severity: "low",
          message: "console.log found in production code",
          line: index + 1,
        });
      }
    });

    return issues;
  }

  private auditPermissions(permissions: string[]): PermissionAuditResult {
    const riskyPermissions = ["admin", "write", "delete", "upload", "download", "export"];
    const requested = permissions.map((p) => ({
      permission: p,
      justification: "Required for plugin functionality",
      riskLevel: riskyPermissions.includes(p) ? ("high" as SeverityLevel) : ("low" as SeverityLevel),
    }));

    const excessive = permissions.filter((p) => p === "admin" || p === "delete");

    return {
      requested,
      unnecessary: [],
      excessive,
      score: Math.max(0, 100 - excessive.length * 30),
    };
  }

  private auditDependencies(
    dependencies: Array<{ name: string; version: string; license?: string }>
  ): DependencyAuditResult {
    const risks: Array<{ name: string; currentVersion: string; latestVersion: string; severity: SeverityLevel; reason: string }> = [];
    const licenses: Record<string, string> = {};
    let outdated = 0;

    for (const dep of dependencies) {
      if (dep.license) {
        licenses[dep.name] = dep.license;
      }

      if (dep.version.startsWith("^0.") || dep.version.startsWith("~0.")) {
        outdated++;
        risks.push({
          name: dep.name,
          currentVersion: dep.version,
          latestVersion: dep.version,
          severity: "medium",
          reason: "Using pre-release or unstable version",
        });
      }
    }

    return {
      total: dependencies.length,
      outdated,
      vulnerable: 0,
      licenses,
      blockedLicenses: this.config.blockedLicenses,
      risks,
    };
  }

  private checkLicenseCompliance(
    dependencies: Array<{ name: string; version: string; license?: string }>
  ): LicenseComplianceResult {
    const violations: Array<{ dependency: string; dependencyLicense: string; conflictReason: string }> = [];
    const requiredNotices: string[] = [];

    for (const dep of dependencies) {
      if (dep.license && this.config.blockedLicenses.includes(dep.license)) {
        violations.push({
          dependency: dep.name,
          dependencyLicense: dep.license,
          conflictReason: `License "${dep.license}" is in the blocked list`,
        });
      }
      if (dep.license && dep.license !== "MIT" && dep.license !== "ISC" && dep.license !== "BSD-2-Clause" && dep.license !== "BSD-3-Clause") {
        requiredNotices.push(`${dep.name}: ${dep.license}`);
      }
    }

    return {
      pluginLicense: "MIT",
      compatible: violations.length === 0,
      violations,
      requiredNotices,
    };
  }

  private calculateOverallScore(results: SecurityScanResult): number {
    let score = 100;

    score -= results.vulnerabilities.length * 10;
    for (const v of results.vulnerabilities) {
      if (v.severity === "critical") score -= 30;
      else if (v.severity === "high") score -= 20;
      else if (v.severity === "medium") score -= 10;
      else score -= 5;
    }

    score -= results.malwareIndicators.length * 15;

    if (results.codeAnalysis.complexity > 50) score -= 10;
    if (results.codeAnalysis.issues.length > 10) score -= 5;

    score -= results.permissionAudit.excessive.length * 15;

    score -= results.dependencyAudit.vulnerable * 10;
    score -= results.dependencyAudit.outdated * 2;

    if (!results.licenseCompliance.compatible) score -= 25;

    return Math.max(0, Math.min(100, score));
  }

  private determineRiskLevel(
    score: number,
    results: SecurityScanResult
  ): SeverityLevel {
    if (
      results.vulnerabilities.some((v) => v.severity === "critical") ||
      results.malwareIndicators.length > 0 ||
      score < 30
    ) {
      return "critical";
    }
    if (results.vulnerabilities.some((v) => v.severity === "high") || score < 50) {
      return "high";
    }
    if (results.vulnerabilities.some((v) => v.severity === "medium") || score < 70) {
      return "medium";
    }
    return "low";
  }

  private classifyPatternSeverity(pattern: string): SeverityLevel {
    if (pattern.includes("eval") || pattern.includes("Function")) return "critical";
    if (pattern.includes("child_process") || pattern.includes("exec")) return "critical";
    if (pattern.includes("process.env")) return "high";
    if (pattern.includes("fs.write")) return "high";
    if (pattern.includes("http") || pattern.includes("net")) return "medium";
    return "low";
  }

  getConfig(): SecurityConfig {
    return { ...this.config };
  }
}

export const securityScanner = new SecurityScanner();
