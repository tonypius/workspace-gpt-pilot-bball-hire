const User = require('../../models/User');

const userTypeMiddleware = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        console.log(`User with ID ${req.session.userId} not found.`);
        return res.status(404).send('User not found');
      }
      req.userRole = user.role; // Attaching the user's role to the request object
      console.log(`User role identified as ${user.role}`);
      next(); // Passing control to the next middleware/route handler
    } catch (error) {
      console.error('Error in userTypeMiddleware:', error);
      console.error(error.stack);
      return res.status(500).send('Internal Server Error');
    }
  } else {
    console.log('No userId in session, passing control to the next middleware.');
    next(); // If no userId in session, simply pass control to the next middleware/route handler
  }
};

module.exports = userTypeMiddleware;