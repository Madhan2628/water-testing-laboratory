package com.wtlms.dto;

import jakarta.validation.constraints.NotBlank;

public class ReportReviewDto {

    @NotBlank(message = "Decision is required (APPROVE or REJECT)")
    private String decision; // "APPROVE" or "REJECT"

    private String reviewerComments;
    private String reviewerDesignation = "Senior Quality Assurance Officer";

    public ReportReviewDto() {}

    public ReportReviewDto(String decision, String reviewerComments, String reviewerDesignation) {
        this.decision = decision;
        this.reviewerComments = reviewerComments;
        this.reviewerDesignation = reviewerDesignation;
    }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getReviewerComments() { return reviewerComments; }
    public void setReviewerComments(String reviewerComments) { this.reviewerComments = reviewerComments; }

    public String getReviewerDesignation() { return reviewerDesignation; }
    public void setReviewerDesignation(String reviewerDesignation) { this.reviewerDesignation = reviewerDesignation; }
}
