module.exports.policies = {


  
  'AuthController': {
    '*': 'category'
  },
  
  'MainController': {
    '*': ['category', 'cart']
  },
  
  'AdminController': {
    '*': ['isAuthenticated']
  },
  
  'CategoryController': {
    '*': ['isAuthenticated']
  },
  
  'ProductController': {
    '*': ['cart','category'],
    'add': ['isAuthenticated'],
    'create' : 'isAuthenticated'
  },
  
  'CartController': {
    '*': ['cart','category']
  },

};