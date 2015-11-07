module.exports.policies = {

  '*': true,
  
  'MainController': {
    '*': 'category'
  },

  'PostController': {
    '*': 'isAuthenticated'
  },
  
  'AdminController': {
    '*': ['isAuthenticated', 'isAdmin']
  },

};