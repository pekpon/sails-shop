module.exports.policies = {

  'AuthController': {
    '*': ['category', 'cart']
  },
  
  'MainController': {
    '*': ['category', 'cart']
  },
  
  'ProductController': {
    '*': ['category', 'cart']
  },
  
  'CartController': {
    '*': ['category', 'cart']
  },
  
  
  
  'admin/AdminController': {
    '*': ['isAuthenticated']
  },
  
  'admin/ProductController': {
    '*': ['isAuthenticated']
  },
  
  'admin/CategoryController': {
    '*': ['isAuthenticated']
  },

};