import mongoose from 'mongoose';

const sampleSchema = new mongoose.Schema(
  {
    sampleId: {
      type: String,
      required: [true, 'Sample ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      trim: true
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true
    },
    sampleType: {
      type: String,
      required: [true, 'Sample type is required'],
      enum: [
        'Drinking Water',
        'Ground Water',
        'Surface Water',
        'Waste Water',
        'Industrial Water',
        'Other'
      ],
      index: true
    },
    sourceType: {
      type: String,
      required: [true, 'Source type is required'],
      enum: [
        'Borewell',
        'River',
        'Lake',
        'Tank',
        'Municipal Supply',
        'Industrial Source',
        'Other'
      ],
      default: 'Borewell'
    },
    collectionLocation: {
      type: String,
      required: [true, 'Collection location is required'],
      trim: true
    },
    collectionDate: {
      type: Date,
      required: [true, 'Collection date is required'],
      default: Date.now
    },
    receivedDate: {
      type: Date
    },
    sampleQuantity: {
      type: String,
      default: '1000 mL'
    },
    sampleCondition: {
      type: String,
      enum: ['Good', 'Damaged', 'Leaking', 'Contaminated'],
      default: 'Good'
    },
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High', 'Urgent'],
      default: 'Normal',
      index: true
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: [
        'REGISTERED',
        'RECEIVED',
        'UNDER ANALYSIS',
        'ANALYSIS COMPLETED',
        'REPORT GENERATED',
        'APPROVED',
        'DELIVERED'
      ],
      default: 'REGISTERED',
      index: true
    },
    remarks: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Sample = mongoose.model('Sample', sampleSchema);
export default Sample;
