// Demo fallback provider for static showcase deployments (e.g. Vercel)
// Active when a live Spring Boot backend instance is not connected.

const DEMO_USERS = [
  {
    id: "usr-admin-01",
    email: "admin@watertest.com",
    fullName: "Dr. Elizabeth Shaw (Lab Director & QA)",
    role: "ROLE_ADMIN",
    phone: "+1 555-0100",
    organization: "AquaPure Laboratory Headquarters"
  },
  {
    id: "usr-staff-01",
    email: "chemist@watertest.com",
    fullName: "Sarah Connor (Senior Chemist)",
    role: "ROLE_LABORATORY_STAFF",
    phone: "+1 555-0101",
    organization: "Inorganic Chemistry Testing Wing"
  },
  {
    id: "usr-staff-02",
    email: "microbiologist@watertest.com",
    fullName: "David Miller (Microbiologist)",
    role: "ROLE_LABORATORY_STAFF",
    phone: "+1 555-0102",
    organization: "Microbiology & Pathogen Wing"
  },
  {
    id: "usr-cust-01",
    email: "customer1@gmail.com",
    fullName: "GreenValley Agriculture Farms",
    role: "ROLE_CUSTOMER",
    phone: "+1 555-0104",
    organization: "GreenValley Agro Pvt Ltd"
  },
  {
    id: "usr-cust-02",
    email: "customer2@purebev.com",
    fullName: "PureBeverage Bottling Corp",
    role: "ROLE_CUSTOMER",
    phone: "+1 555-0105",
    organization: "PureBeverage Bottling Corp"
  }
];

const DEMO_TESTS = [
  { id: "t1", parameterName: "pH", category: "Chemical", unit: "pH units", minLimit: 6.5, maxLimit: 8.5, ruleType: "RANGE", applicableWaterSource: "All", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 11)", active: true },
  { id: "t2", parameterName: "Total Dissolved Solids (TDS)", category: "Physical", unit: "mg/L", minLimit: null, maxLimit: 500.0, ruleType: "MAX_ONLY", applicableWaterSource: "Drinking water", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 16)", active: true },
  { id: "t3", parameterName: "Turbidity", category: "Physical", unit: "NTU", minLimit: null, maxLimit: 5.0, ruleType: "MAX_ONLY", applicableWaterSource: "All", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 10)", active: true },
  { id: "t4", parameterName: "Colour", category: "Physical", unit: "Hazen", minLimit: null, maxLimit: 15.0, ruleType: "MAX_ONLY", applicableWaterSource: "All", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 4)", active: true },
  { id: "t5", parameterName: "Odour", category: "Physical", unit: "TON", minLimit: null, maxLimit: 1.0, ruleType: "QUALITATIVE", applicableWaterSource: "All", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 5)", permittedQualitative: "Agreeable", active: true },
  { id: "t6", parameterName: "Total Hardness", category: "Chemical", unit: "mg/L", minLimit: null, maxLimit: 200.0, ruleType: "MAX_ONLY", applicableWaterSource: "All", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 21)", active: true },
  { id: "t7", parameterName: "Chloride", category: "Chemical", unit: "mg/L", minLimit: null, maxLimit: 250.0, ruleType: "MAX_ONLY", applicableWaterSource: "All", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 32)", active: true },
  { id: "t8", parameterName: "Fluoride", category: "Chemical", unit: "mg/L", minLimit: null, maxLimit: 1.0, ruleType: "MAX_ONLY", applicableWaterSource: "All", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 60)", active: true },
  { id: "t9", parameterName: "Nitrate", category: "Chemical", unit: "mg/L", minLimit: null, maxLimit: 45.0, ruleType: "MAX_ONLY", applicableWaterSource: "All", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 34)", active: true },
  { id: "t10", parameterName: "Iron", category: "Chemical", unit: "mg/L", minLimit: null, maxLimit: 1.0, ruleType: "MAX_ONLY", applicableWaterSource: "All", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 53)", active: true },
  { id: "t11", parameterName: "Total Coliform", category: "Microbiological", unit: "MPN/100ml", minLimit: null, maxLimit: 0.0, ruleType: "MICROBIOLOGICAL", applicableWaterSource: "All", referenceStandard: "IS 10500:2012", testMethod: "IS 15185", active: true },
  { id: "t12", parameterName: "E. coli", category: "Microbiological", unit: "CFU/100ml", minLimit: null, maxLimit: 0.0, ruleType: "MICROBIOLOGICAL", applicableWaterSource: "All", referenceStandard: "IS 10500:2012", testMethod: "IS 15185", active: true }
];

