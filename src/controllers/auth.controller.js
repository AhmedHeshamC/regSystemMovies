const authService = require('../services/auth.service');
const { addToBlacklist } = require('../utils/tokenBlacklist.utils');

class AuthController {
  async signup(req, res, next) {
    const { username, password } = req.body;
    try {
      const newUser = await authService.signup(username, password);
      // Exclude password hash before sending response
      const { password_hash, ...userResponse } = newUser;
      res.status(201).json(userResponse);
    } catch (error) {
      next(error); // Pass error to error handling middleware
    }
  }

  async login(req, res, next) {
    console.log('>>> Entering authController.login'); // <<< ADD LOG
    const { username, password } = req.body;
    try {
      const token = await authService.login(username, password);
      console.log('>>> Login successful, attempting to send 200 OK'); // <<< ADD LOG
      res.status(200).json({ token });
    } catch (error) {
      console.log('>>> Error in authController.login, passing to error handler:', error.message); // <<< ADD LOG
      next(error); // Pass error to error handling middleware
    }
  }

  async logout(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      addToBlacklist(token);
      console.log(`Token blacklisted for user: ${req.user ? req.user.username : 'unknown'}`);
    }
    res.status(200).json({ message: 'Logged out successfully' });
  }

  async createAdmin(req, res, next) {
    const { username, password } = req.body;
    try {
      // The authorizeAdmin middleware ensures only admins can reach here
      const newAdmin = await authService.createAdmin(username, password);
      // Exclude password hash before sending response
      const { password_hash, ...adminResponse } = newAdmin;
      res.status(201).json(adminResponse);
    } catch (error) {
      next(error); // Pass error to error handling middleware
    }
  }
}

module.exports = new AuthController();
