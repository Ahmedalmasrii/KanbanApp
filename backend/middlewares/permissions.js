const roles = require('../utils/roles');

const checkPermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const permissions = roles[userRole] || [];

    if (!permissions.includes(permission)) {
      return res.status(403).json({ msg: 'Ingen behörighet för denna åtgärd' });
    }

    next();
  };
};

module.exports = checkPermission;