let demoSamples = [
  {
    id: "s-001",
    sampleId: "WTL-2026-0001",
    customerName: "GreenValley Agriculture Farms",
    customerEmail: "customer1@gmail.com",
    customerPhone: "+1 555-0104",
    waterSource: "Drinking water",
    sampleType: "Potable Water",
    collectionLocation: "Intake Borewell Line A",
    collectionDateTime: "2026-10-25T09:00:00Z",
    sampleReceivedDate: "2026-10-25T11:30:00Z",
    sampleCondition: "Clear, Sealed amber container",
    status: "APPROVED",
    remarks: "Quarterly drinking compliance check",
    createdAt: "2026-10-25T09:00:00Z"
  },
  {
    id: "s-002",
    sampleId: "WTL-2026-0002",
    customerName: "PureBeverage Bottling Corp",
    customerEmail: "customer2@purebev.com",
    customerPhone: "+1 555-0105",
    waterSource: "Groundwater",
    sampleType: "Raw Water",
    collectionLocation: "Deep Submersible Well #4",
    collectionDateTime: "2026-10-24T14:00:00Z",
    sampleReceivedDate: "2026-10-24T16:00:00Z",
    sampleCondition: "Turbid with mineral residue",
    status: "APPROVED",
    remarks: "Pre-filtration mineral assessment",
    createdAt: "2026-10-24T14:00:00Z"
  },
  {
    id: "s-003",
    sampleId: "WTL-2026-0003",
    customerName: "GreenValley Agriculture Farms",
    customerEmail: "customer1@gmail.com",
    customerPhone: "+1 555-0104",
    waterSource: "Borewell water",
    sampleType: "Irrigation Water",
    collectionLocation: "East Field Irrigation Well",
    collectionDateTime: "2026-10-26T08:30:00Z",
    sampleReceivedDate: "2026-10-26T10:00:00Z",
    sampleCondition: "Acceptable, 4°C chilled coolbox",
    status: "REPORT_PENDING_APPROVAL",
    remarks: "Testing before planting season",
    createdAt: "2026-10-26T08:30:00Z"
  },
  {
    id: "s-004",
    sampleId: "WTL-2026-0004",
    customerName: "PureBeverage Bottling Corp",
    customerEmail: "customer2@purebev.com",
    customerPhone: "+1 555-0105",
    waterSource: "Treated water",
    sampleType: "RO Treated Water",
    collectionLocation: "RO Permeate Tank 2",
    collectionDateTime: "2026-10-26T11:00:00Z",
    sampleReceivedDate: "2026-10-26T13:00:00Z",
    sampleCondition: "Clear, sterile container",
    status: "TESTING_IN_PROGRESS",
    remarks: "Post-membrane verification",
    createdAt: "2026-10-26T11:00:00Z"
  },
  {
    id: "s-005",
    sampleId: "WTL-2026-0005",
    customerName: "Serene Gardens Gated Community",
    customerEmail: "customer9@serenegardens.in",
    customerPhone: "+1 555-0112",
    waterSource: "Drinking water",
    sampleType: "Potable Overhead Tank",
    collectionLocation: "Overhead Sump Tower 4",
    collectionDateTime: "2026-10-27T08:00:00Z",
    sampleReceivedDate: "2026-10-27T09:30:00Z",
    sampleCondition: "Sealed container",
    status: "REGISTERED",
    remarks: "Monthly resident welfare testing",
    createdAt: "2026-10-27T08:00:00Z"
  }
];

