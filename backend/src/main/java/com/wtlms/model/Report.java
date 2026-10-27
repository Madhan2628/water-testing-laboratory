package com.wtlms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "reports")
public class Report {

    @Id
    private String id;

    @Indexed(unique = true)
    private String reportNumber; // e.g. REP-2026-0001

    @Indexed
    private String sampleId;
    private String sampleRefId;

    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerAddress;
    private String customerOrganization;

    private String collectionLocation;
    private String waterSource;
    private String sampleType;
    private String sampleCondition;

    private LocalDateTime collectionDate;
    private LocalDateTime receivedDate;
    private LocalDateTime testingCompletedDate;

    private ReportStatus status = ReportStatus.DRAFT;

    private int totalParameters;
    private int passedParameters;
    private int failedParameters;
    private double compliancePercentage;

    private String overallAssessment; // "COMPLIANT", "NON_COMPLIANT"
    private String assessmentSummary;
    private String applicableStandard = "IS 10500:2012";

    // Snapshot of test result criteria and measured values frozen at time of report creation/approval
    private List<TestResultSnapshot> parametersSnapshot = new ArrayList<>();

    private String laboratoryObservations;
    private String disclaimer = "This report applies exclusively to the sample tested as received by the laboratory. It does not certify the overall quality or safety of water beyond the specific parameters tested.";

    private String preparedBy;
    private String preparedById;
    private LocalDateTime preparedDate = LocalDateTime.now();

    private String reviewedBy;
    private String reviewedById;
    private String reviewerDesignation;
    private LocalDateTime reviewedDate;
    private String reviewerComments;

    private int version = 1;
    private List<ReportAuditItem> auditTrail = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Report() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReportNumber() { return reportNumber; }
    public void setReportNumber(String reportNumber) { this.reportNumber = reportNumber; }

    public String getSampleId() { return sampleId; }
    public void setSampleId(String sampleId) { this.sampleId = sampleId; }

    public String getSampleRefId() { return sampleRefId; }
    public void setSampleRefId(String sampleRefId) { this.sampleRefId = sampleRefId; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }

    public String getCustomerOrganization() { return customerOrganization; }
    public void setCustomerOrganization(String customerOrganization) { this.customerOrganization = customerOrganization; }

    public String getCollectionLocation() { return collectionLocation; }
    public void setCollectionLocation(String collectionLocation) { this.collectionLocation = collectionLocation; }

    public String getWaterSource() { return waterSource; }
    public void setWaterSource(String waterSource) { this.waterSource = waterSource; }

    public String getSampleType() { return sampleType; }
    public void setSampleType(String sampleType) { this.sampleType = sampleType; }

    public String getSampleCondition() { return sampleCondition; }
    public void setSampleCondition(String sampleCondition) { this.sampleCondition = sampleCondition; }

    public LocalDateTime getCollectionDate() { return collectionDate; }
    public void setCollectionDate(LocalDateTime collectionDate) { this.collectionDate = collectionDate; }

    public LocalDateTime getReceivedDate() { return receivedDate; }
    public void setReceivedDate(LocalDateTime receivedDate) { this.receivedDate = receivedDate; }

    public LocalDateTime getTestingCompletedDate() { return testingCompletedDate; }
    public void setTestingCompletedDate(LocalDateTime testingCompletedDate) { this.testingCompletedDate = testingCompletedDate; }

    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }

    public int getTotalParameters() { return totalParameters; }
    public void setTotalParameters(int totalParameters) { this.totalParameters = totalParameters; }

    public int getPassedParameters() { return passedParameters; }
    public void setPassedParameters(int passedParameters) { this.passedParameters = passedParameters; }

    public int getFailedParameters() { return failedParameters; }
    public void setFailedParameters(int failedParameters) { this.failedParameters = failedParameters; }

    public double getCompliancePercentage() { return compliancePercentage; }
    public void setCompliancePercentage(double compliancePercentage) { this.compliancePercentage = compliancePercentage; }

    public String getOverallAssessment() { return overallAssessment; }
    public void setOverallAssessment(String overallAssessment) { this.overallAssessment = overallAssessment; }

    public String getAssessmentSummary() { return assessmentSummary; }
    public void setAssessmentSummary(String assessmentSummary) { this.assessmentSummary = assessmentSummary; }

    public String getApplicableStandard() { return applicableStandard; }
    public void setApplicableStandard(String applicableStandard) { this.applicableStandard = applicableStandard; }

    public List<TestResultSnapshot> getParametersSnapshot() { return parametersSnapshot; }
    public void setParametersSnapshot(List<TestResultSnapshot> parametersSnapshot) { this.parametersSnapshot = parametersSnapshot; }

    public String getLaboratoryObservations() { return laboratoryObservations; }
    public void setLaboratoryObservations(String laboratoryObservations) { this.laboratoryObservations = laboratoryObservations; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }

    public String getPreparedBy() { return preparedBy; }
    public void setPreparedBy(String preparedBy) { this.preparedBy = preparedBy; }

    public String getPreparedById() { return preparedById; }
    public void setPreparedById(String preparedById) { this.preparedById = preparedById; }

    public LocalDateTime getPreparedDate() { return preparedDate; }
    public void setPreparedDate(LocalDateTime preparedDate) { this.preparedDate = preparedDate; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public String getReviewedById() { return reviewedById; }
    public void setReviewedById(String reviewedById) { this.reviewedById = reviewedById; }

    public String getReviewerDesignation() { return reviewerDesignation; }
    public void setReviewerDesignation(String reviewerDesignation) { this.reviewerDesignation = reviewerDesignation; }

    public LocalDateTime getReviewedDate() { return reviewedDate; }
    public void setReviewedDate(LocalDateTime reviewedDate) { this.reviewedDate = reviewedDate; }

    public String getReviewerComments() { return reviewerComments; }
    public void setReviewerComments(String reviewerComments) { this.reviewerComments = reviewerComments; }

    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }

    public List<ReportAuditItem> getAuditTrail() { return auditTrail; }
    public void setAuditTrail(List<ReportAuditItem> auditTrail) { this.auditTrail = auditTrail; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
