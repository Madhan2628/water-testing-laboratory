package com.wtlms.repository;

import com.wtlms.model.TestDefinition;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestDefinitionRepository extends MongoRepository<TestDefinition, String> {
    Optional<TestDefinition> findByParameterName(String parameterName);
    List<TestDefinition> findByCategory(String category);
    List<TestDefinition> findByActiveTrue();
    List<TestDefinition> findByWaterSourceOrWaterSource(String waterSource, String all);
}
