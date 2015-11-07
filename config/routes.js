module.exports.routes = {
  '/': { view: 'homepage' },
  'get /login': { view: 'auth/login' },
  'post /login': 'AuthController.login',
  '/logout': 'AuthController.logout',
  'get /signup': { view: 'auth/signup'}
};
