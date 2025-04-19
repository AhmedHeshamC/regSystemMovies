const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        status: 400,
        message: 'Validation failed',
        details: errors.array(),
      },
    });
  }
  next();
};

const signupValidationRules = () => {
  return [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required.')
      .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.'),
    body('password')
      .notEmpty().withMessage('Password is required.')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  ];
};

const loginValidationRules = () => {
    return [
      body('username').trim().notEmpty().withMessage('Username is required.'),
      body('password').notEmpty().withMessage('Password is required.'),
    ];
  };

const genreValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty().withMessage('Genre name is required.')
      .isLength({ min: 2 }).withMessage('Genre name must be at least 2 characters long.'),
  ];
};

module.exports = {
  signupValidationRules,
  loginValidationRules,
  handleValidationErrors,
  genreValidationRules, // Export the new rules
};