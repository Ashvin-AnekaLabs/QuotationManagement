const ApiError = require('../utils/ApiError');

const authorizePermission = (moduleCode, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User not authenticated'));
    }

    if (req.user.isAdmin) {
      return next();
    }

    if (!req.user.privileges || !req.user.privileges[moduleCode] || req.user.privileges[moduleCode][action] !== true) {
      return next(ApiError.forbidden(`Access denied. Missing '${action}' permission for module '${moduleCode}'`));
    }

    next();
  };
};

module.exports = authorizePermission;
