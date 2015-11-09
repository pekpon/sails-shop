module.exports.routes = {
  'GET /': { controller: 'MainController', action: 'index' },
  
  'GET /login': {controller: 'AuthController', action: 'printLogin'},
  'GET /signup': {controller: 'AuthController', action: 'printSignUp'},
  'POST /login': 'AuthController.login',
  'GET /logout': 'AuthController.logout',
  
  'GET /collections/:slug': {controller: 'ProductController', action: 'index'},
  
  'GET /product/:slug': {controller: 'ProductController', action: 'show'},
  
  'GET /admin': 'AdminController.index',
  
  'GET /admin/category': {controller: 'CategoryController', action: 'index'},
  'GET /admin/category/add': {controller: 'CategoryController', action: 'add'},
  'POST /admin/category/create': {controller: 'CategoryController', action: 'create'},
  'GET /admin/category/:id': {controller: 'CategoryController', action: 'show'},
  'GET /admin/category/edit/:id': {controller: 'CategoryController', action: 'edit'},
  'POST /admin/category/update/:id': {controller: 'CategoryController', action: 'update'},
  'GET /admin/category/destroy/:id': {controller: 'CategoryController', action: 'destroy'},
  
  'GET /admin/product': {controller: 'ProductController', action: 'index'},
  'GET /admin/product/add': {controller: 'ProductController', action: 'add'},
  'POST /admin/product/create': {controller: 'ProductController', action: 'create'},
};
