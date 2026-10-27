import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Sample from '../models/Sample.js';
import TestParameter from '../models/TestParameter.js';
import TestResult from '../models/TestResult.js';
import Compliance from '../models/Compliance.js';
import Report from '../models/Report.js';
import Notification from '../models/Notification.js';
import { connectDB } from '../config/db.js';
import { evaluateParameterResult } from '../services/complianceEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const standardParameters = [
  // Physical
  { name: 'Colour', category: 'Physical', testMethod: 'IS 3025 (Part 4)', unit: 'Hazen', minLimit: null, maxLimit: 15, referenceStandard: 'IS 10500:2012' },
  { name: 'Odour', category: 'Physical', testMethod: 'IS 3025 (Part 5)', unit: 'TON', minLimit: null, maxLimit: 1, referenceStandard: 'IS 10500:2012' },
  { name: 'Turbidity', category: 'Physical', testMethod: 'IS 3025 (Part 10)', unit: 'NTU', minLimit: null, maxLimit: 5, referenceStandard: 'IS 10500:2012' },
  { name: 'Temperature', category: 'Physical', testMethod: 'IS 3025 (Part 9)', unit: '°C', minLimit: null, maxLimit: 25, referenceStandard: 'IS 10500:2012' },
  { name: 'TDS (Total Dissolved Solids)', category: 'Physical', testMethod: 'IS 3025 (Part 16)', unit: 'mg/L', minLimit: null, maxLimit: 500, referenceStandard: 'IS 10500:2012' },

  // Chemical
  { name: 'pH', category: 'Chemical', testMethod: 'IS 3025 (Part 11)', unit: 'pH units', minLimit: 6.5, maxLimit: 8.5, referenceStandard: 'IS 10500:2012' },
  { name: 'Total Hardness (as CaCO3)', category: 'Chemical', testMethod: 'IS 3025 (Part 21)', unit: 'mg/L', minLimit: null, maxLimit: 200, referenceStandard: 'IS 10500:2012' },
  { name: 'Chloride (as Cl)', category: 'Chemical', testMethod: 'IS 3025 (Part 32)', unit: 'mg/L', minLimit: null, maxLimit: 250, referenceStandard: 'IS 10500:2012' },
  { name: 'Sulphate (as SO4)', category: 'Chemical', testMethod: 'IS 3025 (Part 24)', unit: 'mg/L', minLimit: null, maxLimit: 200, referenceStandard: 'IS 10500:2012' },
  { name: 'Nitrate (as NO3)', category: 'Chemical', testMethod: 'IS 3025 (Part 34)', unit: 'mg/L', minLimit: null, maxLimit: 45, referenceStandard: 'IS 10500:2012' },
  { name: 'Fluoride (as F)', category: 'Chemical', testMethod: 'IS 3025 (Part 60)', unit: 'mg/L', minLimit: null, maxLimit: 1.0, referenceStandard: 'IS 10500:2012' },
  { name: 'Iron (as Fe)', category: 'Chemical', testMethod: 'IS 3025 (Part 53)', unit: 'mg/L', minLimit: null, maxLimit: 1.0, referenceStandard: 'IS 10500:2012' },
  { name: 'Calcium (as Ca)', category: 'Chemical', testMethod: 'IS 3025 (Part 40)', unit: 'mg/L', minLimit: null, maxLimit: 75, referenceStandard: 'IS 10500:2012' },
  { name: 'Magnesium (as Mg)', category: 'Chemical', testMethod: 'IS 3025 (Part 46)', unit: 'mg/L', minLimit: null, maxLimit: 30, referenceStandard: 'IS 10500:2012' },
  { name: 'Total Alkalinity (as CaCO3)', category: 'Chemical', testMethod: 'IS 3025 (Part 23)', unit: 'mg/L', minLimit: null, maxLimit: 200, referenceStandard: 'IS 10500:2012' },

  // Microbiological
  { name: 'Total Coliform', category: 'Microbiological', testMethod: 'IS 15185', unit: 'MPN/100ml', minLimit: null, maxLimit: 0, referenceStandard: 'IS 10500:2012' },
  { name: 'E. coli', category: 'Microbiological', testMethod: 'IS 15185', unit: 'CFU/100ml', minLimit: null, maxLimit: 0, referenceStandard: 'IS 10500:2012' },
  { name: 'Fecal Coliform', category: 'Microbiological', testMethod: 'IS 15185', unit: 'MPN/100ml', minLimit: null, maxLimit: 0, referenceStandard: 'IS 10500:2012' }
];

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Starting database seeding...');
    await connectDB();

    // Clear existing collections
    await User.deleteMany({});
    await Sample.deleteMany({});
    await TestParameter.deleteMany({});
    await TestResult.deleteMany({});
    await Compliance.deleteMany({});
    await Report.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seeder] Cleared old collections');

    // 1. Create Users
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@watertest.com',
      password: 'AdminPassword123!',
      role: 'admin',
      phone: '+1 555-0100',
      organization: 'AquaPure Laboratory Headquarters'
    });

    const tech1 = await User.create({
      name: 'Sarah Connor (Senior Chemist)',
      email: 'tech1@watertest.com',
      password: 'TechPassword123!',
      role: 'technician',
      phone: '+1 555-0101',
      organization: 'Inorganic Chemistry Testing Wing'
    });

    const tech2 = await User.create({
      name: 'David Miller (Microbiologist)',
      email: 'tech2@watertest.com',
      password: 'TechPassword123!',
      role: 'technician',
      phone: '+1 555-0102',
      organization: 'Microbiology Quality Wing'
    });

    const officer = await User.create({
      name: 'Dr. Elizabeth Shaw (QA Officer)',
      email: 'officer@watertest.com',
      password: 'OfficerPassword123!',
      role: 'compliance_officer',
      phone: '+1 555-0103',
      organization: 'Quality Assurance & Regulatory Audits'
    });

    const customer1 = await User.create({
      name: 'GreenValley Agriculture Farms',
      email: 'customer1@gmail.com',
      password: 'CustomerPassword123!',
      role: 'customer',
      phone: '+1 555-0104',
      organization: 'GreenValley Agro Pvt Ltd'
    });

    const customer2 = await User.create({
      name: 'PureBeverage Bottling Corp',
      email: 'customer2@purebev.com',
      password: 'CustomerPassword123!',
      role: 'customer',
      phone: '+1 555-0105',
      organization: 'PureBeverage Bottling Corp'
    });

    console.log('[Seeder] Users created successfully');

    // 2. Insert Standard Test Parameters
    const createdParams = await TestParameter.insertMany(standardParameters);
    console.log(`[Seeder] Created ${createdParams.length} testing parameters`);

    const paramMap = {};
    createdParams.forEach(p => {
      paramMap[p.name] = p;
    });

    // 3. Create Sample 1: Fully Compliant (Delivered & Approved)
    const sample1 = await Sample.create({
      sampleId: 'WTL-20260901-0001',
      customer: customer2._id,
      customerName: customer2.name,
      customerEmail: customer2.email,
      customerPhone: customer2.phone,
      sampleType: 'Drinking Water',
      sourceType: 'Municipal Supply',
      collectionLocation: 'Main Processing Plant Intake Line A',
      collectionDate: new Date('2026-09-01T09:30:00Z'),
      receivedDate: new Date('2026-09-01T14:00:00Z'),
      sampleQuantity: '2000 mL',
      sampleCondition: 'Good',
      priority: 'High',
      registeredBy: customer2._id,
      receivedBy: tech1._id,
      status: 'DELIVERED',
      remarks: 'Quarterly compliance verification for municipal drinking supply'
    });

    // Test results for Sample 1 (All Pass)
    const sample1Values = [
      { name: 'Colour', value: 2 },
      { name: 'Odour', value: 0 },
      { name: 'Turbidity', value: 1.2 },
      { name: 'Temperature', value: 21.5 },
      { name: 'TDS (Total Dissolved Solids)', value: 180 },
      { name: 'pH', value: 7.4 },
      { name: 'Total Hardness (as CaCO3)', value: 110 },
      { name: 'Chloride (as Cl)', value: 45 },
      { name: 'Sulphate (as SO4)', value: 35 },
      { name: 'Nitrate (as NO3)', value: 12 },
      { name: 'Fluoride (as F)', value: 0.6 },
      { name: 'Iron (as Fe)', value: 0.05 },
      { name: 'Calcium (as Ca)', value: 42 },
      { name: 'Magnesium (as Mg)', value: 18 },
      { name: 'Total Alkalinity (as CaCO3)', value: 95 },
      { name: 'Total Coliform', value: 0 },
      { name: 'E. coli', value: 0 },
      { name: 'Fecal Coliform', value: 0 }
    ];

    const sample1Results = [];
    for (const item of sample1Values) {
      const p = paramMap[item.name];
      if (p) {
        const status = evaluateParameterResult(item.value, p.minLimit, p.maxLimit);
        const tr = await TestResult.create({
          sample: sample1._id,
          parameter: p._id,
          parameterName: p.name,
          category: p.category,
          unit: p.unit,
          testMethod: p.testMethod,
          referenceStandard: p.referenceStandard,
          minLimit: p.minLimit,
          maxLimit: p.maxLimit,
          resultValue: item.value,
          status,
          testedBy: tech1._id,
          testedDate: new Date('2026-09-02T11:00:00Z'),
          remarks: 'Standard test completed within calibration bounds'
        });
        sample1Results.push(tr);
      }
    }

    // Compliance 1
    const compliance1 = await Compliance.create({
      sample: sample1._id,
      sampleIdString: sample1.sampleId,
      customer: customer2._id,
      testDate: new Date('2026-09-02T16:00:00Z'),
      totalParameters: sample1Results.length,
      passedParameters: sample1Results.length,
      failedParameters: 0,
      compliancePercentage: 100,
      overallStatus: 'COMPLIANT',
      standardReference: 'IS 10500:2012',
      reviewedBy: officer._id,
      reviewDate: new Date('2026-09-03T10:00:00Z'),
      decision: 'APPROVED',
      officerRemarks: 'All physical, chemical, and biological parameters strictly satisfy IS 10500 standards. Safe for consumption.'
    });

    // Report 1
    const report1 = await Report.create({
      reportNumber: 'REP-20260903-0001',
      sample: sample1._id,
      compliance: compliance1._id,
      customer: customer2._id,
      status: 'DELIVERED',
      generatedBy: tech1._id,
      generatedAt: new Date('2026-09-03T09:00:00Z'),
      reviewedBy: officer._id,
      reviewedAt: new Date('2026-09-03T10:00:00Z'),
      approvedBy: officer._id,
      approvedAt: new Date('2026-09-03T10:30:00Z'),
      deliveredDate: new Date('2026-09-03T11:00:00Z'),
      summarySnapshot: {
        totalParameters: sample1Results.length,
        passed: sample1Results.length,
        failed: 0,
        compliancePercentage: 100,
        overallCompliance: 'COMPLIANT'
      },
      testResultsSnapshot: sample1Results.map(r => ({
        parameterName: r.parameterName,
        category: r.category,
        resultValue: r.resultValue,
        unit: r.unit,
        minLimit: r.minLimit,
        maxLimit: r.maxLimit,
        permissibleRange: r.maxLimit ? `<= ${r.maxLimit}` : `${r.minLimit} - ${r.maxLimit}`,
        testMethod: r.testMethod,
        referenceStandard: r.referenceStandard,
        status: r.status,
        remarks: r.remarks
      })),
      remarks: 'Official certified test certificate issued to PureBeverage Bottling Corp.',
      digitalSignature: {
        signedBy: officer.name,
        signDate: new Date('2026-09-03T10:30:00Z'),
        signatureHash: 'SHA256-CERT-AQUA-99218274092'
      }
    });

    // 4. Create Sample 2: Non-Compliant (Under Review / Non-Compliant)
    const sample2 = await Sample.create({
      sampleId: 'WTL-20260915-0002',
      customer: customer1._id,
      customerName: customer1.name,
      customerEmail: customer1.email,
      customerPhone: customer1.phone,
      sampleType: 'Ground Water',
      sourceType: 'Borewell',
      collectionLocation: 'Agricultural Field North Borewell #3',
      collectionDate: new Date('2026-09-15T08:00:00Z'),
      receivedDate: new Date('2026-09-15T12:30:00Z'),
      sampleQuantity: '1500 mL',
      sampleCondition: 'Good',
      priority: 'Urgent',
      registeredBy: customer1._id,
      receivedBy: tech2._id,
      status: 'REPORT GENERATED',
      remarks: 'Suspected fertilizer runoff contamination from adjacent plot'
    });

    // Sample 2 Results (Fails on Nitrate, Turbidity, Total Coliform)
    const sample2Values = [
      { name: 'Turbidity', value: 8.4 }, // FAIL (max 5)
      { name: 'TDS (Total Dissolved Solids)', value: 720 }, // FAIL (max 500)
      { name: 'pH', value: 6.2 }, // FAIL (min 6.5)
      { name: 'Total Hardness (as CaCO3)', value: 190 },
      { name: 'Chloride (as Cl)', value: 120 },
      { name: 'Nitrate (as NO3)', value: 74 }, // FAIL (max 45)
      { name: 'Total Coliform', value: 15 }, // FAIL (max 0)
      { name: 'E. coli', value: 4 } // FAIL (max 0)
    ];

    const sample2Results = [];
    for (const item of sample2Values) {
      const p = paramMap[item.name];
      if (p) {
        const status = evaluateParameterResult(item.value, p.minLimit, p.maxLimit);
        const tr = await TestResult.create({
          sample: sample2._id,
          parameter: p._id,
          parameterName: p.name,
          category: p.category,
          unit: p.unit,
          testMethod: p.testMethod,
          referenceStandard: p.referenceStandard,
          minLimit: p.minLimit,
          maxLimit: p.maxLimit,
          resultValue: item.value,
          status,
          testedBy: tech2._id,
          testedDate: new Date('2026-09-16T14:00:00Z'),
          remarks: status === 'FAIL' ? 'Exceeds maximum allowable concentration' : 'Within threshold'
        });
        sample2Results.push(tr);
      }
    }

    const passedCount = sample2Results.filter(r => r.status === 'PASS').length;
    const failedCount = sample2Results.filter(r => r.status === 'FAIL').length;
    const compPct = Math.round((passedCount / sample2Results.length) * 100 * 10) / 10;

    const compliance2 = await Compliance.create({
      sample: sample2._id,
      sampleIdString: sample2.sampleId,
      customer: customer1._id,
      testDate: new Date('2026-09-16T16:00:00Z'),
      totalParameters: sample2Results.length,
      passedParameters: passedCount,
      failedParameters: failedCount,
      compliancePercentage: compPct,
      overallStatus: 'NON-COMPLIANT',
      standardReference: 'IS 10500:2012',
      decision: 'PENDING',
      officerRemarks: 'Excess nitrates and microbiological contamination detected. Sample fails drinking water specifications.'
    });

    const report2 = await Report.create({
      reportNumber: 'REP-20260916-0002',
      sample: sample2._id,
      compliance: compliance2._id,
      customer: customer1._id,
      status: 'UNDER REVIEW',
      generatedBy: tech2._id,
      generatedAt: new Date('2026-09-16T17:00:00Z'),
      summarySnapshot: {
        totalParameters: sample2Results.length,
        passed: passedCount,
        failed: failedCount,
        compliancePercentage: compPct,
        overallCompliance: 'NON-COMPLIANT'
      },
      testResultsSnapshot: sample2Results.map(r => ({
        parameterName: r.parameterName,
        category: r.category,
        resultValue: r.resultValue,
        unit: r.unit,
        minLimit: r.minLimit,
        maxLimit: r.maxLimit,
        permissibleRange: r.maxLimit ? `<= ${r.maxLimit}` : `${r.minLimit} - ${r.maxLimit}`,
        testMethod: r.testMethod,
        referenceStandard: r.referenceStandard,
        status: r.status,
        remarks: r.remarks
      })),
      remarks: 'NON-COMPLIANT WATER SAMPLE: Immediate water treatment or alternative source recommended.'
    });

    // 5. Create Sample 3: Under Analysis
    const sample3 = await Sample.create({
      sampleId: 'WTL-20260920-0003',
      customer: customer1._id,
      customerName: customer1.name,
      customerEmail: customer1.email,
      customerPhone: customer1.phone,
      sampleType: 'Surface Water',
      sourceType: 'River',
      collectionLocation: 'River Estuary Outflow Sector 4',
      collectionDate: new Date('2026-09-20T10:00:00Z'),
      receivedDate: new Date('2026-09-20T13:00:00Z'),
      sampleQuantity: '1000 mL',
      sampleCondition: 'Good',
      priority: 'Normal',
      registeredBy: admin._id,
      receivedBy: tech1._id,
      status: 'UNDER ANALYSIS',
      remarks: 'Surface river quality monitoring'
    });

    // 6. Create Sample 4: Registered (Awaiting receipt)
    const sample4 = await Sample.create({
      sampleId: 'WTL-20260925-0004',
      customer: customer2._id,
      customerName: customer2.name,
      customerEmail: customer2.email,
      customerPhone: customer2.phone,
      sampleType: 'Industrial Water',
      sourceType: 'Industrial Source',
      collectionLocation: 'Effluent Pre-treatment Basin #2',
      collectionDate: new Date('2026-09-25T11:00:00Z'),
      sampleQuantity: '2500 mL',
      sampleCondition: 'Good',
      priority: 'High',
      registeredBy: customer2._id,
      status: 'REGISTERED',
      remarks: 'Industrial effluent discharge monitoring'
    });

    // 7. Seed In-App Notifications
    await Notification.create([
      {
        recipient: customer2._id,
        title: 'Water Test Certificate Approved',
        message: 'Your laboratory report REP-20260903-0001 has been verified and approved. You may now download your certificate.',
        type: 'REPORT_APPROVED',
        sample: sample1._id,
        report: report1._id,
        isRead: false
      },
      {
        targetRole: 'compliance_officer',
        title: '⚠️ Non-Compliant Water Sample Detected',
        message: `Sample WTL-20260915-0002 failed 5 parameters including Nitrate and E. coli.`,
        type: 'NON_COMPLIANT_ALERT',
        sample: sample2._id,
        isRead: false
      },
      {
        targetRole: 'technician',
        title: 'New Water Sample Registered',
        message: 'Sample WTL-20260925-0004 (Industrial Water) registered and awaiting physical intake.',
        type: 'SAMPLE_REGISTERED',
        sample: sample4._id,
        isRead: false
      }
    ]);

    console.log('[Seeder] Database seeding finished successfully!');
    console.log('\n================ DEFAULT CREDENTIALS ================');
    console.log('Admin:              admin@watertest.com      / AdminPassword123!');
    console.log('Technician 1:       tech1@watertest.com      / TechPassword123!');
    console.log('Technician 2:       tech2@watertest.com      / TechPassword123!');
    console.log('Compliance Officer: officer@watertest.com    / OfficerPassword123!');
    console.log('Customer 1:         customer1@gmail.com      / CustomerPassword123!');
    console.log('Customer 2:         customer2@purebev.com    / CustomerPassword123!');
    console.log('=====================================================\n');

  } catch (err) {
    console.error('[Seeder] Error during seeding:', err);
    throw err;
  }
};

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase()
    .then(() => {
      console.log('[Seeder] Exiting cleanly.');
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}
