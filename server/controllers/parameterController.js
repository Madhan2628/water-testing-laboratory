import TestParameter from '../models/TestParameter.js';

// @desc    Get all parameters with filtering
// @route   GET /api/parameters
// @access  Private
export const getParameters = async (req, res, next) => {
  try {
    const { category, sampleType, activeOnly = 'true' } = req.query;
    const query = {};

    if (activeOnly === 'true') {
      query.isActive = true;
    }

    if (category) {
      query.category = category;
    }

    if (sampleType) {
      query.$or = [
        { applicableSampleTypes: { $in: [sampleType] } },
        { applicableSampleTypes: { $size: 0 } },
        { applicableSampleTypes: { $exists: false } }
      ];
    }

    const parameters = await TestParameter.find(query).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: parameters.length,
      parameters
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single parameter by ID
// @route   GET /api/parameters/:id
// @access  Private
export const getParameterById = async (req, res, next) => {
  try {
    const parameter = await TestParameter.findById(req.params.id);
    if (!parameter) {
      return res.status(404).json({ success: false, message: 'Parameter not found' });
    }
    res.status(200).json({ success: true, parameter });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new parameter
// @route   POST /api/parameters
// @access  Private (Admin)
export const createParameter = async (req, res, next) => {
  try {
    const {
      name,
      category,
      testMethod,
      unit,
      minLimit,
      maxLimit,
      referenceStandard,
      applicableSampleTypes,
      description
    } = req.body;

    if (!name || !category || !testMethod || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, test method, and unit are required fields'
      });
    }

    const exists = await TestParameter.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: `Parameter '${name}' already exists`
      });
    }

    const parameter = await TestParameter.create({
      name,
      category,
      testMethod,
      unit,
      minLimit: minLimit !== undefined && minLimit !== '' ? Number(minLimit) : null,
      maxLimit: maxLimit !== undefined && maxLimit !== '' ? Number(maxLimit) : null,
      referenceStandard: referenceStandard || 'IS 10500:2012',
      applicableSampleTypes: applicableSampleTypes || [],
      description
    });

    res.status(201).json({
      success: true,
      message: 'Test parameter created successfully',
      parameter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update parameter
// @route   PUT /api/parameters/:id
// @access  Private (Admin)
export const updateParameter = async (req, res, next) => {
  try {
    const parameter = await TestParameter.findById(req.params.id);
    if (!parameter) {
      return res.status(404).json({ success: false, message: 'Parameter not found' });
    }

    const {
      name,
      category,
      testMethod,
      unit,
      minLimit,
      maxLimit,
      referenceStandard,
      applicableSampleTypes,
      description,
      isActive
    } = req.body;

    if (name) parameter.name = name;
    if (category) parameter.category = category;
    if (testMethod) parameter.testMethod = testMethod;
    if (unit) parameter.unit = unit;
    if (minLimit !== undefined) parameter.minLimit = minLimit !== '' ? Number(minLimit) : null;
    if (maxLimit !== undefined) parameter.maxLimit = maxLimit !== '' ? Number(maxLimit) : null;
    if (referenceStandard !== undefined) parameter.referenceStandard = referenceStandard;
    if (applicableSampleTypes) parameter.applicableSampleTypes = applicableSampleTypes;
    if (description !== undefined) parameter.description = description;
    if (isActive !== undefined) parameter.isActive = isActive;

    const updatedParameter = await parameter.save();

    res.status(200).json({
      success: true,
      message: 'Test parameter updated successfully',
      parameter: updatedParameter
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / deactivate parameter
// @route   DELETE /api/parameters/:id
// @access  Private (Admin)
export const deleteParameter = async (req, res, next) => {
  try {
    const parameter = await TestParameter.findById(req.params.id);
    if (!parameter) {
      return res.status(404).json({ success: false, message: 'Parameter not found' });
    }

    await TestParameter.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Parameter deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
