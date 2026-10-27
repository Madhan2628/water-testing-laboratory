package com.wtlms.repository;

import com.wtlms.model.TestResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestResultRepository extends MongoRepository<TestResult, String> {
    List<TestResult> findBySampleId(String sampleId);
    List<TestResult> findBySampleRefId(String sampleRefId);
    Optional<TestResult> findBySampleIdAndParameterName(String sampleId, String parameterName);
    void deleteBySampleId(String sampleId);
    long countByComplianceStatus(String complianceStatus);
}
