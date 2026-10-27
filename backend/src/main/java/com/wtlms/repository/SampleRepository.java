package com.wtlms.repository;

import com.wtlms.model.Sample;
import com.wtlms.model.SampleStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SampleRepository extends MongoRepository<Sample, String> {
    Optional<Sample> findBySampleId(String sampleId);
    boolean existsBySampleId(String sampleId);
    List<Sample> findByCustomerId(String customerId);
    List<Sample> findByCustomerEmail(String customerEmail);
    List<Sample> findByStatus(SampleStatus status);
    List<Sample> findByWaterSource(String waterSource);
    long countByStatus(SampleStatus status);
}
