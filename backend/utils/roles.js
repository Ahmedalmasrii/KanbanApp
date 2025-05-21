const roles = {
    viewer: [],
    user: ['create_orders', 'view_orders'],
    manager: ['create_orders', 'view_orders', 'edit_orders', 'delete_orders'],
    admin: ['create_orders', 'view_orders', 'edit_orders', 'delete_orders', 'manage_users']
  };
  
  module.exports = roles;
  