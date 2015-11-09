module.exports.policies = {

  '*': [true, 'category'],
  
  'AuthController': {
    '*': 'category'
  },
  
  'MainController': {
    '*': 'category'
  },
  
  'AdminController': {
    '*': ['isAuthenticated', 'isAdmin']
  },

};