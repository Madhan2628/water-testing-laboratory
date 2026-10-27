package com.wtlms.repository;

import com.wtlms.model.Report;
import com.wtlms.model.ReportStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends MongoRepository<Report, String> {
    Optional<Report> findByReportNumber(String reportNumber);
    Optional<Report> findBySampleId(String sampleId);
    boolean existsByReportNumber(String reportNumber);
    List<Report> findByStatus(ReportStatus status);
    List<Report> findByCustomerId(String customerId);
    List<Report> findByCustomerEmail(String customerEmail);
    long countByStatus(ReportStatus status);
    long countByOverallAssessment(String overallAssessment);
}
