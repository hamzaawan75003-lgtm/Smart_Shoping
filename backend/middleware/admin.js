const adminMiddleware = (req, res, next) => {
  // Must be used after authMiddleware — req.user is already set
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = adminMiddleware;
