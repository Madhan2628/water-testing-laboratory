package com.wtlms.service;

import com.wtlms.model.*;
import com.wtlms.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DataSeederService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeederService.class);

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final SampleRepository sampleRepository;
    private final TestDefinitionRepository testDefinitionRepository;
    private final TestResultRepository testResultRepository;
    private final ReportRepository reportRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final ComplianceEngineService complianceEngineService;

    @Value("${app.seed-demo-data:true}")
    private boolean seedEnabled;

    public DataSeederService(UserRepository userRepository,
                             CustomerRepository customerRepository,
                             SampleRepository sampleRepository,
                             TestDefinitionRepository testDefinitionRepository,
                             TestResultRepository testResultRepository,
                             ReportRepository reportRepository,
                             NotificationRepository notificationRepository,
                             PasswordEncoder passwordEncoder,
                             ComplianceEngineService complianceEngineService) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.sampleRepository = sampleRepository;
        this.testDefinitionRepository = testDefinitionRepository;
        this.testResultRepository = testResultRepository;
        this.reportRepository = reportRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.complianceEngineService = complianceEngineService;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Data seeding is disabled by configuration.");
            return;
        }

        if (userRepository.count() > 0) {
            log.info("Database already initialized with {} users. Skipping automatic seeding.", userRepository.count());
            return;
        }

        log.info("Seeding realistic synthetic demonstration data for Water Testing Laboratory Management System...");
        seedUsersAndCustomers();
        seedTestDefinitions();
        seedSamplesAndResults();
        log.info("Data seeding complete!");
    }

    private void seedUsersAndCustomers() {
        // 1. Admin
        User admin = new User(
                "admin@watertest.com",
                passwordEncoder.encode("AdminPassword123!"),
                "Dr. Elizabeth Shaw (Lab Director & QA)",
                "+1 555-0100",
                "AquaPure Laboratory Headquarters",
                Role.ROLE_ADMIN
        );
        userRepository.save(admin);

        // 2. Laboratory Staff Accounts
        User staff1 = new User(
                "chemist@watertest.com",
                passwordEncoder.encode("StaffPassword123!"),
                "Sarah Connor (Senior Chemist)",
                "+1 555-0101",
                "Inorganic Chemistry Testing Wing",
                Role.ROLE_LABORATORY_STAFF
        );
        User staff2 = new User(
                "microbiologist@watertest.com",
                passwordEncoder.encode("StaffPassword123!"),
                "David Miller (Microbiologist)",
                "+1 555-0102",
                "Microbiology & Pathogen Wing",
                Role.ROLE_LABORATORY_STAFF
        );
        User staff3 = new User(
                "analyst@watertest.com",
                passwordEncoder.encode("StaffPassword123!"),
                "Priya Sharma (Quality Analyst)",
                "+1 555-0103",
                "Physical Analysis & Instrumentation",
                Role.ROLE_LABORATORY_STAFF
        );
        userRepository.saveAll(List.of(staff1, staff2, staff3));

        // 3. 10 Sample Customers
        String[][] customersData = {
                {"CUST-2026-0001", "GreenValley Agriculture Farms", "customer1@gmail.com", "+1 555-0104", "Plot 42, River Valley Rd, Green County", "GreenValley Agro Pvt Ltd"},
                {"CUST-2026-0002", "PureBeverage Bottling Corp", "customer2@purebev.com", "+1 555-0105", "Industrial Estate Zone B, Plant 7", "PureBeverage Bottling Corp"},
                {"CUST-2026-0003", "Metro Municipal Water Board", "customer3@citywater.org", "+1 555-0106", "Civic Center Building, 4th Floor", "Metro Municipal Council"},
                {"CUST-2026-0004", "Apex Pharmaceuticals Ltd", "customer4@apextech.com", "+1 555-0107", "BioTech Industrial Corridor, Suite 12", "Apex Pharma Global"},
                {"CUST-2026-0005", "Riverview Residential Complex", "customer5@riverview.org", "+1 555-0108", "88 Panorama Way, Riverside District", "Riverview HOA"},
                {"CUST-2026-0006", "BlueOcean Aquaculture Hatcheries", "customer6@blueocean.com", "+1 555-0109", "Coastal Road Bay 3, Coastal Region", "BlueOcean Marine Farms"},
                {"CUST-2026-0007", "Himalayan Springs Bottlers", "customer7@himalaya.org", "+1 555-0110", "Foothill Estate 5, Mountain Pass", "Himalayan Natural Waters"},
                {"CUST-2026-0008", "EcoTextiles Processing Unit", "customer8@ecotextiles.com", "+1 555-0111", "Industrial Corridor Sector 9", "EcoTextiles Dyeing Division"},
                {"CUST-2026-0009", "Serene Gardens Gated Community", "customer9@serenegardens.in", "+1 555-0112", "Greenwood Boulevard 15", "Serene Gardens Association"},
                {"CUST-2026-0010", "Grand Horizon Luxury Resort", "customer10@grandhorizon.hotel", "+1 555-0113", "Oceanview Cliff Drive 1", "Grand Horizon Hospitality"}
        };

        for (String[] c : customersData) {
            User custUser = new User(
                    c[2],
                    passwordEncoder.encode("CustomerPassword123!"),
                    c[1],
                    c[3],
                    c[5],
                    Role.ROLE_CUSTOMER
            );
            User savedUser = userRepository.save(custUser);

            Customer cust = new Customer(c[0], c[1], c[2], c[3], c[4], c[5], savedUser.getId());
            customerRepository.save(cust);
        }
    }

    private void seedTestDefinitions() {
        List<TestDefinition> defs = List.of(
                // Physical Parameters
                new TestDefinition("Colour", "Physical", "Hazen", null, 15.0, "MAX_ONLY", "All", "IS 10500:2012", "IS 3025 (Part 4)"),
                new TestDefinition("Odour", "Physical", "TON", null, 1.0, "QUALITATIVE", "All", "IS 10500:2012", "IS 3025 (Part 5)"),
                new TestDefinition("Turbidity", "Physical", "NTU", null, 5.0, "MAX_ONLY", "All", "IS 10500:2012", "IS 3025 (Part 10)"),
                new TestDefinition("Temperature", "Physical", "°C", null, 25.0, "MAX_ONLY", "All", "IS 10500:2012", "IS 3025 (Part 9)"),
                new TestDefinition("TDS (Total Dissolved Solids)", "Physical", "mg/L", null, 500.0, "MAX_ONLY", "Drinking water", "IS 10500:2012", "IS 3025 (Part 16)"),
                new TestDefinition("Electrical Conductivity", "Physical", "µS/cm", null, 1000.0, "MAX_ONLY", "All", "IS 3025 (Part 14)", "IS 3025 (Part 14)"),

                // Chemical Parameters
                new TestDefinition("pH", "Chemical", "pH units", 6.5, 8.5, "RANGE", "All", "IS 10500:2012", "IS 3025 (Part 11)"),
                new TestDefinition("Total Hardness (as CaCO3)", "Chemical", "mg/L", null, 200.0, "MAX_ONLY", "All", "IS 10500:2012", "IS 3025 (Part 21)"),
                new TestDefinition("Chloride (as Cl)", "Chemical", "mg/L", null, 250.0, "MAX_ONLY", "All", "IS 10500:2012", "IS 3025 (Part 32)"),
                new TestDefinition("Fluoride (as F)", "Chemical", "mg/L", null, 1.0, "MAX_ONLY", "All", "IS 10500:2012", "IS 3025 (Part 60)"),
                new TestDefinition("Nitrate (as NO3)", "Chemical", "mg/L", null, 45.0, "MAX_ONLY", "All", "IS 10500:2012", "IS 3025 (Part 34)"),
                new TestDefinition("Iron (as Fe)", "Chemical", "mg/L", null, 1.0, "MAX_ONLY", "All", "IS 10500:2012", "IS 3025 (Part 53)"),
                new TestDefinition("Total Alkalinity (as CaCO3)", "Chemical", "mg/L", null, 200.0, "MAX_ONLY", "All", "IS 10500:2012", "IS 3025 (Part 23)"),
                new TestDefinition("Sulphate (as SO4)", "Chemical", "mg/L", null, 200.0, "MAX_ONLY", "All", "IS 10500:2012", "IS 3025 (Part 24)"),

                // Microbiological Parameters
                new TestDefinition("Total Coliform", "Microbiological", "MPN/100ml", null, 0.0, "MICROBIOLOGICAL", "All", "IS 10500:2012", "IS 15185"),
                new TestDefinition("E. coli", "Microbiological", "CFU/100ml", null, 0.0, "MICROBIOLOGICAL", "All", "IS 10500:2012", "IS 15185"),
                new TestDefinition("Fecal Coliform", "Microbiological", "MPN/100ml", null, 0.0, "MICROBIOLOGICAL", "All", "IS 10500:2012", "IS 15185")
        );

        for (TestDefinition d : defs) {
            if ("Odour".equals(d.getParameterName())) {
                d.setPermittedQualitative("Agreeable");
            }
            testDefinitionRepository.save(d);
        }
    }

    private void seedSamplesAndResults() {
        List<Customer> customers = customerRepository.findAll();
        if (customers.isEmpty()) return;

        // 20 realistic samples spanning different water sources and lifecycle statuses
        Object[][] sampleSpecs = {
                // sampleId, customerIndex, waterSource, sampleType, location, status, daysAgo
                {"WTL-2026-0001", 1, "Drinking water", "Potable Water", "Main Bottling Line A Intake", SampleStatus.APPROVED, 30},
                {"WTL-2026-0002", 0, "Borewell water", "Groundwater", "Agricultural Borewell #3 North Field", SampleStatus.APPROVED, 28},
                {"WTL-2026-0003", 2, "Drinking water", "Municipal Supply", "Ward 12 Distribution Reservoir", SampleStatus.APPROVED, 25},
                {"WTL-2026-0004", 3, "Treated water", "Pharmaceutical Grade", "Reverse Osmosis Polisher Unit 2", SampleStatus.APPROVED, 22},
                {"WTL-2026-0005", 4, "Groundwater", "Community Borewell", "Building B Deep Submersible Well", SampleStatus.REPORT_PENDING_APPROVAL, 18},
                {"WTL-2026-0006", 5, "Lake water", "Aquaculture Water", "Shrimp Hatchery Pond 4 Intake", SampleStatus.REPORT_PENDING_APPROVAL, 15},
                {"WTL-2026-0007", 6, "Drinking water", "Natural Spring", "Spring Catchment Basin Alpine Point", SampleStatus.TESTING_COMPLETED, 12},
                {"WTL-2026-0008", 7, "Industrial wastewater", "Effluent Discharge", "ETP Primary Clarifier Discharge", SampleStatus.TESTING_IN_PROGRESS, 10},
                {"WTL-2026-0009", 8, "Borewell water", "Domestic Raw", "Clubhouse Borewell Pump Station", SampleStatus.TESTING_IN_PROGRESS, 9},
                {"WTL-2026-0010", 9, "Treated water", "Swimming Pool Water", "Main Resort Pool Filtration Loop", SampleStatus.TESTING_IN_PROGRESS, 8},
                {"WTL-2026-0011", 0, "River water", "Irrigation Supply", "Kaveri Canal Lift Irrigation Point", SampleStatus.SAMPLE_RECEIVED, 7},
                {"WTL-2026-0012", 1, "Drinking water", "Filtered Water", "Pre-Packaging Storage Silo 2", SampleStatus.SAMPLE_RECEIVED, 6},
                {"WTL-2026-0013", 2, "Pond water", "Raw Surface Water", "Rainwater Harvesting Retention Pond", SampleStatus.SAMPLE_RECEIVED, 5},
                {"WTL-2026-0014", 3, "Treated water", "Demineralized Water", "Boiler Feed Water Pre-treatment", SampleStatus.REGISTERED, 4},
                {"WTL-2026-0015", 4, "Borewell water", "Residential Well", "South Block Underground Sump", SampleStatus.REGISTERED, 3},
                {"WTL-2026-0016", 5, "Lake water", "Fish Pond Water", "Fingerling Nursery Tank 1", SampleStatus.REQUESTED, 3},
                {"WTL-2026-0017", 6, "Drinking water", "Raw Spring Water", "Valley Stream High Yield Tap", SampleStatus.REQUESTED, 2},
                {"WTL-2026-0018", 7, "Industrial wastewater", "Raw Effluent", "Textile Wet Processing Outfall", SampleStatus.REJECTED, 14},
                {"WTL-2026-0019", 8, "Groundwater", "Raw Borewell", "Garden Irrigation Borewell", SampleStatus.REQUESTED, 1},
                {"WTL-2026-0020", 9, "Drinking water", "Kitchen RO Water", "Resort Master Kitchen Tap", SampleStatus.REQUESTED, 1}
        };

        int repCounter = 1;

        for (Object[] spec : sampleSpecs) {
            String sampleId = (String) spec[0];
            int cIndex = (int) spec[1];
            String waterSource = (String) spec[2];
            String sampleType = (String) spec[3];
            String location = (String) spec[4];
            SampleStatus status = (SampleStatus) spec[5];
            int daysAgo = (int) spec[6];

            Customer cust = customers.get(cIndex % customers.size());
            LocalDateTime createdTime = LocalDateTime.now().minusDays(daysAgo);

            Sample sample = new Sample();
            sample.setSampleId(sampleId);
            sample.setCustomerId(cust.getUserId());
            sample.setCustomerName(cust.getName());
            sample.setCustomerEmail(cust.getEmail());
            sample.setCustomerPhone(cust.getPhone());
            sample.setCollectionDateTime(createdTime.minusHours(4));
            sample.setCollectionLocation(location);
            sample.setWaterSource(waterSource);
            sample.setSampleType(sampleType);
            sample.setSampleDescription("Synthetic laboratory demonstration sample collected for comprehensive physicochemical analysis");
            sample.setRequestedTests(List.of("pH", "Turbidity", "TDS (Total Dissolved Solids)", "Total Hardness (as CaCO3)", "Chloride (as Cl)", "Total Coliform", "E. coli"));
            sample.setSampleReceivedDate(createdTime.plusHours(2));
            sample.setSampleReceivedBy("Sarah Connor (Senior Chemist)");
            sample.setSampleCondition("Good (Cold chain preserved at 4°C)");
            sample.setPriority(cIndex % 3 == 0 ? "High" : "Normal");
            sample.setStatus(status);
            sample.setCreatedAt(createdTime);
            sample.setUpdatedAt(createdTime.plusHours(6));

            // Status history
            sample.getStatusHistory().add(new StatusHistoryItem(SampleStatus.REQUESTED, cust.getEmail(), "Sample registration requested"));
            if (status != SampleStatus.REQUESTED) {
                sample.getStatusHistory().add(new StatusHistoryItem(SampleStatus.REGISTERED, "admin@watertest.com", "Sample accepted at lab intake"));
            }
            if (status != SampleStatus.REQUESTED && status != SampleStatus.REGISTERED) {
                sample.getStatusHistory().add(new StatusHistoryItem(SampleStatus.SAMPLE_RECEIVED, "chemist@watertest.com", "Sample checked into lab"));
            }
            if (status == SampleStatus.TESTING_IN_PROGRESS || status == SampleStatus.TESTING_COMPLETED ||
                    status == SampleStatus.REPORT_PENDING_APPROVAL || status == SampleStatus.APPROVED) {
                sample.getStatusHistory().add(new StatusHistoryItem(SampleStatus.TESTING_IN_PROGRESS, "chemist@watertest.com", "Chemical & microbiological assays in progress"));
            }
            if (status == SampleStatus.TESTING_COMPLETED || status == SampleStatus.REPORT_PENDING_APPROVAL || status == SampleStatus.APPROVED) {
                sample.getStatusHistory().add(new StatusHistoryItem(SampleStatus.TESTING_COMPLETED, "microbiologist@watertest.com", "All assay runs finished"));
            }
            if (status == SampleStatus.REPORT_PENDING_APPROVAL || status == SampleStatus.APPROVED) {
                sample.getStatusHistory().add(new StatusHistoryItem(SampleStatus.REPORT_PENDING_APPROVAL, "chemist@watertest.com", "Draft report compiled and submitted for QA review"));
            }
            if (status == SampleStatus.APPROVED) {
                sample.getStatusHistory().add(new StatusHistoryItem(SampleStatus.APPROVED, "admin@watertest.com", "Report reviewed, verified, and officially released"));
            }
            if (status == SampleStatus.REJECTED) {
                sample.getStatusHistory().add(new StatusHistoryItem(SampleStatus.REJECTED, "admin@watertest.com", "Sample container compromised during transit"));
            }

            Sample savedSample = sampleRepository.save(sample);

            // Populate test results for samples that have progressed to testing or beyond
            boolean hasResults = (status == SampleStatus.TESTING_IN_PROGRESS ||
                    status == SampleStatus.TESTING_COMPLETED ||
                    status == SampleStatus.REPORT_PENDING_APPROVAL ||
                    status == SampleStatus.APPROVED);

            if (hasResults) {
                boolean isSampleNonCompliant = sampleId.equals("WTL-2026-0002") || sampleId.equals("WTL-2026-0005") || sampleId.equals("WTL-2026-0008");

                String[][] paramValues;
                if (!isSampleNonCompliant) {
                    // Fully compliant values
                    paramValues = new String[][]{
                            {"Colour", "2", "Physical", "IS 3025 (Part 4)", "Hazen"},
                            {"Odour", "Agreeable", "Physical", "IS 3025 (Part 5)", "TON"},
                            {"Turbidity", "1.2", "Physical", "IS 3025 (Part 10)", "NTU"},
                            {"TDS (Total Dissolved Solids)", "280", "Physical", "IS 3025 (Part 16)", "mg/L"},
                            {"pH", "7.4", "Chemical", "IS 3025 (Part 11)", "pH units"},
                            {"Total Hardness (as CaCO3)", "140", "Chemical", "IS 3025 (Part 21)", "mg/L"},
                            {"Chloride (as Cl)", "95", "Chemical", "IS 3025 (Part 32)", "mg/L"},
                            {"Fluoride (as F)", "0.6", "Chemical", "IS 3025 (Part 60)", "mg/L"},
                            {"Total Coliform", "0", "Microbiological", "IS 15185", "MPN/100ml"},
                            {"E. coli", "Absent", "Microbiological", "IS 15185", "CFU/100ml"}
                    };
                } else {
                    // Non-compliant sample with realistic elevated values
                    paramValues = new String[][]{
                            {"Colour", "18", "Physical", "IS 3025 (Part 4)", "Hazen"}, // Exceeds 15
                            {"Odour", "Disagreeable / Earthy", "Physical", "IS 3025 (Part 5)", "TON"}, // Fails
                            {"Turbidity", "7.8", "Physical", "IS 3025 (Part 10)", "NTU"}, // Exceeds 5
                            {"TDS (Total Dissolved Solids)", "720", "Physical", "IS 3025 (Part 16)", "mg/L"}, // Exceeds 500
                            {"pH", "9.1", "Chemical", "IS 3025 (Part 11)", "pH units"}, // Exceeds 8.5
                            {"Total Hardness (as CaCO3)", "260", "Chemical", "IS 3025 (Part 21)", "mg/L"}, // Exceeds 200
                            {"Chloride (as Cl)", "180", "Chemical", "IS 3025 (Part 32)", "mg/L"},
                            {"Fluoride (as F)", "1.4", "Chemical", "IS 3025 (Part 60)", "mg/L"}, // Exceeds 1.0
                            {"Total Coliform", "12", "Microbiological", "IS 15185", "MPN/100ml"}, // Bacterial presence
                            {"E. coli", "Detected", "Microbiological", "IS 15185", "CFU/100ml"} // Fails zero tolerance
                    };
                }

                List<TestResultSnapshot> snapshots = new ArrayList<>();
                int passed = 0;
                int failed = 0;

                for (String[] pv : paramValues) {
                    ComplianceEngineService.EvaluationOutcome outcome =
                            complianceEngineService.evaluateParameter(pv[0], pv[1], waterSource);

                    TestResult tr = new TestResult();
                    tr.setSampleId(sample.getSampleId());
                    tr.setSampleRefId(sample.getId());
                    tr.setParameterName(pv[0]);
                    tr.setCategory(pv[2]);
                    tr.setMeasuredValue(pv[1]);
                    tr.setNumericValue(outcome.getNumericValue());
                    tr.setUnit(pv[4]);
                    tr.setReferenceMin(outcome.getRefMin());
                    tr.setReferenceMax(outcome.getRefMax());
                    tr.setReferenceLimitDisplay(outcome.getReferenceLimitDisplay());
                    tr.setReferenceStandard(outcome.getStandard() != null ? outcome.getStandard() : "IS 10500:2012");
                    tr.setTestMethod(pv[3]);
                    tr.setComplianceStatus(outcome.getComplianceStatus());
                    tr.setInterpretation(outcome.getInterpretation());
                    tr.setLaboratoryRemarks(outcome.getComplianceStatus().equals("COMPLIANT") ? "Parameter verified compliant." : "Exceeds standard permissible limit.");
                    tr.setTestedBy("Sarah Connor (Senior Chemist)");
                    tr.setTestingDate(createdTime.plusHours(8));
                    testResultRepository.save(tr);

                    snapshots.add(new TestResultSnapshot(
                            tr.getParameterName(),
                            tr.getCategory(),
                            tr.getMeasuredValue(),
                            tr.getUnit(),
                            tr.getReferenceLimitDisplay(),
                            tr.getReferenceStandard(),
                            tr.getTestMethod(),
                            tr.getComplianceStatus(),
                            tr.getInterpretation(),
                            tr.getLaboratoryRemarks()
                    ));

                    if ("COMPLIANT".equalsIgnoreCase(outcome.getComplianceStatus())) {
                        passed++;
                    } else {
                        failed++;
                    }
                }

                // If approved or pending approval, create Report document
                if (status == SampleStatus.APPROVED || status == SampleStatus.REPORT_PENDING_APPROVAL) {
                    Report report = new Report();
                    report.setReportNumber(String.format("REP-2026-%04d", repCounter++));
                    report.setSampleId(sample.getSampleId());
                    report.setSampleRefId(sample.getId());
                    report.setCustomerId(cust.getUserId());
                    report.setCustomerName(cust.getName());
                    report.setCustomerEmail(cust.getEmail());
                    report.setCustomerPhone(cust.getPhone());
                    report.setCustomerAddress(cust.getAddress());
                    report.setCustomerOrganization(cust.getOrganization());
                    report.setCollectionLocation(sample.getCollectionLocation());
                    report.setWaterSource(sample.getWaterSource());
                    report.setSampleType(sample.getSampleType());
                    report.setSampleCondition(sample.getSampleCondition());
                    report.setCollectionDate(sample.getCollectionDateTime());
                    report.setReceivedDate(sample.getSampleReceivedDate());
                    report.setTestingCompletedDate(createdTime.plusHours(12));
                    report.setParametersSnapshot(snapshots);
                    report.setTotalParameters(snapshots.size());
                    report.setPassedParameters(passed);
                    report.setFailedParameters(failed);
                    report.setCompliancePercentage(Math.round(((double) passed / snapshots.size()) * 1000.0) / 10.0);
                    report.setPreparedBy("Sarah Connor (Senior Chemist)");
                    report.setPreparedDate(createdTime.plusHours(14));

                    if (failed == 0) {
                        report.setOverallAssessment("COMPLIANT");
                        report.setAssessmentSummary("All tested parameters comply with the permissible requirements of IS 10500:2012 for " + waterSource + ".");
                    } else {
                        report.setOverallAssessment("NON_COMPLIANT");
                        report.setAssessmentSummary(failed + " of " + snapshots.size() + " tested parameters failed permissible limits. Unfit for potable use without prior remediation.");
                    }

                    if (status == SampleStatus.APPROVED) {
                        report.setStatus(ReportStatus.APPROVED);
                        report.setReviewedBy("Dr. Elizabeth Shaw (QA Officer)");
                        report.setReviewerDesignation("Quality Assurance & Regulatory Audits");
                        report.setReviewedDate(createdTime.plusHours(20));
                        report.setReviewerComments("Reviewed assay calibrations and verified data authenticity.");
                        report.getAuditTrail().add(new ReportAuditItem("APPROVED", "admin@watertest.com", "Dr. Elizabeth Shaw", "ROLE_ADMIN", "Approved and published report"));
                    } else {
                        report.setStatus(ReportStatus.PENDING_APPROVAL);
                        report.getAuditTrail().add(new ReportAuditItem("SUBMITTED", "chemist@watertest.com", "Sarah Connor", "ROLE_LABORATORY_STAFF", "Draft report submitted for QA review"));
                    }

                    reportRepository.save(report);
                }
            }
        }

        // Seed realistic notifications for alerts and testing activities
        List<Notification> initialNotifications = List.of(
                new Notification(null, "ROLE_ADMIN", "NON_COMPLIANT_ALERT", "Non-Compliance Alert: WTL-2026-0002", "Sample WTL-2026-0002 has parameters exceeding maximum permissible limits.", "WTL-2026-0002", null),
                new Notification(null, "ROLE_ADMIN", "REPORT_GENERATED", "Report Pending Review: REP-2026-0005", "Report for sample WTL-2026-0005 has been submitted for QA verification and approval.", "WTL-2026-0005", null),
                new Notification(null, "ROLE_LABORATORY_STAFF", "SAMPLE_REGISTERED", "New Sample Registered: WTL-2026-0014", "Demineralized Water sample WTL-2026-0014 is queued for laboratory testing.", "WTL-2026-0014", null),
                new Notification(null, "ROLE_CUSTOMER", "REPORT_APPROVED", "Test Report Ready: REP-2026-0001", "Your certified water testing report REP-2026-0001 is now approved and available for PDF download.", "WTL-2026-0001", null)
        );
        notificationRepository.saveAll(initialNotifications);
    }
}
