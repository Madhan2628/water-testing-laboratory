package com.wtlms.model;

public class TestResultSnapshot {

    private String parameterName;
    private String category;
    private String measuredValue;
    private String unit;
    private String referenceLimitDisplay;
    private String referenceStandard;
    private String testMethod;
    private String complianceStatus; // COMPLIANT / NON_COMPLIANT
    private String interpretation;
    private String laboratoryRemarks;

    public TestResultSnapshot() {}

    public TestResultSnapshot(String parameterName, String category, String measuredValue, String unit,
                              String referenceLimitDisplay, String referenceStandard, String testMethod,
                              String complianceStatus, String interpretation, String laboratoryRemarks) {
        this.parameterName = parameterName;
        this.category = category;
        this.measuredValue = measuredValue;
        this.unit = unit;
        this.referenceLimitDisplay = referenceLimitDisplay;
        this.referenceStandard = referenceStandard;
        this.testMethod = testMethod;
        this.complianceStatus = complianceStatus;
        this.interpretation = interpretation;
        this.laboratoryRemarks = laboratoryRemarks;
    }

    public String getParameterName() { return parameterName; }
    public void setParameterName(String parameterName) { this.parameterName = parameterName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getMeasuredValue() { return measuredValue; }
    public void setMeasuredValue(String measuredValue) { this.measuredValue = measuredValue; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

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
}
