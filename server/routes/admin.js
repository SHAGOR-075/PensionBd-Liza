import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import PensionApplication from '../models/PensionApplication.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all complaints
router.get('/complaints', authenticate, isAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('complainant', 'name email employeeId')
      .populate('targetManager', 'name email department')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    // Add complainant name to each complaint
    const complaintsWithNames = complaints.map(complaint => ({
      ...complaint.toObject(),
      complainantName: complaint.complainant?.name || 'N/A',
      targetManagerName: complaint.targetManager?.name || 'N/A',
      resolvedByName: complaint.resolvedBy?.name || 'N/A'
    }));

    res.json(complaintsWithNames);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent complaints
router.get('/recent-complaints', authenticate, isAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('complainant', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const complaintsWithNames = complaints.map(complaint => ({
      ...complaint.toObject(),
      complainantName: complaint.complainant?.name || 'N/A'
    }));

    res.json(complaintsWithNames);
  } catch (error) {
    console.error('Error fetching recent complaints:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resolve complaint
router.put('/complaints/:id/resolve', authenticate, isAdmin, [
  body('resolution').trim().isLength({ min: 10 }).withMessage('Resolution must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const { resolution, issueRedFlag, redFlagReason } = req.body;

    await complaint.resolve(req.user.userId, resolution, issueRedFlag, redFlagReason);

    // If red flag is issued, increment manager's red flag count
    if (issueRedFlag && complaint.targetManager) {
      const manager = await User.findById(complaint.targetManager);
      if (manager) {
        await manager.addRedFlag();
        
        // Disable account if 3 or more red flags
        if (manager.shouldBeDisabled()) {
          manager.isActive = false;
          await manager.save();
        }
      }
    }

    res.json({
      message: 'Complaint resolved successfully',
      complaint
    });

  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dismiss complaint
router.put('/complaints/:id/dismiss', authenticate, isAdmin, [
  body('resolution').trim().isLength({ min: 10 }).withMessage('Dismissal reason must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    await complaint.dismiss(req.user.userId, req.body.resolution);

    res.json({
      message: 'Complaint dismissed successfully',
      complaint
    });

  } catch (error) {
    console.error('Error dismissing complaint:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['manager', 'admin'] } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user
router.post('/users', authenticate, isAdmin, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['manager', 'admin']).withMessage('Role must be manager or admin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role, department, designation } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      department,
      designation,
      isVerified: true,
      isActive: true
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/users/:id', authenticate, isAdmin, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['manager', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, password, role, department, designation } = req.body;

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (password) user.password = password;
    if (role) user.role = role;
    if (department) user.department = department;
    if (designation) user.designation = designation;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user status
router.put('/users/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = req.body.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'enabled' : 'disabled'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin statistics
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const [userStats, complaintStats] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } }
          }
        }
      ]),
      Complaint.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const stats = {
      totalUsers: 0,
      activeManagers: 0,
      disabledManagers: 0,
      totalComplaints: 0,
      pendingComplaints: 0,
      resolvedComplaints: 0,
      redFlagsIssued: 0
    };

    // Process user stats
    userStats.forEach(stat => {
      if (stat._id === 'manager') {
        stats.activeManagers = stat.active;
        stats.disabledManagers = stat.count - stat.active;
      }
      stats.totalUsers += stat.count;
    });

    // Process complaint stats
    complaintStats.forEach(stat => {
      stats.totalComplaints += stat.count;
      if (stat._id === 'submitted' || stat._id === 'under-investigation') {
        stats.pendingComplaints += stat.count;
      } else if (stat._id === 'resolved') {
        stats.resolvedComplaints += stat.count;
      }
    });

    // Get red flags count
    const redFlagsCount = await Complaint.countDocuments({ redFlagIssued: true });
    stats.redFlagsIssued = redFlagsCount;

    res.json(stats);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get flagged managers
router.get('/flagged-managers', authenticate, isAdmin, async (req, res) => {
  try {
    const flaggedManagers = await User.find({
      role: 'manager',
      redFlags: { $gte: 2 }
    }).select('name email department redFlags').sort({ redFlags: -1 });

    res.json(flaggedManagers);
  } catch (error) {
    console.error('Error fetching flagged managers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;