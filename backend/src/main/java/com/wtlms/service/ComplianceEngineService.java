package com.wtlms.service;

import com.wtlms.model.TestDefinition;
import com.wtlms.model.TestResult;
import com.wtlms.repository.TestDefinitionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ComplianceEngineService {

    private final TestDefinitionRepository testDefinitionRepository;

    public ComplianceEngineService(TestDefinitionRepository testDefinitionRepository) {
        this.testDefinitionRepository = testDefinitionRepository;
    }

    public static class EvaluationOutcome {
        private String complianceStatus; // COMPLIANT, NON_COMPLIANT, NOT_TESTED
        private String interpretation;
        private Double numericValue;
        private String referenceLimitDisplay;
        private Double refMin;
        private Double refMax;
        private String standard;
        private String unit;
        private String testMethod;
        private String category;

        public EvaluationOutcome() {}

        public String getComplianceStatus() { return complianceStatus; }
        public void setComplianceStatus(String complianceStatus) { this.complianceStatus = complianceStatus; }
        public String getInterpretation() { return interpretation; }
        public void setInterpretation(String interpretation) { this.interpretation = interpretation; }
        public Double getNumericValue() { return numericValue; }
        public void setNumericValue(Double numericValue) { this.numericValue = numericValue; }
        public String getReferenceLimitDisplay() { return referenceLimitDisplay; }
        public void setReferenceLimitDisplay(String referenceLimitDisplay) { this.referenceLimitDisplay = referenceLimitDisplay; }
        public Double getRefMin() { return refMin; }
        public void setRefMin(Double refMin) { this.refMin = refMin; }
        public Double getRefMax() { return refMax; }
        public void setRefMax(Double refMax) { this.refMax = refMax; }
        public String getStandard() { return standard; }
        public void setStandard(String standard) { this.standard = standard; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public String getTestMethod() { return testMethod; }
        public void setTestMethod(String testMethod) { this.testMethod = testMethod; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }

    public EvaluationOutcome evaluateParameter(String parameterName, String rawValue, String waterSource) {
        EvaluationOutcome outcome = new EvaluationOutcome();

        Optional<TestDefinition> defOpt = findMatchingDefinition(parameterName, waterSource);
        if (defOpt.isEmpty()) {
            outcome.setComplianceStatus("COMPLIANT");
            outcome.setInterpretation("No reference criteria defined for parameter: " + parameterName);
            outcome.setReferenceLimitDisplay("Not Specified");
            return outcome;
        }

        TestDefinition def = defOpt.get();
        outcome.setCategory(def.getCategory());
        outcome.setUnit(def.getUnit());
        outcome.setTestMethod(def.getTestMethod());
        outcome.setStandard(def.getReferenceStandard());
        outcome.setRefMin(def.getMinLimit());
        outcome.setRefMax(def.getMaxLimit());

        String ruleType = def.getRuleType() != null ? def.getRuleType().toUpperCase() : "RANGE";
        String valTrimmed = rawValue != null ? rawValue.trim() : "";

        if (valTrimmed.isEmpty()) {
            outcome.setComplianceStatus("NOT_TESTED");
            outcome.setInterpretation("Parameter not tested or empty measurement recorded");
            outcome.setReferenceLimitDisplay(buildLimitDisplay(def));
            return outcome;
        }

        // Parse numerical value if applicable
        Double numericVal = null;
        try {
            numericVal = Double.parseDouble(valTrimmed);
            outcome.setNumericValue(numericVal);
        } catch (NumberFormatException ignored) {
            // Qualitative or compound measurement
        }

        String limitDisplay = buildLimitDisplay(def);
        outcome.setReferenceLimitDisplay(limitDisplay);

        switch (ruleType) {
            case "MICROBIOLOGICAL":
                evaluateMicrobiological(valTrimmed, numericVal, def, outcome);
                break;
            case "QUALITATIVE":
                evaluateQualitative(valTrimmed, def, outcome);
                break;
            case "MAX_ONLY":
                evaluateMaxOnly(numericVal, valTrimmed, def, outcome);
                break;
            case "MIN_ONLY":
                evaluateMinOnly(numericVal, valTrimmed, def, outcome);
                break;
            case "RANGE":
            default:
                evaluateRange(numericVal, valTrimmed, def, outcome);
                break;
        }

        return outcome;
    }

    private void evaluateMicrobiological(String raw, Double num, TestDefinition def, EvaluationOutcome outcome) {
        String lower = raw.toLowerCase();
        boolean isSafe = false;

        if (num != null) {
            isSafe = num <= 0.0;
        } else {
            isSafe = lower.contains("absent") || lower.contains("nil") || lower.contains("none") || lower.contains("< 1") || lower.equals("0");
        }

        if (isSafe) {
            outcome.setComplianceStatus("COMPLIANT");
            outcome.setInterpretation(String.format("Safe: No bacterial contamination detected (%s %s; standard: %s)",
                    raw, def.getUnit() != null ? def.getUnit() : "", def.getReferenceStandard()));
        } else {
            outcome.setComplianceStatus("NON_COMPLIANT");
            outcome.setInterpretation(String.format("Hazard: Bacterial presence detected (%s %s). Fails zero-tolerance safety requirement (%s)",
                    raw, def.getUnit() != null ? def.getUnit() : "", def.getReferenceStandard()));
        }
    }

    private void evaluateQualitative(String raw, TestDefinition def, EvaluationOutcome outcome) {
        String permitted = def.getPermittedQualitative() != null ? def.getPermittedQualitative().toLowerCase() : "agreeable";
        String lower = raw.toLowerCase().trim();

        boolean hasNegativeTerm = lower.contains("disagreeable") ||
                (lower.contains("objectionable") && !lower.contains("unobjectionable")) ||
                lower.contains("foul") || lower.contains("offensive") || lower.contains("chemical") ||
                lower.contains("turbid") || lower.contains("colored");

        boolean matches = !hasNegativeTerm && (
                lower.equals(permitted) ||
                (permitted.contains("agreeable") && (lower.contains("agreeable") || lower.contains("unobjectionable") || lower.contains("clear"))) ||
                (permitted.contains("unobjectionable") && lower.contains("unobjectionable"))
        );

        if (matches) {
            outcome.setComplianceStatus("COMPLIANT");
            outcome.setInterpretation(String.format("Complies with aesthetic quality criteria: %s (%s)", raw, def.getReferenceStandard()));
        } else {
            outcome.setComplianceStatus("NON_COMPLIANT");
            outcome.setInterpretation(String.format("Non-compliant aesthetic quality: %s (Permitted: %s, Standard: %s)",
                    raw, def.getPermittedQualitative(), def.getReferenceStandard()));
        }
    }

    private void evaluateMaxOnly(Double num, String raw, TestDefinition def, EvaluationOutcome outcome) {
        if (num == null) {
            outcome.setComplianceStatus("NON_COMPLIANT");
            outcome.setInterpretation("Invalid numerical format for numerical parameter: " + raw);
            return;
        }

        double max = def.getMaxLimit() != null ? def.getMaxLimit() : Double.MAX_VALUE;
        if (num <= max) {
            outcome.setComplianceStatus("COMPLIANT");
            outcome.setInterpretation(String.format("Compliant: Measured %s %s is within max limit of %s %s (%s)",
                    num, def.getUnit(), max, def.getUnit(), def.getReferenceStandard()));
        } else {
            outcome.setComplianceStatus("NON_COMPLIANT");
            outcome.setInterpretation(String.format("Exceeded limit: Measured %s %s exceeds allowable maximum of %s %s (%s)",
                    num, def.getUnit(), max, def.getUnit(), def.getReferenceStandard()));
        }
    }

    private void evaluateMinOnly(Double num, String raw, TestDefinition def, EvaluationOutcome outcome) {
        if (num == null) {
            outcome.setComplianceStatus("NON_COMPLIANT");
            outcome.setInterpretation("Invalid numerical format: " + raw);
            return;
        }

        double min = def.getMinLimit() != null ? def.getMinLimit() : 0.0;
        if (num >= min) {
            outcome.setComplianceStatus("COMPLIANT");
            outcome.setInterpretation(String.format("Compliant: Measured %s %s meets minimum threshold of %s %s (%s)",
                    num, def.getUnit(), min, def.getUnit(), def.getReferenceStandard()));
        } else {
            outcome.setComplianceStatus("NON_COMPLIANT");
            outcome.setInterpretation(String.format("Below threshold: Measured %s %s is lower than required minimum of %s %s (%s)",
                    num, def.getUnit(), min, def.getUnit(), def.getReferenceStandard()));
        }
    }

    private void evaluateRange(Double num, String raw, TestDefinition def, EvaluationOutcome outcome) {
        if (num == null) {
            outcome.setComplianceStatus("NON_COMPLIANT");
            outcome.setInterpretation("Invalid numerical format: " + raw);
            return;
        }

        Double min = def.getMinLimit();
        Double max = def.getMaxLimit();

        boolean minOk = min == null || num >= min;
        boolean maxOk = max == null || num <= max;

        if (minOk && maxOk) {
            outcome.setComplianceStatus("COMPLIANT");
            outcome.setInterpretation(String.format("Compliant: Measured %s %s is within acceptable range %s (%s)",
                    num, def.getUnit(), outcome.getReferenceLimitDisplay(), def.getReferenceStandard()));
        } else {
            outcome.setComplianceStatus("NON_COMPLIANT");
            outcome.setInterpretation(String.format("Out of range: Measured %s %s falls outside acceptable range %s (%s)",
                    num, def.getUnit(), outcome.getReferenceLimitDisplay(), def.getReferenceStandard()));
        }
    }

    private String buildLimitDisplay(TestDefinition def) {
        if ("MICROBIOLOGICAL".equalsIgnoreCase(def.getRuleType())) {
            return "Absent / 0 " + (def.getUnit() != null ? def.getUnit() : "MPN/100ml");
        }
        if ("QUALITATIVE".equalsIgnoreCase(def.getRuleType())) {
            return def.getPermittedQualitative() != null ? def.getPermittedQualitative() : "Agreeable";
        }
        if (def.getMinLimit() != null && def.getMaxLimit() != null) {
            return def.getMinLimit() + " - " + def.getMaxLimit() + " " + (def.getUnit() != null ? def.getUnit() : "");
        }
        if (def.getMaxLimit() != null) {
            return "Max " + def.getMaxLimit() + " " + (def.getUnit() != null ? def.getUnit() : "");
        }
        if (def.getMinLimit() != null) {
            return "Min " + def.getMinLimit() + " " + (def.getUnit() != null ? def.getUnit() : "");
        }
        return "Standard Specification";
    }

    private Optional<TestDefinition> findMatchingDefinition(String parameterName, String waterSource) {
        List<TestDefinition> allDefs = testDefinitionRepository.findByActiveTrue();
        // First try exact match with waterSource
        if (waterSource != null && !waterSource.isBlank()) {
            for (TestDefinition d : allDefs) {
                if (d.getParameterName().equalsIgnoreCase(parameterName) && waterSource.equalsIgnoreCase(d.getWaterSource())) {
                    return Optional.of(d);
                }
            }
        }
        // Fallback to "All" or default
        for (TestDefinition d : allDefs) {
            if (d.getParameterName().equalsIgnoreCase(parameterName) && ("All".equalsIgnoreCase(d.getWaterSource()) || d.getWaterSource() == null)) {
                return Optional.of(d);
            }
        }
        // Fallback to any definition with that parameter name
        return testDefinitionRepository.findByParameterName(parameterName);
    }
}
