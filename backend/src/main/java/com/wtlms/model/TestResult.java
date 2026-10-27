package com.wtlms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "test_results")
public class TestResult {

    @Id
    private String id;

    @Indexed
    private String sampleId;     // Business ID, e.g. WTL-2026-0001
    private String sampleRefId;  // MongoDB ID of sample

    private String parameterName;
    private String category; // Physical, Chemical, Microbiological
    private String measuredValue;
    private Double numericValue;
    private String unit;

    private Double referenceMin;
    private Double referenceMax;
    private String referenceLimitDisplay;
    private String referenceStandard;
    private String testMethod;

    private String complianceStatus = "NOT_TESTED"; // COMPLIANT, NON_COMPLIANT, NOT_TESTED
    private String interpretation; // e.g. "Complies with IS 10500:2012 permissible limits"
    private String laboratoryRemarks;

    private LocalDateTime testingDate = LocalDateTime.now();
    private String testedBy; // User name / email
    private String testedById;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public TestResult() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSampleId() { return sampleId; }
    public void setSampleId(String sampleId) { this.sampleId = sampleId; }

    public String getSampleRefId() { return sampleRefId; }
    public void setSampleRefId(String sampleRefId) { this.sampleRefId = sampleRefId; }

    public String getParameterName() { return parameterName; }
    public void setParameterName(String parameterName) { this.parameterName = parameterName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getMeasuredValue() { return measuredValue; }
    public void setMeasuredValue(String measuredValue) { this.measuredValue = measuredValue; }

    public Double getNumericValue() { return numericValue; }
    public void setNumericValue(Double numericValue) { this.numericValue = numericValue; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Double getReferenceMin() { return referenceMin; }
    public void setReferenceMin(Double referenceMin) { this.referenceMin = referenceMin; }

    public Double getReferenceMax() { return referenceMax; }
    public void setReferenceMax(Double referenceMax) { this.referenceMax = referenceMax; }

    public String getReferenceLimitDisplay() { return referenceLimitDisplay; }
    public void setReferenceLimitDisplay(String referenceLimitDisplay) { this.referenceLimitDisplay = referenceLimitDisplay; }

    public String getReferenceStandard() { return referenceStandard; }
    public void setReferenceStandard(String referenceStandard) { this.referenceStandard = referenceStandard; }

    public String getTestMethod() { return testMethod; }
    public void setTestMethod(String testMethod) { this.testMethod = testMethod; }

    public String getComplianceStatus() { return complianceStatus; }
    public void setComplianceStatus(String complianceStatus) { this.complianceStatus = complianceStatus; }

    public String getInterpretation() { return interpretation; }
    public void setInterpretation(String interpretation) { this.interpretation = interpretation; }

    public String getLaboratoryRemarks() { return laboratoryRemarks; }
    public void setLaboratoryRemarks(String laboratoryRemarks) { this.laboratoryRemarks = laboratoryRemarks; }

    public LocalDateTime getTestingDate() { return testingDate; }
    public void setTestingDate(LocalDateTime testingDate) { this.testingDate = testingDate; }

    public String getTestedBy() { return testedBy; }
    public void setTestedBy(String testedBy) { this.testedBy = testedBy; }

    public String getTestedById() { return testedById; }
    public void setTestedById(String testedById) { this.testedById = testedById; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
