package com.wtlms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "samples")
public class Sample {

    @Id
    private String id;

    @Indexed(unique = true)
    private String sampleId; // e.g. WTL-2026-0001

    private String customerId; // Reference to Customer entity or userId
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private LocalDateTime collectionDateTime;
    private String collectionLocation;
    private String waterSource; // e.g. Drinking water, Borewell water, Groundwater, etc.
    private String sampleType;   // e.g. Potable, Untreated, Industrial, Environmental
    private String sampleDescription;

    private List<String> requestedTests = new ArrayList<>();

    private LocalDateTime sampleReceivedDate;
    private String sampleReceivedBy;
    private String sampleCondition; // Good, Cold Storage, Ambient, Compromised
    private String priority = "Normal"; // Normal, High, Urgent

    private String additionalRemarks;

    private SampleStatus status = SampleStatus.REQUESTED;
    private List<StatusHistoryItem> statusHistory = new ArrayList<>();

    private String assignedStaffId;
    private String assignedStaffName;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Sample() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSampleId() { return sampleId; }
    public void setSampleId(String sampleId) { this.sampleId = sampleId; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

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

    public SampleStatus getStatus() { return status; }
    public void setStatus(SampleStatus status) { this.status = status; }

    public List<StatusHistoryItem> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<StatusHistoryItem> statusHistory) { this.statusHistory = statusHistory; }

    public String getAssignedStaffId() { return assignedStaffId; }
    public void setAssignedStaffId(String assignedStaffId) { this.assignedStaffId = assignedStaffId; }

    public String getAssignedStaffName() { return assignedStaffName; }
    public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
