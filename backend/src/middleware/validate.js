const { ZodError } = require('zod');

/**
 * Express middleware factory for validating request body against a Zod schema.
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: formattedErrors[0]?.message || 'Input data tidak valid.',
        errors: formattedErrors,
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Format data tidak valid.',
    });
  }
};

module.exports = validate;
