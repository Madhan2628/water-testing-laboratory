package com.wtlms.dto;

import com.wtlms.model.SampleStatus;
import jakarta.validation.constraints.NotNull;

public class SampleStatusUpdateDto {

    @NotNull(message = "Status is required")
    private SampleStatus status;
    private String comments;

    public SampleStatusUpdateDto() {}

    public SampleStatusUpdateDto(SampleStatus status, String comments) {
        this.status = status;
        this.comments = comments;
    }

    public SampleStatus getStatus() { return status; }
    public void setStatus(SampleStatus status) { this.status = status; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
