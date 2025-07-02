import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  // Reference to complainant (pension holder)
  complainant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Reference to application (if complaint is about specific application)
  relatedApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PensionApplication'
  },
  
  // Reference to manager (if complaint is about manager)
  targetManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Complaint Details
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  category: {
    type: String,
    enum: [
      'application-delay',
      'incorrect-processing',
      'manager-misconduct', 
      'system-issue',
      'documentation-problem',
      'payment-issue',
      'other'
    ],
    required: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['submitted', 'under-investigation', 'resolved', 'dismissed', 'escalated'],
    default: 'submitted'
  },
  
  // Investigation details
  investigatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  investigationNotes: {
    type: String,
    trim: true
  },
  
  investigationStarted: { type: Date },
  investigationCompleted: { type: Date },
  
  // Resolution
  resolution: {
    type: String,
    trim: true
  },
  
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  resolvedAt: { type: Date },
  
  // Red flag information
  redFlagIssued: {
    type: Boolean,
    default: false
  },
  
  redFlagReason: {
    type: String,
    trim: true
  },
  
  redFlagIssuedAt: { type: Date },
  
  // Supporting documents/evidence
  attachments: [{
    name: { type: String, required: true },
    path: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Communication log
  communications: [{
    message: { type: String, required: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sentAt: { type: Date, default: Date.now },
    messageType: {
      type: String,
      enum: ['inquiry', 'response', 'update', 'resolution'],
      default: 'response'
    }
  }],
  
  // Escalation tracking
  escalationLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  
  escalatedAt: { type: Date },
  escalatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Satisfaction rating (after resolution)
  satisfactionRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  satisfactionFeedback: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
complaintSchema.index({ complainant: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ targetManager: 1 });
complaintSchema.index({ createdAt: -1 });

// Virtual for days since submission
complaintSchema.virtual('daysSinceSubmission').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for investigation duration
complaintSchema.virtual('investigationDuration').get(function() {
  if (!this.investigationStarted) return 0;
  
  const endDate = this.investigationCompleted || new Date();
  const diffTime = Math.abs(endDate - this.investigationStarted);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to start investigation
complaintSchema.methods.startInvestigation = function(investigatorId, notes) {
  this.status = 'under-investigation';
  this.investigatedBy = investigatorId;
  this.investigationNotes = notes;
  this.investigationStarted = new Date();
  return this.save();
};

// Method to resolve complaint
complaintSchema.methods.resolve = function(resolverId, resolution, issueRedFlag = false, redFlagReason = '') {
  this.status = 'resolved';
  this.resolvedBy = resolverId;
  this.resolvedAt = new Date();
  this.resolution = resolution;
  this.investigationCompleted = new Date();
  
  if (issueRedFlag && this.targetManager) {
    this.redFlagIssued = true;
    this.redFlagReason = redFlagReason;
    this.redFlagIssuedAt = new Date();
  }
  
  return this.save();
};

// Method to dismiss complaint
complaintSchema.methods.dismiss = function(dismisserId, reason) {
  this.status = 'dismissed';
  this.resolvedBy = dismisserId;
  this.resolvedAt = new Date();
  this.resolution = reason;
  this.investigationCompleted = new Date();
  return this.save();
};

// Method to escalate complaint
complaintSchema.methods.escalate = function(escalatorId, level) {
  this.escalationLevel = Math.min(level, 3);
  this.escalatedBy = escalatorId;
  this.escalatedAt = new Date();
  this.status = 'escalated';
  return this.save();
};

// Method to add communication
complaintSchema.methods.addCommunication = function(message, senderId, recipientId, messageType = 'response') {
  this.communications.push({
    message,
    sender: senderId,
    recipient: recipientId,
    messageType
  });
  return this.save();
};

// Method to rate satisfaction
complaintSchema.methods.rateSatisfaction = function(rating, feedback = '') {
  this.satisfactionRating = rating;
  this.satisfactionFeedback = feedback;
  return this.save();
};

// Static method to find complaints by manager
complaintSchema.statics.findByManager = function(managerId) {
  return this.find({ targetManager: managerId });
};

// Static method to find high priority complaints
complaintSchema.statics.findHighPriority = function() {
  return this.find({ 
    priority: { $in: ['high', 'critical'] },
    status: { $in: ['submitted', 'under-investigation'] }
  }).sort({ createdAt: -1 });
};

// Static method to get complaint statistics
complaintSchema.statics.getStats = async function() {
  const [statusStats, categoryStats, priorityStats] = await Promise.all([
    this.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ])
  ]);
  
  return {
    byStatus: statusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    byCategory: categoryStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    byPriority: priorityStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {})
  };
};

export default mongoose.model('Complaint', complaintSchema);