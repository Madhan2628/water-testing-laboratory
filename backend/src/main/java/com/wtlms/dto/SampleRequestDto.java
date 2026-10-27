package com.wtlms.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;

public class SampleRequestDto {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    private String customerEmail;
    private String customerPhone;
    private String customerId;

    private LocalDateTime collectionDateTime;
    @NotBlank(message = "Collection location is required")
    private String collectionLocation;

    @NotBlank(message = "Water source is required")
    private String waterSource; // Drinking water, Borewell water, etc.

    private String sampleType = "Potable Water";
    private String sampleDescription;

    private List<String> requestedTests;

    private LocalDateTime sampleReceivedDate;
    private String sampleReceivedBy;
    private String sampleCondition = "Good";
    private String priority = "Normal";
    private String additionalRemarks;

    public SampleRequestDto() {}

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public LocalDateTime getCollectionDateTime() { return collectionDateTime; }
    public void setCollectionDateTime(LocalDateTime collectionDateTime) { this.collectionDateTime = collectionDateTime; }

    public String getCollectionLocation() { return collectionLocation; }
    public void setCollectionLocation(String collectionLocation) { this.collectionLocation = collectionLocation; }

    public String getWaterSource() { return waterSource; }
    public void setWaterSource(String waterSource) { this.waterSource = waterSource; }

    public String getSampleType() { return sampleType; }
    public void setSampleType(String sampleType) { this.sampleType = sampleType; }

    public String getSampleDescription() { return sampleDescription; }
    public void setSampleDescription(String sampleDescription) { this.sampleDescription = sampleDescription; }

    public List<String> getRequestedTests() { return requestedTests; }
    public void setRequestedTests(List<String> requestedTests) { this.requestedTests = requestedTests; }

    public LocalDateTime getSampleReceivedDate() { return sampleReceivedDate; }
    public void setSampleReceivedDate(LocalDateTime sampleReceivedDate) { this.sampleReceivedDate = sampleReceivedDate; }

    public String getSampleReceivedBy() { return sampleReceivedBy; }
    public void setSampleReceivedBy(String sampleReceivedBy) { this.sampleReceivedBy = sampleReceivedBy; }

    public String getSampleCondition() { return sampleCondition; }
    public void setSampleCondition(String sampleCondition) { this.sampleCondition = sampleCondition; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getAdditionalRemarks() { return additionalRemarks; }
    public void setAdditionalRemarks(String additionalRemarks) { this.additionalRemarks = additionalRemarks; }
}
