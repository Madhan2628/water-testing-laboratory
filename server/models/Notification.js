import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    targetRole: {
      type: String,
      enum: ['admin', 'technician', 'compliance_officer', 'customer']
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        'SAMPLE_REGISTERED',
        'SAMPLE_RECEIVED',
        'ANALYSIS_COMPLETED',
        'NON_COMPLIANT_ALERT',
        'REPORT_GENERATED',
        'REPORT_APPROVED',
        'SYSTEM'
      ],
      required: true,
      index: true
    },
    sample: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sample'
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
