const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'student_reg_jwt_secret_key_2024';

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.admin = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // ignore invalid tokens for optional auth
    }
  }
  next();
}

module.exports = { adminAuth, optionalAuth };
