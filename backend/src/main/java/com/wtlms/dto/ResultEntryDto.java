package com.wtlms.dto;

import jakarta.validation.constraints.NotBlank;

public class ResultEntryDto {

    private String id; // Optional existing test result ID to update

    @NotBlank(message = "Parameter name is required")
    private String parameterName;

    private String category;

    @NotBlank(message = "Measured value is required")
    private String measuredValue;

    private String unit;
    private String testMethod;
    private String referenceStandard;
    private String laboratoryRemarks;

    public ResultEntryDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getParameterName() { return parameterName; }
    public void setParameterName(String parameterName) { this.parameterName = parameterName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getMeasuredValue() { return measuredValue; }
    public void setMeasuredValue(String measuredValue) { this.measuredValue = measuredValue; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getTestMethod() { return testMethod; }
    public void setTestMethod(String testMethod) { this.testMethod = testMethod; }

    public String getReferenceStandard() { return referenceStandard; }
    public void setReferenceStandard(String referenceStandard) { this.referenceStandard = referenceStandard; }

    public String getLaboratoryRemarks() { return laboratoryRemarks; }
    public void setLaboratoryRemarks(String laboratoryRemarks) { this.laboratoryRemarks = laboratoryRemarks; }
}
