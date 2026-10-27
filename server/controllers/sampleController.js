import Sample from '../models/Sample.js';
import User from '../models/User.js';
import { generateSampleId } from '../utils/idGenerator.js';
import { createNotification } from '../services/notificationService.js';

const ALLOWED_STATUS_FLOW = {
  'REGISTERED': ['RECEIVED'],
  'RECEIVED': ['UNDER ANALYSIS'],
  'UNDER ANALYSIS': ['ANALYSIS COMPLETED'],
  'ANALYSIS COMPLETED': ['REPORT GENERATED'],
  'REPORT GENERATED': ['APPROVED'],
  'APPROVED': ['DELIVERED'],
  'DELIVERED': []
};

// @desc    Register a new water sample
// @route   POST /api/samples
// @access  Private (Admin, Customer, Technician)
export const createSample = async (req, res, next) => {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      sampleType,
      sourceType,
      collectionLocation,
      collectionDate,
      sampleQuantity,
      sampleCondition,
      priority,
      remarks
    } = req.body;

    let targetCustomerId;
    let targetCustomerName = customerName;
    let targetCustomerEmail = customerEmail;
    let targetCustomerPhone = customerPhone;

    if (req.user.role === 'customer') {
      targetCustomerId = req.user._id;
      targetCustomerName = req.user.name;
      targetCustomerEmail = req.user.email;
      targetCustomerPhone = req.user.phone || customerPhone || '';
    } else {
      if (customerId) {
        const foundCustomer = await User.findById(customerId);
        if (foundCustomer) {
          targetCustomerId = foundCustomer._id;
          targetCustomerName = foundCustomer.name;
          targetCustomerEmail = foundCustomer.email;
          targetCustomerPhone = foundCustomer.phone || customerPhone || '';
        }
      }
      if (!targetCustomerId) {
        // Find by email or fallback to registering staff
        if (customerEmail) {
          const userByEmail = await User.findOne({ email: customerEmail.toLowerCase() });
          if (userByEmail) {
            targetCustomerId = userByEmail._id;
          }
        }
      }
      if (!targetCustomerId) {
        targetCustomerId = req.user._id;
      }
    }

    if (!sampleType || !collectionLocation) {
      return res.status(400).json({
        success: false,
        message: 'Sample type and collection location are required'
      });
    }

    const uniqueSampleId = await generateSampleId();

    const sample = await Sample.create({
      sampleId: uniqueSampleId,
      customer: targetCustomerId,
      customerName: targetCustomerName || 'Walk-in Customer',
      customerEmail: targetCustomerEmail || 'customer@example.com',
      customerPhone: targetCustomerPhone || 'N/A',
      sampleType,
      sourceType: sourceType || 'Borewell',
      collectionLocation,
      collectionDate: collectionDate || new Date(),
      sampleQuantity: sampleQuantity || '1000 mL',
      sampleCondition: sampleCondition || 'Good',
      priority: priority || 'Normal',
      registeredBy: req.user._id,
      status: 'REGISTERED',
      remarks
    });

    // Notify Technicians & Admins of new sample registered
    await createNotification({
      targetRole: 'technician',
      title: 'New Water Sample Registered',
      message: `Sample ${uniqueSampleId} (${sampleType}) registered and ready for receipt`,
      type: 'SAMPLE_REGISTERED',
      sample: sample._id
    });

    res.status(201).json({
      success: true,
      message: `Water sample registered successfully with ID: ${uniqueSampleId}`,
      sample
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get samples with search, filtering and pagination
// @route   GET /api/samples
// @access  Private
export const getSamples = async (req, res, next) => {
  try {
    const {
      search,
      status,
      sampleType,
      priority,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    // Customer can only view their own samples
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    if (sampleType) {
      query.sampleType = sampleType;
    }

    if (priority) {
      query.priority = priority;
    }

    if (startDate || endDate) {
      query.collectionDate = {};
      if (startDate) query.collectionDate.$gte = new Date(startDate);
      if (endDate) query.collectionDate.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { sampleId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { collectionLocation: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Sample.countDocuments(query);
    const samples = await Sample.find(query)
      .populate('customer', 'name email phone organization')
      .populate('registeredBy', 'name role')
      .populate('receivedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: samples.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      samples
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sample details by ID or sampleId
// @route   GET /api/samples/:id
// @access  Private
export const getSampleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = {};

    if (id.startsWith('WTL-')) {
      query = { sampleId: id.toUpperCase() };
    } else {
      query = { _id: id };
    }

    const sample = await Sample.findOne(query)
      .populate('customer', 'name email phone organization')
      .populate('registeredBy', 'name role')
      .populate('receivedBy', 'name role');

    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample not found' });
    }

    // Role check: Customer can only view own sample
    if (req.user.role === 'customer' && sample.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this sample'
      });
    }

    res.status(200).json({ success: true, sample });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sample metadata
// @route   PUT /api/samples/:id
// @access  Private (Admin, Technician)
export const updateSample = async (req, res, next) => {
  try {
    const sample = await Sample.findById(req.params.id);

    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample not found' });
    }

    const {
      sampleType,
      sourceType,
      collectionLocation,
      collectionDate,
      sampleQuantity,
      sampleCondition,
      priority,
      remarks
    } = req.body;

    if (sampleType) sample.sampleType = sampleType;
    if (sourceType) sample.sourceType = sourceType;
    if (collectionLocation) sample.collectionLocation = collectionLocation;
    if (collectionDate) sample.collectionDate = collectionDate;
    if (sampleQuantity) sample.sampleQuantity = sampleQuantity;
    if (sampleCondition) sample.sampleCondition = sampleCondition;
    if (priority) sample.priority = priority;
    if (remarks !== undefined) sample.remarks = remarks;

    const updatedSample = await sample.save();

    res.status(200).json({
      success: true,
      message: 'Sample updated successfully',
      sample: updatedSample
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sample workflow status
// @route   PUT /api/samples/:id/status
// @access  Private (Admin, Technician, Compliance Officer)
export const updateSampleStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const sample = await Sample.findById(req.params.id);

    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample not found' });
    }

    const currentStatus = sample.status;
    const allowedNext = ALLOWED_STATUS_FLOW[currentStatus] || [];

    // Allow Admins to override flow if necessary, otherwise enforce strict progression
    if (req.user.role !== 'admin' && !allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${currentStatus}' to '${status}'. Allowed next: ${allowedNext.join(', ') || 'None'}`
      });
    }

    sample.status = status;
    if (remarks) sample.remarks = remarks;

    if (status === 'RECEIVED') {
      sample.receivedDate = new Date();
      sample.receivedBy = req.user._id;

      // Notify customer that sample has been physically received
      await createNotification({
        recipient: sample.customer,
        title: 'Sample Received at Laboratory',
        message: `Your sample ${sample.sampleId} has been verified and received at our facility.`,
        type: 'SAMPLE_RECEIVED',
        sample: sample._id
      });
    }

    const updatedSample = await sample.save();

    res.status(200).json({
      success: true,
      message: `Sample status updated to ${status}`,
      sample: updatedSample
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sample
// @route   DELETE /api/samples/:id
// @access  Private (Admin)
export const deleteSample = async (req, res, next) => {
  try {
    const sample = await Sample.findById(req.params.id);

    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample not found' });
    }

    await Sample.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Sample deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
