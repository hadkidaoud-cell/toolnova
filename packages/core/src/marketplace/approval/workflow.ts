import type {
  PluginReview,
  PluginReviewType,
  ReviewComment,
  ReviewChecklistItem,
  PluginSubmissionStatus,
  SeverityLevel,
} from "../types";
import type { ReviewConfig } from "../types/config.types";
import { DEFAULT_MARKETPLACE_CONFIG } from "../types/config.types";
import { MarketplaceStore, marketplaceStore } from "../store/marketplace-store";

export interface ReviewDecision {
  submissionId: string;
  reviewId: string;
  decision: "approve" | "reject" | "changes_requested";
  notes: string;
  newStatus: PluginSubmissionStatus;
}

export class ApprovalWorkflow {
  private config: ReviewConfig;
  private store: MarketplaceStore;

  constructor(
    config?: Partial<ReviewConfig>,
    store?: MarketplaceStore
  ) {
    this.config = { ...DEFAULT_MARKETPLACE_CONFIG.review, ...config };
    this.store = store ?? marketplaceStore;
  }

  async startReview(
    submissionId: string,
    reviewerId: string,
    type: PluginReviewType = "initial"
  ): Promise<PluginReview> {
    const submission = this.store.getSubmission(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    const reviewId = `review-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    const checklist = this.createDefaultChecklist();

    const review: PluginReview = {
      id: reviewId,
      submissionId,
      pluginId: submission.pluginId,
      reviewerId,
      type,
      status: "in_progress",
      startedAt: now,
      comments: [],
      checklist,
    };

    this.store.setReview(review);

    submission.status = "under_review";
    submission.reviewId = reviewId;
    submission.updatedAt = now;
    this.store.setSubmission(submission);

    return review;
  }

  async addComment(
    reviewId: string,
    authorId: string,
    content: string,
    category: ReviewComment["category"],
    severity: SeverityLevel,
    location?: string
  ): Promise<ReviewComment> {
    const review = this.store.getReview(reviewId);
    if (!review) {
      throw new Error(`Review ${reviewId} not found`);
    }

    const comment: ReviewComment = {
      id: `comment-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      authorId,
      content,
      category,
      severity,
      location,
      createdAt: Date.now(),
    };

    review.comments.push(comment);
    review.updatedAt = Date.now();
    this.store.setReview(review);

    return comment;
  }

  async updateChecklist(
    reviewId: string,
    checklistItemId: string,
    passed: boolean,
    checkedBy: string,
    notes?: string
  ): Promise<ReviewChecklistItem> {
    const review = this.store.getReview(reviewId);
    if (!review) {
      throw new Error(`Review ${reviewId} not found`);
    }

    const item = review.checklist.find((c) => c.id === checklistItemId);
    if (!item) {
      throw new Error(`Checklist item ${checklistItemId} not found`);
    }

    item.passed = passed;
    item.checkedBy = checkedBy;
    item.checkedAt = Date.now();
    item.notes = notes;

    this.store.setReview(review);
    return item;
  }

  async completeReview(
    reviewId: string,
    decision: "approve" | "reject" | "changes_requested",
    decisionNotes: string
  ): Promise<ReviewDecision> {
    const review = this.store.getReview(reviewId);
    if (!review) {
      throw new Error(`Review ${reviewId} not found`);
    }

    review.status = decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "changes_requested";
    review.completedAt = Date.now();
    review.decision = decision;
    review.decisionNotes = decisionNotes;
    this.store.setReview(review);

    const submission = this.store.getSubmission(review.submissionId);
    if (!submission) {
      throw new Error(`Submission ${review.submissionId} not found`);
    }

    let newStatus: PluginSubmissionStatus;
    switch (decision) {
      case "approve":
        newStatus = "approved";
        break;
      case "reject":
        newStatus = "rejected";
        break;
      case "changes_requested":
        newStatus = "needs_changes";
        break;
    }

    submission.status = newStatus;
    submission.updatedAt = Date.now();
    submission.reviewedAt = Date.now();
    if (decision === "reject") {
      submission.rejectionReason = decisionNotes;
    }
    this.store.setSubmission(submission);

    return {
      submissionId: submission.id,
      reviewId: review.id,
      decision,
      notes: decisionNotes,
      newStatus,
    };
  }

  getReviewStatus(reviewId: string): PluginReview | undefined {
    return this.store.getReview(reviewId);
  }

  getReviewsForSubmission(submissionId: string): PluginReview[] {
    return this.store.listReviews().filter((r) => r.submissionId === submissionId);
  }

  getChecklistProgress(reviewId: string): { total: number; passed: number; failed: number; percentage: number } {
    const review = this.store.getReview(reviewId);
    if (!review) return { total: 0, passed: 0, failed: 0, percentage: 0 };

    const required = review.checklist.filter((c) => c.required);
    const total = required.length;
    const passed = required.filter((c) => c.passed).length;
    const failed = total - passed;

    return {
      total,
      passed,
      failed,
      percentage: total > 0 ? Math.round((passed / total) * 100) : 0,
    };
  }

  isReadyForDecision(reviewId: string): boolean {
    const progress = this.getChecklistProgress(reviewId);
    return progress.percentage === 100;
  }

  private createDefaultChecklist(): ReviewChecklistItem[] {
    const now = Date.now();
    return [
      {
        id: `check-security-${now}`,
        label: "Security scan passed with no critical issues",
        category: "security",
        required: true,
        passed: false,
      },
      {
        id: `check-quality-${now}`,
        label: "Code quality meets standards",
        category: "quality",
        required: true,
        passed: false,
      },
      {
        id: `check-documentation-${now}`,
        label: "Documentation is complete and accurate",
        category: "documentation",
        required: true,
        passed: false,
      },
      {
        id: `check-license-${now}`,
        label: "License is compatible and properly declared",
        category: "legal",
        required: true,
        passed: false,
      },
      {
        id: `check-compatibility-${now}`,
        label: "Compatibility check passed",
        category: "compatibility",
        required: false,
        passed: false,
      },
      {
        id: `check-testing-${now}`,
        label: "Plugin has been tested manually",
        category: "quality",
        required: false,
        passed: false,
      },
    ];
  }

  getConfig(): ReviewConfig {
    return { ...this.config };
  }
}

export const approvalWorkflow = new ApprovalWorkflow();
