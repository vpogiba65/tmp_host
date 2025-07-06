const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.details = error.details;
      return next(err);
    }
    next();
  };
};

const eventSchema = Joi.object({
  id: Joi.string().uuid().required(),
  tid: Joi.string().pattern(/^[A-Z0-9]{8}$/).required(),
  sent_at: Joi.date().iso().required(),
  events: Joi.array().items(
    Joi.object({
      id: Joi.string().uuid().required(),
      timestamp: Joi.number().integer().min(0).required(),
      type: Joi.string().min(1).max(50).required(),
      data: Joi.any().required()
    })
  ).min(1).required()
});

module.exports = {
  validate,
  eventSchema
}; 