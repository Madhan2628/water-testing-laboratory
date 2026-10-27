package com.wtlms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "test_definitions")
public class TestDefinition {

    @Id
    private String id;

    private String parameterName;
    private String category; // Physical, Chemical, Microbiological
    private String unit;
    private Double minLimit;
    private Double maxLimit;
    private String permittedQualitative;
    private String ruleType; // RANGE, MAX_ONLY, MIN_ONLY, QUALITATIVE, MICROBIOLOGICAL
    private String waterSource = "All"; // Applies to specific source or "All"
    private String referenceStandard = "IS 10500:2012";
    private String testMethod;
    private String description;
    private boolean active = true;

    public TestDefinition() {}

    public TestDefinition(String parameterName, String category, String unit, Double minLimit, Double maxLimit,
                          String ruleType, String waterSource, String referenceStandard, String testMethod) {
        this.parameterName = parameterName;
        this.category = category;
        this.unit = unit;
        this.minLimit = minLimit;
        this.maxLimit = maxLimit;
        this.ruleType = ruleType;
        this.waterSource = waterSource != null ? waterSource : "All";
        this.referenceStandard = referenceStandard;
        this.testMethod = testMethod;
        this.active = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getParameterName() { return parameterName; }
    public void setParameterName(String parameterName) { this.parameterName = parameterName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Double getMinLimit() { return minLimit; }
    public void setMinLimit(Double minLimit) { this.minLimit = minLimit; }

    public Double getMaxLimit() { return maxLimit; }
    public void setMaxLimit(Double maxLimit) { this.maxLimit = maxLimit; }

    public String getPermittedQualitative() { return permittedQualitative; }
    public void setPermittedQualitative(String permittedQualitative) { this.permittedQualitative = permittedQualitative; }

    public String getRuleType() { return ruleType; }
    public void setRuleType(String ruleType) { this.ruleType = ruleType; }

    public String getWaterSource() { return waterSource; }
    public void setWaterSource(String waterSource) { this.waterSource = waterSource; }

    public String getReferenceStandard() { return referenceStandard; }
    public void setReferenceStandard(String referenceStandard) { this.referenceStandard = referenceStandard; }

    public String getTestMethod() { return testMethod; }
    public void setTestMethod(String testMethod) { this.testMethod = testMethod; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
