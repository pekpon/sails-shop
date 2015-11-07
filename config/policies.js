module.exports.policies = {

   '*': true,

  'PostController': {
    '*': 'isAuthenticated'
  },

};