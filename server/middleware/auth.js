import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been disabled.' });
    }

    req.user = decoded;
    req.userDetails = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userDetails) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!roles.includes(req.userDetails.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: roles,
        userRole: req.userDetails.role
      });
    }

    next();
  };
};

// Check if user is pension holder
export const isPensionHolder = (req, res, next) => {
  if (req.userDetails.role !== 'pension-holder') {
    return res.status(403).json({ message: 'Access denied. Pension holders only.' });
  }
  next();
};

// Check if user is manager
export const isManager = (req, res, next) => {
  if (req.userDetails.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied. Managers only.' });
  }
  next();
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.userDetails.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

// Check if user is manager or admin
export const isManagerOrAdmin = (req, res, next) => {
  if (!['manager', 'admin'].includes(req.userDetails.role)) {
    return res.status(403).json({ message: 'Access denied. Managers or admins only.' });
  }
  next();
};

// Optional authentication (don't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = decoded;
        req.userDetails = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore token errors in optional auth
    next();
  }
};

// Rate limiting per user
export const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.userId;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (userRequests.has(userId)) {
      const requests = userRequests.get(userId).filter(time => time > windowStart);
      userRequests.set(userId, requests);
    } else {
      userRequests.set(userId, []);
    }

    const requests = userRequests.get(userId);

    if (requests.length >= maxRequests) {
      return res.status(429).json({ 
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
      });
    }

    requests.push(now);
    next();
  };
};