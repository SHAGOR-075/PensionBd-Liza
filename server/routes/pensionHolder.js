import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import PensionApplication from '../models/PensionApplication.js';
import Complaint from '../models/Complaint.js';
import { authenticate, isPensionHolder } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  console.log('JWT_SECRET from env:', process.env.JWT_SECRET);
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register pension holder
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('nid').trim().isLength({ min: 10, max: 17 }).withMessage('Please provide a valid NID'),
  body('phone').trim().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('employeeId').trim().isLength({ min: 1 }).withMessage('Employee ID is required'),
  body('department').trim().isLength({ min: 1 }).withMessage('Department is required'),
  body('designation').trim().isLength({ min: 1 }).withMessage('Designation is required'),
  body('joiningDate').isISO8601().withMessage('Please provide a valid joining date')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name, email, password, nid, phone, employeeId,
      department, designation, joiningDate
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { nid },
        { employeeId }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email, NID, or Employee ID'
      });
    }

    // Create new pension holder
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: 'pension-holder',
      nid,
      phone,
      employeeId,
      department,
      designation,
      joiningDate: new Date(joiningDate),
      isVerified: true // Auto-verify for now
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        joiningDate: user.joiningDate
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login pension holder
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find pension holder
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      role: 'pension-holder'
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        message: 'Account is temporarily locked due to too many failed login attempts' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(423).json({ message: 'Account has been disabled' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        joiningDate: user.joiningDate
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get pension holder applications
router.get('/applications', authenticate, isPensionHolder, async (req, res) => {
  try {
    const applications = await PensionApplication.find({ 
      pensionHolder: req.user.userId 
    }).sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit pension application
router.post('/applications', authenticate, isPensionHolder, [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('nid').trim().isLength({ min: 10 }).withMessage('Valid NID is required'),
  body('employeeId').trim().isLength({ min: 1 }).withMessage('Employee ID is required'),
  body('lastBasicSalary').isNumeric().withMessage('Valid salary amount is required'),
  body('serviceYears').isNumeric().isFloat({ min: 19 }).withMessage('Minimum 19 years of service required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user already has a pending application
    const existingApplication = await PensionApplication.findOne({
      pensionHolder: req.user.userId,
      status: { $in: ['pending', 'under-review', 'feedback'] }
    });

    if (existingApplication) {
      return res.status(400).json({
        message: 'You already have a pending application. Please wait for it to be processed.'
      });
    }

    const applicationData = {
      pensionHolder: req.user.userId,
      personalInfo: {
        fullName: req.body.fullName,
        nid: req.body.nid,
        phone: req.body.phone,
        email: req.body.email,
        dateOfBirth: new Date(req.body.dateOfBirth),
        address: req.body.address
      },
      serviceInfo: {
        employeeId: req.body.employeeId,
        department: req.body.department,
        designation: req.body.designation,
        joiningDate: new Date(req.body.joiningDate),
        retirementDate: req.body.retirementDate ? new Date(req.body.retirementDate) : null,
        lastBasicSalary: parseFloat(req.body.lastBasicSalary),
        serviceYears: parseFloat(req.body.serviceYears),
        pensionType: req.body.pensionType || 'retirement'
      },
      bankInfo: {
        bankName: req.body.bankName,
        branchName: req.body.branchName,
        accountNumber: req.body.accountNumber,
        routingNumber: req.body.routingNumber
      },
      nomineeInfo: {
        nomineeName: req.body.nomineeName,
        nomineeRelation: req.body.nomineeRelation,
        nomineeNid: req.body.nomineeNid,
        nomineeAddress: req.body.nomineeAddress
      },
      specialCircumstances: req.body.specialCircumstances
    };

    const application = new PensionApplication(applicationData);
    await application.save();

    res.status(201).json({
      message: 'Pension application submitted successfully',
      application
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit complaint
router.post('/complaints', authenticate, isPensionHolder, [
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('category').isIn([
    'application-delay', 'incorrect-processing', 'manager-misconduct', 
    'system-issue', 'documentation-problem', 'payment-issue', 'other'
  ]).withMessage('Please select a valid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const complaintData = {
      complainant: req.user.userId,
      subject: req.body.subject,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority || 'medium'
    };

    // Add related application if provided
    if (req.body.relatedApplication) {
      const application = await PensionApplication.findById(req.body.relatedApplication);
      if (application && application.pensionHolder.toString() === req.user.userId) {
        complaintData.relatedApplication = req.body.relatedApplication;
      }
    }

    // Add target manager if provided
    if (req.body.targetManager) {
      const manager = await User.findOne({ 
        name: { $regex: req.body.targetManager, $options: 'i' },
        role: 'manager'
      });
      if (manager) {
        complaintData.targetManager = manager._id;
      }
    }

    const complaint = new Complaint(complaintData);
    await complaint.save();

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });

  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get application PDF
router.get('/applications/:id/pdf', authenticate, isPensionHolder, async (req, res) => {
  try {
    const application = await PensionApplication.findOne({
      _id: req.params.id,
      pensionHolder: req.user.userId,
      status: 'approved'
    });

    if (!application) {
      return res.status(404).json({ message: 'Approved application not found' });
    }

    // TODO: Generate PDF using PDFKit or similar library
    // For now, return a placeholder response
    res.json({ message: 'PDF generation not implemented yet' });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;