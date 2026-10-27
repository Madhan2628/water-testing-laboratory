package com.wtlms.service;

import com.wtlms.dto.DashboardStatsDto;
import com.wtlms.model.*;
import com.wtlms.repository.ReportRepository;
import com.wtlms.repository.SampleRepository;
import com.wtlms.repository.TestResultRepository;
import com.wtlms.security.UserPrincipal;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final SampleRepository sampleRepository;
    private final ReportRepository reportRepository;
    private final TestResultRepository testResultRepository;

    public DashboardService(SampleRepository sampleRepository,
                            ReportRepository reportRepository,
                            TestResultRepository testResultRepository) {
        this.sampleRepository = sampleRepository;
        this.reportRepository = reportRepository;
        this.testResultRepository = testResultRepository;
    }

    public DashboardStatsDto getDashboardStatistics(UserPrincipal currentUser) {
        boolean isCustomer = currentUser != null && currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));

        List<Sample> allSamples = sampleRepository.findAll();
        List<Report> allReports = reportRepository.findAll();
        List<TestResult> allResults = testResultRepository.findAll();

        if (isCustomer) {
            String email = currentUser.getUsername();
            String userId = currentUser.getId();
            allSamples = allSamples.stream()
                    .filter(s -> (s.getCustomerEmail() != null && s.getCustomerEmail().equalsIgnoreCase(email)) ||
                            (s.getCustomerId() != null && s.getCustomerId().equals(userId)))
                    .collect(Collectors.toList());

            allReports = allReports.stream()
                    .filter(r -> r.getStatus() == ReportStatus.APPROVED &&
                            ((r.getCustomerEmail() != null && r.getCustomerEmail().equalsIgnoreCase(email)) ||
                                    (r.getCustomerId() != null && r.getCustomerId().equals(userId))))
                    .collect(Collectors.toList());

            Set<String> mySampleIds = allSamples.stream().map(Sample::getSampleId).collect(Collectors.toSet());
            allResults = allResults.stream()
                    .filter(tr -> mySampleIds.contains(tr.getSampleId()))
                    .collect(Collectors.toList());
        }

        DashboardStatsDto dto = new DashboardStatsDto();

        dto.setTotalSamples(allSamples.size());

        long awaiting = allSamples.stream()
                .filter(s -> s.getStatus() == SampleStatus.REQUESTED ||
                        s.getStatus() == SampleStatus.REGISTERED ||
                        s.getStatus() == SampleStatus.SAMPLE_RECEIVED)
                .count();
        dto.setAwaitingTesting(awaiting);

        long inProgress = allSamples.stream()
                .filter(s -> s.getStatus() == SampleStatus.TESTING_IN_PROGRESS)
                .count();
        dto.setInProgressTests(inProgress);

        long completed = allSamples.stream()
                .filter(s -> s.getStatus() == SampleStatus.TESTING_COMPLETED)
                .count();
        dto.setCompletedTests(completed);

        long pendingApproval = allSamples.stream()
                .filter(s -> s.getStatus() == SampleStatus.REPORT_PENDING_APPROVAL)
                .count();
        dto.setReportsPendingApproval(pendingApproval);

        long approved = allSamples.stream()
                .filter(s -> s.getStatus() == SampleStatus.APPROVED)
                .count();
        dto.setApprovedReports(approved);

        long nonCompliant = allReports.stream()
                .filter(r -> "NON_COMPLIANT".equalsIgnoreCase(r.getOverallAssessment()))
                .count();
        dto.setNonCompliantSamples(nonCompliant);

        // Monthly Registrations (Last 6 months grouped)
        Map<String, Long> monthCounts = new TreeMap<>();
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yyyy");
        for (Sample s : allSamples) {
            if (s.getCreatedAt() != null) {
                String monthKey = s.getCreatedAt().format(monthFmt);
                monthCounts.put(monthKey, monthCounts.getOrDefault(monthKey, 0L) + 1);
            }
        }
        List<Map<String, Object>> monthlyList = new ArrayList<>();
        monthCounts.forEach((month, count) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("month", month);
            map.put("samples", count);
            monthlyList.add(map);
        });
        dto.setMonthlyRegistrations(monthlyList);

        // Test completion status chart
        List<Map<String, Object>> statusData = new ArrayList<>();
        Map<SampleStatus, Long> statusMap = allSamples.stream()
                .collect(Collectors.groupingBy(Sample::getStatus, Collectors.counting()));
        for (SampleStatus st : SampleStatus.values()) {
            if (statusMap.containsKey(st)) {
                Map<String, Object> item = new HashMap<>();
                item.put("name", st.name().replace('_', ' '));
                item.put("count", statusMap.get(st));
                statusData.add(item);
            }
        }
        dto.setTestCompletionStatus(statusData);

        // Water quality compliance chart
        List<Map<String, Object>> complianceData = new ArrayList<>();
        long compliantCount = allReports.stream().filter(r -> "COMPLIANT".equalsIgnoreCase(r.getOverallAssessment())).count();
        long nonCompliantCount = allReports.stream().filter(r -> "NON_COMPLIANT".equalsIgnoreCase(r.getOverallAssessment())).count();
        long underAnalysisCount = allSamples.stream()
                .filter(s -> s.getStatus() == SampleStatus.TESTING_IN_PROGRESS || s.getStatus() == SampleStatus.SAMPLE_RECEIVED)
                .count();

        Map<String, Object> c1 = new HashMap<>();
        c1.put("status", "Compliant / Potable");
        c1.put("value", compliantCount);
        complianceData.add(c1);

        Map<String, Object> c2 = new HashMap<>();
        c2.put("status", "Non-Compliant");
        c2.put("value", nonCompliantCount);
        complianceData.add(c2);

        Map<String, Object> c3 = new HashMap<>();
        c3.put("status", "Under Analysis / Pending");
        c3.put("value", underAnalysisCount);
        complianceData.add(c3);
        dto.setWaterQualityCompliance(complianceData);

        // Water Source Distribution
        Map<String, Long> sourceCounts = allSamples.stream()
                .filter(s -> s.getWaterSource() != null)
                .collect(Collectors.groupingBy(Sample::getWaterSource, Collectors.counting()));
        List<Map<String, Object>> sourceList = new ArrayList<>();
        sourceCounts.forEach((src, count) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("source", src);
            map.put("count", count);
            sourceList.add(map);
        });
        dto.setSourceDistribution(sourceList);

        // Recent items (top 6)
        dto.setRecentSamples(allSamples.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(6)
                .collect(Collectors.toList()));

        dto.setRecentResults(allResults.stream()
                .sorted((a, b) -> b.getTestingDate().compareTo(a.getTestingDate()))
                .limit(6)
                .collect(Collectors.toList()));

        dto.setPendingTasks(allSamples.stream()
                .filter(s -> s.getStatus() == SampleStatus.REGISTERED ||
                        s.getStatus() == SampleStatus.SAMPLE_RECEIVED ||
                        s.getStatus() == SampleStatus.TESTING_IN_PROGRESS)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(6)
                .collect(Collectors.toList()));

        return dto;
    }
}