let demoReports = [
  {
    id: "rep-001",
    reportNumber: "REP-2026-0001",
    sampleId: "WTL-2026-0001",
    customerName: "GreenValley Agriculture Farms",
    customerEmail: "customer1@gmail.com",
    customerPhone: "+1 555-0104",
    customerOrganization: "GreenValley Agro Pvt Ltd",
    collectionLocation: "Intake Borewell Line A",
    waterSource: "Drinking water",
    sampleType: "Potable Water",
    sampleCondition: "Clear, Sealed amber container",
    collectionDate: "2026-10-25T09:00:00Z",
    receivedDate: "2026-10-25T11:30:00Z",
    testingCompletedDate: "2026-10-25T17:00:00Z",
    status: "APPROVED",
    totalParameters: 5,
    passedParameters: 5,
    failedParameters: 0,
    compliancePercentage: 100.0,
    overallAssessment: "COMPLIANT",
    assessmentSummary: "All tested physical, chemical, and microbiological parameters comply with the permissible requirements of IS 10500:2012 for Drinking water.",
    preparedBy: "Sarah Connor (Senior Chemist)",
    reviewedBy: "Dr. Elizabeth Shaw (Lab Director & QA)",
    reviewerDesignation: "Quality Assurance Lead",
    reviewedDate: "2026-10-25T18:00:00Z",
    reviewerComments: "Verified assay calibrations and certified data authenticity.",
    parametersSnapshot: [
      { parameterName: "pH", category: "Chemical", measuredValue: "7.3", unit: "pH units", referenceLimitDisplay: "6.5 - 8.5", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 11)", complianceStatus: "COMPLIANT", interpretation: "Compliant with acceptable limit" },
      { parameterName: "TDS", category: "Physical", measuredValue: "340", unit: "mg/L", referenceLimitDisplay: "Max 500 mg/L", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 16)", complianceStatus: "COMPLIANT", interpretation: "Compliant: within max limit" },
      { parameterName: "Turbidity", category: "Physical", measuredValue: "1.2", unit: "NTU", referenceLimitDisplay: "Max 5 NTU", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 10)", complianceStatus: "COMPLIANT", interpretation: "Clear and transparent" },
      { parameterName: "Fluoride", category: "Chemical", measuredValue: "0.6", unit: "mg/L", referenceLimitDisplay: "Max 1.0 mg/L", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 60)", complianceStatus: "COMPLIANT", interpretation: "Safe for human consumption" },
      { parameterName: "Total Coliform", category: "Microbiological", measuredValue: "0", unit: "MPN/100ml", referenceLimitDisplay: "0 MPN/100ml", referenceStandard: "IS 10500:2012", testMethod: "IS 15185", complianceStatus: "COMPLIANT", interpretation: "Safe: No coliform detected" }
    ],
    createdAt: "2026-10-25T18:00:00Z"
  },
  {
    id: "rep-002",
    reportNumber: "REP-2026-0002",
    sampleId: "WTL-2026-0002",
    customerName: "PureBeverage Bottling Corp",
    customerEmail: "customer2@purebev.com",
    customerPhone: "+1 555-0105",
    customerOrganization: "PureBeverage Bottling Corp",
    collectionLocation: "Deep Submersible Well #4",
    waterSource: "Groundwater",
    sampleType: "Raw Water",
    sampleCondition: "Turbid with mineral residue",
    collectionDate: "2026-10-24T14:00:00Z",
    receivedDate: "2026-10-24T16:00:00Z",
    testingCompletedDate: "2026-10-24T19:00:00Z",
    status: "APPROVED",
    totalParameters: 5,
    passedParameters: 4,
    failedParameters: 1,
    compliancePercentage: 80.0,
    overallAssessment: "NON_COMPLIANT",
    assessmentSummary: "1 of 5 tested parameters failed permissible thresholds: Total Hardness exceeded permissible limits. Water requires softening before bottling use.",
    preparedBy: "Sarah Connor (Senior Chemist)",
    reviewedBy: "Dr. Elizabeth Shaw (Lab Director & QA)",
    reviewerDesignation: "Quality Assurance Lead",
    reviewedDate: "2026-10-24T20:00:00Z",
    reviewerComments: "Flagged hardness deviation; report approved with advisory remarks.",
    parametersSnapshot: [
      { parameterName: "pH", category: "Chemical", measuredValue: "7.8", unit: "pH units", referenceLimitDisplay: "6.5 - 8.5", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 11)", complianceStatus: "COMPLIANT", interpretation: "Compliant" },
      { parameterName: "TDS", category: "Physical", measuredValue: "480", unit: "mg/L", referenceLimitDisplay: "Max 500 mg/L", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 16)", complianceStatus: "COMPLIANT", interpretation: "Within permissible max" },
      { parameterName: "Total Hardness", category: "Chemical", measuredValue: "340", unit: "mg/L", referenceLimitDisplay: "Max 200 mg/L", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 21)", complianceStatus: "NON_COMPLIANT", interpretation: "Exceeds permissible limit of 200 mg/L" },
      { parameterName: "Chloride", category: "Chemical", measuredValue: "180", unit: "mg/L", referenceLimitDisplay: "Max 250 mg/L", referenceStandard: "IS 10500:2012", testMethod: "IS 3025 (Part 32)", complianceStatus: "COMPLIANT", interpretation: "Compliant" },
      { parameterName: "Total Coliform", category: "Microbiological", measuredValue: "0", unit: "MPN/100ml", referenceLimitDisplay: "0 MPN/100ml", referenceStandard: "IS 10500:2012", testMethod: "IS 15185", complianceStatus: "COMPLIANT", interpretation: "Safe" }
    ],
    createdAt: "2026-10-24T20:00:00Z"
  },
  {
    id: "rep-003",
    reportNumber: "REP-2026-0003",
    sampleId: "WTL-2026-0003",
    customerName: "GreenValley Agriculture Farms",
    customerEmail: "customer1@gmail.com",
    customerPhone: "+1 555-0104",
    customerOrganization: "GreenValley Agro Pvt Ltd",
    collectionLocation: "East Field Irrigation Well",
    waterSource: "Borewell water",
    sampleType: "Irrigation Water",
    sampleCondition: "Acceptable",
    collectionDate: "2026-10-26T08:30:00Z",
    receivedDate: "2026-10-26T10:00:00Z",
    status: "PENDING_APPROVAL",
    totalParameters: 4,
    passedParameters: 4,
    failedParameters: 0,
    compliancePercentage: 100.0,
    overallAssessment: "COMPLIANT",
    assessmentSummary: "Draft report pending QA review and sign-off.",
    preparedBy: "Sarah Connor (Senior Chemist)",
    parametersSnapshot: [
      { parameterName: "pH", category: "Chemical", measuredValue: "7.1", unit: "pH units", referenceLimitDisplay: "6.5 - 8.5", referenceStandard: "IS 10500:2012", testMethod: "IS 3025", complianceStatus: "COMPLIANT", interpretation: "Compliant" },
      { parameterName: "TDS", category: "Physical", measuredValue: "290", unit: "mg/L", referenceLimitDisplay: "Max 500 mg/L", referenceStandard: "IS 10500:2012", testMethod: "IS 3025", complianceStatus: "COMPLIANT", interpretation: "Compliant" }
    ],
    createdAt: "2026-10-26T12:00:00Z"
  }
];

