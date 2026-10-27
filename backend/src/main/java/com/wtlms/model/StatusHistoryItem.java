package com.wtlms.model;

import java.time.LocalDateTime;

public class StatusHistoryItem {

    private SampleStatus status;
    private LocalDateTime timestamp;
    private String updatedBy;
    private String comments;

    public StatusHistoryItem() {
        this.timestamp = LocalDateTime.now();
    }

    public StatusHistoryItem(SampleStatus status, String updatedBy, String comments) {
        this.status = status;
        this.timestamp = LocalDateTime.now();
        this.updatedBy = updatedBy;
        this.comments = comments;
    }

    public SampleStatus getStatus() { return status; }
    public void setStatus(SampleStatus status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
