package com.wtlms.service;

import com.wtlms.dto.BatchResultDto;
import com.wtlms.dto.ResultEntryDto;
import com.wtlms.exception.ResourceNotFoundException;
import com.wtlms.model.*;
import com.wtlms.repository.AuditLogRepository;
import com.wtlms.repository.SampleRepository;
import com.wtlms.repository.TestResultRepository;
import com.wtlms.security.UserPrincipal;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TestResultService {

    private final TestResultRepository testResultRepository;
    private final SampleRepository sampleRepository;
    private final ComplianceEngineService complianceEngineService;
    private final AuditLogRepository auditLogRepository;

    public TestResultService(TestResultRepository testResultRepository,
                             SampleRepository sampleRepository,
                             ComplianceEngineService complianceEngineService,
                             AuditLogRepository auditLogRepository) {
        this.testResultRepository = testResultRepository;
        this.sampleRepository = sampleRepository;
        this.complianceEngineService = complianceEngineService;
        this.auditLogRepository = auditLogRepository;
    }

    public List<TestResult> getResultsBySampleId(String sampleId) {
        return testResultRepository.findBySampleId(sampleId);
    }

    public TestResult recordSingleResult(String sampleId, ResultEntryDto dto, UserPrincipal currentUser) {
        Sample sample = sampleRepository.findBySampleId(sampleId)
                .or(() -> sampleRepository.findById(sampleId))
                .orElseThrow(() -> new ResourceNotFoundException("Sample not found: " + sampleId));

        ComplianceEngineService.EvaluationOutcome outcome =
                complianceEngineService.evaluateParameter(dto.getParameterName(), dto.getMeasuredValue(), sample.getWaterSource());

        Optional<TestResult> existingOpt = testResultRepository.findBySampleIdAndParameterName(sample.getSampleId(), dto.getParameterName());
        TestResult result = existingOpt.orElseGet(TestResult::new);

        result.setSampleId(sample.getSampleId());
        result.setSampleRefId(sample.getId());
        result.setParameterName(dto.getParameterName());
        result.setCategory(outcome.getCategory() != null ? outcome.getCategory() : dto.getCategory());
        result.setMeasuredValue(dto.getMeasuredValue());
        result.setNumericValue(outcome.getNumericValue());
        result.setUnit(outcome.getUnit() != null ? outcome.getUnit() : dto.getUnit());
        result.setReferenceMin(outcome.getRefMin());
        result.setReferenceMax(outcome.getRefMax());
        result.setReferenceLimitDisplay(outcome.getReferenceLimitDisplay());
        result.setReferenceStandard(outcome.getStandard() != null ? outcome.getStandard() : dto.getReferenceStandard());
        result.setTestMethod(outcome.getTestMethod() != null ? outcome.getTestMethod() : dto.getTestMethod());
        result.setComplianceStatus(outcome.getComplianceStatus());
        result.setInterpretation(outcome.getInterpretation());
        result.setLaboratoryRemarks(dto.getLaboratoryRemarks());
        result.setTestedBy(currentUser.getFullName() != null ? currentUser.getFullName() : currentUser.getUsername());
        result.setTestedById(currentUser.getId());
        result.setTestingDate(LocalDateTime.now());
        result.setUpdatedAt(LocalDateTime.now());

        TestResult saved = testResultRepository.save(result);

        // Update sample state to TESTING_IN_PROGRESS if newly starting
        if (sample.getStatus() == SampleStatus.REGISTERED || sample.getStatus() == SampleStatus.SAMPLE_RECEIVED) {
            sample.setStatus(SampleStatus.TESTING_IN_PROGRESS);
            sample.getStatusHistory().add(new StatusHistoryItem(
                    SampleStatus.TESTING_IN_PROGRESS,
                    currentUser.getUsername(),
                    "Laboratory testing started. Recorded: " + dto.getParameterName()
            ));
            sampleRepository.save(sample);
        }

        return saved;
    }

    public List<TestResult> batchSaveResults(BatchResultDto dto, UserPrincipal currentUser) {
        String sampleId = dto.getSampleId();
        Sample sample = sampleRepository.findBySampleId(sampleId)
                .or(() -> sampleRepository.findById(sampleId))
                .orElseThrow(() -> new ResourceNotFoundException("Sample not found: " + sampleId));

        List<TestResult> savedList = new ArrayList<>();
        for (ResultEntryDto entry : dto.getResults()) {
            savedList.add(recordSingleResult(sample.getSampleId(), entry, currentUser));
        }

        if (dto.isSubmitForReview()) {
            sample.setStatus(SampleStatus.REPORT_PENDING_APPROVAL);
            sample.getStatusHistory().add(new StatusHistoryItem(
                    SampleStatus.REPORT_PENDING_APPROVAL,
                    currentUser.getUsername(),
                    dto.getGeneralRemarks() != null && !dto.getGeneralRemarks().isBlank()
                            ? dto.getGeneralRemarks()
                            : "Testing completed for " + savedList.size() + " parameters. Submitted for QA review."
            ));
            sampleRepository.save(sample);

            auditLogRepository.save(new AuditLog(
                    "SUBMIT_RESULTS_FOR_REVIEW",
                    currentUser.getUsername(),
                    currentUser.getAuthorities().iterator().next().getAuthority(),
                    "Sample",
                    sample.getSampleId(),
                    "Submitted " + savedList.size() + " test results for report approval"
            ));
        }

        return savedList;
    }

    public void deleteResult(String id, UserPrincipal currentUser) {
        TestResult tr = testResultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test result not found: " + id));
        testResultRepository.delete(tr);
    }
}
