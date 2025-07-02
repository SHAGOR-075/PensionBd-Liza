import express from 'express';
import { body, validationResult } from 'express-validator';
import PensionApplication from '../models/PensionApplication.js';
import User from '../models/User.js';
import { authenticate, isManager } from '../middleware/auth.js';

const router = express.Router();

// Get all applications for review
router.get('/applications', authenticate, isManager, async (req, res) => {
  try {
    const applications = await PensionApplication.find({
      status: { $in: ['pending', 'under-review', 'feedback'] }
    })
    .populate('pensionHolder', 'name email employeeId')
    .sort({ createdAt: 1 }); // Oldest first for FIFO processing

    // Add pension holder name to each application
    const applicationsWithNames = applications.map(app => ({
      ...app.toObject(),
      pensionHolderName: app.pensionHolder?.name || 'N/A'
    }));

    res.json(applicationsWithNames);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single application details
router.get('/applications/:id', authenticate, isManager, async (req, res) => {
  try {
    const application = await PensionApplication.findById(req.params.id)
      .populate('pensionHolder', 'name email employeeId department');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve application
router.put('/applications/:id/approve', authenticate, isManager, async (req, res) => {
  try {
    const application = await PensionApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application cannot be approved in current status' });
    }

    await application.approve(req.user.userId);

    res.json({
      message: 'Application approved successfully',
      application
    });

  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject application
router.put('/applications/:id/reject', authenticate, isManager, [
  body('comments').trim().isLength({ min: 10 }).withMessage('Rejection reason must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const application = await PensionApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application cannot be rejected in current status' });
    }

    await application.reject(req.user.userId, req.body.comments);

    res.json({
      message: 'Application rejected successfully',
      application
    });

  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request feedback
router.put('/applications/:id/feedback', authenticate, isManager, [
  body('comments').trim().isLength({ min: 5 }).withMessage('Feedback message must be at least 5 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const application = await PensionApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Feedback can only be requested for pending applications' });
    }

    await application.addFeedback(req.body.comments, req.body.field, req.user.userId);

    res.json({
      message: 'Feedback sent successfully',
      application
    });

  } catch (error) {
    console.error('Error sending feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get manager statistics
router.get('/stats', authenticate, isManager, async (req, res) => {
  try {
    const stats = await PensionApplication.getStats();
    
    // Get overdue applications count
    const overdueCount = await PensionApplication.countDocuments({
      status: 'pending',
      createdAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      ...stats,
      overdue: overdueCount
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;