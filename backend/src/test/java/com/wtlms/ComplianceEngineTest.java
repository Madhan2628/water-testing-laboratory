package com.wtlms;

import com.wtlms.model.TestDefinition;
import com.wtlms.repository.TestDefinitionRepository;
import com.wtlms.service.ComplianceEngineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class ComplianceEngineTest {

    private TestDefinitionRepository testDefinitionRepository;
    private ComplianceEngineService complianceEngineService;

    @BeforeEach
    void setUp() {
        testDefinitionRepository = Mockito.mock(TestDefinitionRepository.class);
        complianceEngineService = new ComplianceEngineService(testDefinitionRepository);

        TestDefinition phDef = new TestDefinition("pH", "Chemical", "pH units", 6.5, 8.5, "RANGE", "All", "IS 10500:2012", "IS 3025");
        TestDefinition tdsDef = new TestDefinition("TDS", "Physical", "mg/L", null, 500.0, "MAX_ONLY", "All", "IS 10500:2012", "IS 3025");
        TestDefinition odourDef = new TestDefinition("Odour", "Physical", "TON", null, 1.0, "QUALITATIVE", "All", "IS 10500:2012", "IS 3025");
        odourDef.setPermittedQualitative("Agreeable");
        TestDefinition coliformDef = new TestDefinition("Total Coliform", "Microbiological", "MPN/100ml", null, 0.0, "MICROBIOLOGICAL", "All", "IS 10500:2012", "IS 15185");

        when(testDefinitionRepository.findByActiveTrue()).thenReturn(List.of(phDef, tdsDef, odourDef, coliformDef));
        when(testDefinitionRepository.findByParameterName("pH")).thenReturn(Optional.of(phDef));
        when(testDefinitionRepository.findByParameterName("TDS")).thenReturn(Optional.of(tdsDef));
        when(testDefinitionRepository.findByParameterName("Odour")).thenReturn(Optional.of(odourDef));
        when(testDefinitionRepository.findByParameterName("Total Coliform")).thenReturn(Optional.of(coliformDef));
    }

    @Test
    void testPhRangeEvaluation() {
        // In range: 7.2
        ComplianceEngineService.EvaluationOutcome pass = complianceEngineService.evaluateParameter("pH", "7.2", "Drinking water");
        assertEquals("COMPLIANT", pass.getComplianceStatus());
        assertTrue(pass.getInterpretation().contains("Compliant"));

        // Below min: 5.8
        ComplianceEngineService.EvaluationOutcome low = complianceEngineService.evaluateParameter("pH", "5.8", "Drinking water");
        assertEquals("NON_COMPLIANT", low.getComplianceStatus());

        // Above max: 9.4
        ComplianceEngineService.EvaluationOutcome high = complianceEngineService.evaluateParameter("pH", "9.4", "Drinking water");
        assertEquals("NON_COMPLIANT", high.getComplianceStatus());
    }

    @Test
    void testTdsMaxOnlyEvaluation() {
        // Below 500
        ComplianceEngineService.EvaluationOutcome pass = complianceEngineService.evaluateParameter("TDS", "320", "Drinking water");
        assertEquals("COMPLIANT", pass.getComplianceStatus());

        // Exceeds 500
        ComplianceEngineService.EvaluationOutcome fail = complianceEngineService.evaluateParameter("TDS", "750", "Drinking water");
        assertEquals("NON_COMPLIANT", fail.getComplianceStatus());
        assertTrue(fail.getInterpretation().contains("exceeds"));
    }

    @Test
    void testQualitativeOdourEvaluation() {
        ComplianceEngineService.EvaluationOutcome pass = complianceEngineService.evaluateParameter("Odour", "Agreeable", "Drinking water");
        assertEquals("COMPLIANT", pass.getComplianceStatus());

        ComplianceEngineService.EvaluationOutcome fail = complianceEngineService.evaluateParameter("Odour", "Disagreeable / Chemical", "Drinking water");
        assertEquals("NON_COMPLIANT", fail.getComplianceStatus());
    }

    @Test
    void testMicrobiologicalEvaluation() {
        // Zero or Absent is compliant
        ComplianceEngineService.EvaluationOutcome pass1 = complianceEngineService.evaluateParameter("Total Coliform", "0", "Drinking water");
        assertEquals("COMPLIANT", pass1.getComplianceStatus());

        ComplianceEngineService.EvaluationOutcome pass2 = complianceEngineService.evaluateParameter("Total Coliform", "Absent", "Drinking water");
        assertEquals("COMPLIANT", pass2.getComplianceStatus());

        // Any detected bacterial presence is non-compliant
        ComplianceEngineService.EvaluationOutcome fail1 = complianceEngineService.evaluateParameter("Total Coliform", "14", "Drinking water");
        assertEquals("NON_COMPLIANT", fail1.getComplianceStatus());

        ComplianceEngineService.EvaluationOutcome fail2 = complianceEngineService.evaluateParameter("Total Coliform", "Detected", "Drinking water");
        assertEquals("NON_COMPLIANT", fail2.getComplianceStatus());
    }
}
