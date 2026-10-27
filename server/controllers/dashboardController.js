import Sample from '../models/Sample.js';
import Report from '../models/Report.js';
import Compliance from '../models/Compliance.js';
import User from '../models/User.js';

// @desc    Get dashboard statistics tailored by role
// @route   GET /api/dashboard/statistics
// @access  Private
export const getDashboardStatistics = async (req, res, next) => {
  try {
    const isCustomer = req.user.role === 'customer';
    const customerFilter = isCustomer ? { customer: req.user._id } : {};

    // 1. Sample Counts
    const totalSamples = await Sample.countDocuments(customerFilter);
    const pendingSamples = await Sample.countDocuments({
      ...customerFilter,
      status: { $in: ['REGISTERED', 'RECEIVED'] }
    });
    const underAnalysisSamples = await Sample.countDocuments({
      ...customerFilter,
      status: 'UNDER ANALYSIS'
    });
    const completedAnalysisSamples = await Sample.countDocuments({
      ...customerFilter,
      status: { $in: ['ANALYSIS COMPLETED', 'REPORT GENERATED', 'APPROVED', 'DELIVERED'] }
    });

    // 2. Compliance Counts
    const compliantSamples = await Compliance.countDocuments({
      ...customerFilter,
      overallStatus: 'COMPLIANT'
    });
    const nonCompliantSamples = await Compliance.countDocuments({
      ...customerFilter,
      overallStatus: 'NON-COMPLIANT'
    });
    const pendingCompliance = await Compliance.countDocuments({
      ...customerFilter,
      overallStatus: 'PENDING'
    });

    // 3. Report Counts
    const reportFilter = isCustomer
      ? { customer: req.user._id, status: { $in: ['APPROVED', 'DELIVERED'] } }
      : {};
    const totalReports = await Report.countDocuments(reportFilter);
    const approvedReports = await Report.countDocuments({ ...reportFilter, status: { $in: ['APPROVED', 'DELIVERED'] } });
    const draftReports = isCustomer ? 0 : await Report.countDocuments({ status: { $in: ['DRAFT', 'UNDER REVIEW'] } });

    // 4. User stats (Admin only)
    let userStats = null;
    if (req.user.role === 'admin') {
      const totalUsers = await User.countDocuments();
      const totalCustomers = await User.countDocuments({ role: 'customer' });
      const totalTechnicians = await User.countDocuments({ role: 'technician' });
      const totalOfficers = await User.countDocuments({ role: 'compliance_officer' });
      userStats = { totalUsers, totalCustomers, totalTechnicians, totalOfficers };
    }

    // 5. Recent Samples
    const recentSamples = await Sample.find(customerFilter)
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('customer', 'name email');

    // 6. Recent Reports
    const recentReports = await Report.find(reportFilter)
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('customer', 'name');

    // 7. Monthly Testing Statistics (Last 6 months aggregation)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAggregation = await Sample.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          ...(isCustomer ? { customer: req.user._id } : {})
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = monthlyAggregation.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      samplesCount: item.count
    }));

    // 8. Sample Type Breakdown
    const sampleTypeStats = await Sample.aggregate([
      { $match: customerFilter },
      { $group: { _id: '$sampleType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalSamples,
        pendingSamples,
        underAnalysisSamples,
        completedAnalysisSamples,
        compliantSamples,
        nonCompliantSamples,
        pendingCompliance,
        totalReports,
        approvedReports,
        draftReports,
        userStats,
        sampleTypeStats: sampleTypeStats.map(s => ({ type: s._id, count: s.count })),
        monthlyStats,
        recentSamples,
        recentReports
      }
    });
  } catch (error) {
    next(error);
  }
};
