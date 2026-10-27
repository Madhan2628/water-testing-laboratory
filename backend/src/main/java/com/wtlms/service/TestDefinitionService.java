package com.wtlms.service;

import com.wtlms.exception.ResourceNotFoundException;
import com.wtlms.model.TestDefinition;
import com.wtlms.repository.TestDefinitionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TestDefinitionService {

    private final TestDefinitionRepository testDefinitionRepository;

    public TestDefinitionService(TestDefinitionRepository testDefinitionRepository) {
        this.testDefinitionRepository = testDefinitionRepository;
    }

    public List<TestDefinition> getAllDefinitions() {
        return testDefinitionRepository.findAll();
    }

    public TestDefinition getDefinitionById(String id) {
        return testDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test definition not found with id: " + id));
    }

    public TestDefinition createDefinition(TestDefinition def) {
        return testDefinitionRepository.save(def);
    }

    public TestDefinition updateDefinition(String id, TestDefinition updated) {
        TestDefinition def = getDefinitionById(id);
        if (updated.getParameterName() != null) def.setParameterName(updated.getParameterName());
        if (updated.getCategory() != null) def.setCategory(updated.getCategory());
        if (updated.getUnit() != null) def.setUnit(updated.getUnit());
        def.setMinLimit(updated.getMinLimit());
        def.setMaxLimit(updated.getMaxLimit());
        if (updated.getPermittedQualitative() != null) def.setPermittedQualitative(updated.getPermittedQualitative());
        if (updated.getRuleType() != null) def.setRuleType(updated.getRuleType());
        if (updated.getWaterSource() != null) def.setWaterSource(updated.getWaterSource());
        if (updated.getReferenceStandard() != null) def.setReferenceStandard(updated.getReferenceStandard());
        if (updated.getTestMethod() != null) def.setTestMethod(updated.getTestMethod());
        if (updated.getDescription() != null) def.setDescription(updated.getDescription());
        def.setActive(updated.isActive());
        return testDefinitionRepository.save(def);
    }

    public void deleteDefinition(String id) {
        TestDefinition def = getDefinitionById(id);
        testDefinitionRepository.delete(def);
    }
}
