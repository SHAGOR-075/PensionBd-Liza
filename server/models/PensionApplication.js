import mongoose from 'mongoose';

const pensionApplicationSchema = new mongoose.Schema({
  // Reference to pension holder
  pensionHolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Personal Information
  personalInfo: {
    fullName: { type: String, required: true, trim: true },
    nid: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true, trim: true }
  },
  
  // Service Information
  serviceInfo: {
    employeeId: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    joiningDate: { type: Date, required: true },
    retirementDate: { type: Date },
    lastBasicSalary: { type: Number, required: true, min: 0 },
    serviceYears: { type: Number, required: true, min: 19 },
    pensionType: { 
      type: String, 
      enum: ['retirement', 'disability', 'survivor'], 
      default: 'retirement' 
    }
  },
  
  // Bank Information
  bankInfo: {
    bankName: { type: String, required: true, trim: true },
    branchName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    routingNumber: { type: String, required: true, trim: true }
  },
  
  // Nominee Information
  nomineeInfo: {
    nomineeName: { type: String, required: true, trim: true },
    nomineeRelation: { 
      type: String, 
      required: true,
      enum: ['spouse', 'son', 'daughter', 'father', 'mother', 'brother', 'sister', 'other']
    },
    nomineeNid: { type: String, required: true, trim: true },
    nomineeAddress: { type: String, trim: true }
  },
  
  // Additional Information
  specialCircumstances: { type: String, trim: true },
  
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'under-review', 'feedback', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Processing Information
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: { type: Date },
  reviewComments: { type: String, trim: true },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: { type: Date },
  
  // Feedback for corrections
  feedback: [{
    message: { type: String, required: true },
    field: { type: String }, // Which field needs correction
    createdAt: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  
  // Pension Calculation (filled after approval)
  pensionDetails: {
    monthlyPension: { type: Number, min: 0 },
    gratuity: { type: Number, min: 0 },
    providentFund: { type: Number, min: 0 },
    calculatedAt: { type: Date }
  },
  
  // Document tracking
  documents: [{
    name: { type: String, required: true },
    path: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Priority flag
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes for better performance
pensionApplicationSchema.index({ pensionHolder: 1 });
pensionApplicationSchema.index({ status: 1 });
pensionApplicationSchema.index({ createdAt: -1 });
pensionApplicationSchema.index({ 'serviceInfo.employeeId': 1 });
pensionApplicationSchema.index({ reviewedBy: 1 });

// Virtual for days since submission
pensionApplicationSchema.virtual('daysSinceSubmission').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status (more than 3 days pending)
pensionApplicationSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && this.daysSinceSubmission > 3;
});

// Method to calculate pension amount
pensionApplicationSchema.methods.calculatePension = function() {
  const lastSalary = this.serviceInfo.lastBasicSalary;
  const serviceYears = this.serviceInfo.serviceYears;
  
  // Basic pension calculation (50% of last salary + 1% per year after 20 years)
  let pensionPercentage = 50;
  if (serviceYears > 20) {
    pensionPercentage += (serviceYears - 20);
  }
  
  // Maximum pension is 80% of last salary
  pensionPercentage = Math.min(pensionPercentage, 80);
  
  const monthlyPension = (lastSalary * pensionPercentage) / 100;
  
  // Gratuity calculation (1 month salary per year of service, max 30 years)
  const gratuityYears = Math.min(serviceYears, 30);
  const gratuity = lastSalary * gratuityYears;
  
  // Provident Fund (estimation - 12% of total earnings)
  const estimatedTotalEarnings = lastSalary * 12 * serviceYears;
  const providentFund = estimatedTotalEarnings * 0.12;
  
  return {
    monthlyPension: Math.round(monthlyPension),
    gratuity: Math.round(gratuity),
    providentFund: Math.round(providentFund)
  };
};

// Method to add feedback
pensionApplicationSchema.methods.addFeedback = function(message, field, userId) {
  this.feedback.push({
    message,
    field,
    createdBy: userId
  });
  this.status = 'feedback';
  return this.save();
};

// Method to approve application
pensionApplicationSchema.methods.approve = function(userId) {
  this.status = 'approved';
  this.approvedBy = userId;
  this.approvedAt = new Date();
  
  // Calculate pension details
  const pensionCalc = this.calculatePension();
  this.pensionDetails = {
    ...pensionCalc,
    calculatedAt: new Date()
  };
  
  return this.save();
};

// Method to reject application
pensionApplicationSchema.methods.reject = function(userId, comments) {
  this.status = 'rejected';
  this.reviewedBy = userId;
  this.reviewedAt = new Date();
  this.reviewComments = comments;
  return this.save();
};

// Static method to find overdue applications
pensionApplicationSchema.statics.findOverdue = function() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  return this.find({
    status: 'pending',
    createdAt: { $lt: threeDaysAgo }
  });
};

// Static method to get statistics
pensionApplicationSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    pending: 0,
    'under-review': 0,
    feedback: 0,
    approved: 0,
    rejected: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

export default mongoose.model('PensionApplication', pensionApplicationSchema);