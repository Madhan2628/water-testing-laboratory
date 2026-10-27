package com.wtlms.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class BatchResultDto {

    private String sampleId;

    @NotEmpty(message = "Results list cannot be empty")
    private List<ResultEntryDto> results;

    private boolean submitForReview = false;
    private String generalRemarks;

    public BatchResultDto() {}

    public String getSampleId() { return sampleId; }
    public void setSampleId(String sampleId) { this.sampleId = sampleId; }

    public List<ResultEntryDto> getResults() { return results; }
    public void setResults(List<ResultEntryDto> results) { this.results = results; }

    public boolean isSubmitForReview() { return submitForReview; }
    public void setSubmitForReview(boolean submitForReview) { this.submitForReview = submitForReview; }

    public String getGeneralRemarks() { return generalRemarks; }
    public void setGeneralRemarks(String generalRemarks) { this.generalRemarks = generalRemarks; }
}
