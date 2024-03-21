const User = require('../../models/User');

const hasRole = (...allowedRoles) => async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      console.log('Unauthorized: No session userId found');
      return res.status(401).send('You are not authenticated');
    }
    const user = await User.findById(userId);
    if (!user) {
      console.log(`Unauthorized: User with ID ${userId} not found`);
      return res.status(401).send('User not found');
    }
    if (!allowedRoles.includes(user.role)) {
      console.log(`Forbidden: User role ${user.role} not allowed`);
      return res.status(403).send('You do not have permission to access this resource');
    }
    next();
  } catch (error) {
    console.error('Authorization error:', error.message);
    console.error(error.stack);
    res.status(500).send('Internal server error');
  }
};

module.exports = {
  hasRole
};