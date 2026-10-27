package com.wtlms.dto;

import com.wtlms.model.Sample;
import com.wtlms.model.TestResult;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class DashboardStatsDto {

    private long totalSamples;
    private long awaitingTesting;
    private long inProgressTests;
    private long completedTests;
    private long reportsPendingApproval;
    private long approvedReports;
    private long nonCompliantSamples;

    // Charts data
    private List<Map<String, Object>> monthlyRegistrations = new ArrayList<>();
    private List<Map<String, Object>> testCompletionStatus = new ArrayList<>();
    private List<Map<String, Object>> waterQualityCompliance = new ArrayList<>();
    private List<Map<String, Object>> sourceDistribution = new ArrayList<>();

    // Recent items
    private List<Sample> recentSamples = new ArrayList<>();
    private List<TestResult> recentResults = new ArrayList<>();
    private List<Sample> pendingTasks = new ArrayList<>();

    public DashboardStatsDto() {}

    public long getTotalSamples() { return totalSamples; }
    public void setTotalSamples(long totalSamples) { this.totalSamples = totalSamples; }

    public long getAwaitingTesting() { return awaitingTesting; }
    public void setAwaitingTesting(long awaitingTesting) { this.awaitingTesting = awaitingTesting; }

    public long getInProgressTests() { return inProgressTests; }
    public void setInProgressTests(long inProgressTests) { this.inProgressTests = inProgressTests; }

    public long getCompletedTests() { return completedTests; }
    public void setCompletedTests(long completedTests) { this.completedTests = completedTests; }

    public long getReportsPendingApproval() { return reportsPendingApproval; }
    public void setReportsPendingApproval(long reportsPendingApproval) { this.reportsPendingApproval = reportsPendingApproval; }

    public long getApprovedReports() { return approvedReports; }
    public void setApprovedReports(long approvedReports) { this.approvedReports = approvedReports; }

    public long getNonCompliantSamples() { return nonCompliantSamples; }
    public void setNonCompliantSamples(long nonCompliantSamples) { this.nonCompliantSamples = nonCompliantSamples; }

    public List<Map<String, Object>> getMonthlyRegistrations() { return monthlyRegistrations; }
    public void setMonthlyRegistrations(List<Map<String, Object>> monthlyRegistrations) { this.monthlyRegistrations = monthlyRegistrations; }

    public List<Map<String, Object>> getTestCompletionStatus() { return testCompletionStatus; }
    public void setTestCompletionStatus(List<Map<String, Object>> testCompletionStatus) { this.testCompletionStatus = testCompletionStatus; }

    public List<Map<String, Object>> getWaterQualityCompliance() { return waterQualityCompliance; }
    public void setWaterQualityCompliance(List<Map<String, Object>> waterQualityCompliance) { this.waterQualityCompliance = waterQualityCompliance; }

    public List<Map<String, Object>> getSourceDistribution() { return sourceDistribution; }
    public void setSourceDistribution(List<Map<String, Object>> sourceDistribution) { this.sourceDistribution = sourceDistribution; }

    public List<Sample> getRecentSamples() { return recentSamples; }
    public void setRecentSamples(List<Sample> recentSamples) { this.recentSamples = recentSamples; }

    public List<TestResult> getRecentResults() { return recentResults; }
    public void setRecentResults(List<TestResult> recentResults) { this.recentResults = recentResults; }

    public List<Sample> getPendingTasks() { return pendingTasks; }
    public void setPendingTasks(List<Sample> pendingTasks) { this.pendingTasks = pendingTasks; }
}