export function handleDemoFallback(config) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  // Helper mock response builder
  const mockResponse = (data, status = 200) => ({
    data,
    status,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config
  });

  // 1. Auth: /auth/login
  if (url.includes('/auth/login') && method === 'post') {
    let payload = {};
    try {
      payload = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {}
    const email = (payload.email || '').toLowerCase().trim();
    let found = DEMO_USERS.find(u => u.email.toLowerCase() === email);
    if (!found) {
      found = {
        id: "usr-demo-auto",
        email: email || "customer@watertest.com",
        fullName: email.includes('admin') ? "Administrator" : (email.includes('chemist') || email.includes('staff')) ? "Laboratory Specialist" : "Verified Customer",
        role: email.includes('admin') ? "ROLE_ADMIN" : (email.includes('chemist') || email.includes('staff')) ? "ROLE_LABORATORY_STAFF" : "ROLE_CUSTOMER",
        phone: "+1 555-0199",
        organization: "AquaPure Demo Portal"
      };
    }
    const token = "mock-jwt-token-" + Date.now();
    return mockResponse({
      success: true,
      data: {
        token,
        id: found.id,
        email: found.email,
        fullName: found.fullName,
        role: found.role,
        phone: found.phone,
        organization: found.organization
      }
    });
  }

  // 2. Auth: /auth/register
  if (url.includes('/auth/register') && method === 'post') {
    let payload = {};
    try {
      payload = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {}
    const newUser = {
      id: "usr-" + Date.now(),
      email: payload.email || "client@watertest.com",
      fullName: payload.fullName || "Demo Client",
      role: "ROLE_CUSTOMER",
      phone: payload.phone || "+1 555-0100",
      organization: payload.organization || "Private Client"
    };
    return mockResponse({
      success: true,
      data: {
        token: "mock-jwt-token-" + Date.now(),
        ...newUser
      }
    });
  }

  // 3. Auth: /auth/me
  if (url.includes('/auth/me')) {
    const saved = localStorage.getItem('wtlms_user');
    const u = saved ? JSON.parse(saved) : DEMO_USERS[0];
    return mockResponse({
      success: true,
      data: u
    });
  }

  // 4. Dashboard Statistics: /dashboard/statistics
  if (url.includes('/dashboard/statistics')) {
    return mockResponse({
      success: true,
      data: {
        totalSamples: demoSamples.length,
        awaitingTesting: demoSamples.filter(s => s.status === 'REGISTERED' || s.status === 'SAMPLE_RECEIVED').length,
        inProgressTests: demoSamples.filter(s => s.status === 'TESTING_IN_PROGRESS').length,
        completedTests: demoSamples.filter(s => s.status === 'TESTING_COMPLETED').length,
        reportsPendingApproval: demoReports.filter(r => r.status === 'PENDING_APPROVAL').length,
        approvedReports: demoReports.filter(r => r.status === 'APPROVED').length,
        nonCompliantSamples: demoReports.filter(r => r.overallAssessment === 'NON_COMPLIANT').length,
        monthlyRegistrations: [
          { month: 'Jun', count: 12 },
          { month: 'Jul', count: 18 },
          { month: 'Aug', count: 24 },
          { month: 'Sep', count: 31 },
          { month: 'Oct', count: demoSamples.length }
        ],
        testCompletionStatus: [
          { name: 'Completed', value: 14, fill: '#10b981' },
          { name: 'In Progress', value: 4, fill: '#0284c7' },
          { name: 'Pending Intake', value: 2, fill: '#f59e0b' }
        ],
        waterQualityCompliance: [
          { name: 'Compliant', value: 12, fill: '#10b981' },
          { name: 'Non-Compliant', value: 2, fill: '#ef4444' }
        ],
        sourceDistribution: [
          { name: 'Drinking water', count: 8 },
          { name: 'Borewell water', count: 5 },
          { name: 'Groundwater', count: 4 },
          { name: 'Treated water', count: 3 }
        ],
        recentSamples: demoSamples.slice(0, 5),
        recentResults: [],
        pendingTasks: demoSamples.filter(s => s.status !== 'APPROVED')
      }
    });
  }

  // 5. Samples: /samples
  if (url.includes('/samples') && method === 'get') {
    // If detail: /samples/:id
    const parts = url.split('/samples/');
    if (parts.length > 1 && parts[1]) {
      const idOrSampleId = parts[1].split('?')[0];
      const s = demoSamples.find(x => x.id === idOrSampleId || x.sampleId === idOrSampleId) || demoSamples[0];
      return mockResponse({ success: true, data: s });
    }
    return mockResponse({ success: true, data: demoSamples });
  }

  // 5b. Register Sample: POST /samples
  if (url.includes('/samples') && method === 'post') {
    let payload = {};
    try {
      payload = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {}
    const newId = "WTL-2026-" + String(demoSamples.length + 1).padStart(4, '0');
    const newSample = {
      id: "s-" + Date.now(),
      sampleId: newId,
      customerName: payload.customerName || "Verified Client",
      customerEmail: payload.customerEmail || "client@watertest.com",
      customerPhone: payload.customerPhone || "+1 555-0199",
      waterSource: payload.waterSource || "Drinking water",
      sampleType: payload.sampleType || "Potable",
      collectionLocation: payload.collectionLocation || "On-site point",
      collectionDateTime: payload.collectionDateTime || new Date().toISOString(),
      sampleReceivedDate: new Date().toISOString(),
      sampleCondition: payload.sampleCondition || "Sealed",
      status: "REGISTERED",
      remarks: payload.remarks || "",
      createdAt: new Date().toISOString()
    };
    demoSamples.unshift(newSample);
    return mockResponse({ success: true, message: "Sample registered successfully", data: newSample });
  }

  // 6. Test Definitions: /tests
  if (url.includes('/tests')) {
    return mockResponse({ success: true, data: DEMO_TESTS });
  }

  // 7. Reports: /reports
  if (url.includes('/reports')) {
    // PDF download: /reports/:id/pdf
    if (url.includes('/pdf')) {
      const dummyPdfContent = "%PDF-1.5\n%AquaPure Demo Certified Water Quality Test Report\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF";
      return {
        data: new Blob([dummyPdfContent], { type: 'application/pdf' }),
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/pdf', 'content-disposition': 'attachment; filename="WaterTestReport_REP-2026-0001.pdf"' },
        config
      };
    }

    // Detail: /reports/:id
    const parts = url.split('/reports/');
    if (parts.length > 1 && parts[1] && !parts[1].startsWith('?')) {
      const idOrRep = parts[1].split('?')[0].split('/')[0];
      const r = demoReports.find(x => x.id === idOrRep || x.reportNumber === idOrRep) || demoReports[0];
      return mockResponse({ success: true, data: r });
    }

    return mockResponse({ success: true, data: demoReports });
  }

  // 8. Notifications: /notifications
  if (url.includes('/notifications')) {
    return mockResponse({
      success: true,
      unreadCount: 2,
      notifications: [
        {
          id: "notif-1",
          type: "NON_COMPLIANT_ALERT",
          title: "Non-Compliance Alert: WTL-2026-0002",
          message: "Sample WTL-2026-0002 has parameters exceeding maximum permissible limits.",
          createdAt: "2026-10-26T10:00:00Z",
          isRead: false
        },
        {
          id: "notif-2",
          type: "REPORT_APPROVED",
          title: "Test Report Ready: REP-2026-0001",
          message: "Your certified water testing report REP-2026-0001 is now approved and available for PDF download.",
          createdAt: "2026-10-25T18:05:00Z",
          isRead: false
        }
      ]
    });
  }

  // 9. Customers: /customers
  if (url.includes('/customers')) {
    return mockResponse({
      success: true,
      data: [
        { id: "c1", customerId: "CUST-2026-0001", name: "GreenValley Agriculture Farms", email: "customer1@gmail.com", phone: "+1 555-0104", address: "Plot 42, River Valley Rd", organization: "GreenValley Agro Pvt Ltd" },
        { id: "c2", customerId: "CUST-2026-0002", name: "PureBeverage Bottling Corp", email: "customer2@purebev.com", phone: "+1 555-0105", address: "Industrial Estate Zone B, Plant 7", organization: "PureBeverage Bottling Corp" }
      ]
    });
  }

  // 10. Users / Staff: /users
  if (url.includes('/users')) {
    return mockResponse({
      success: true,
      data: DEMO_USERS
    });
  }

  return null;
}
