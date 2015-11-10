module.exports.routes = {
  'GET /': { controller: 'MainController', action: 'index' },
  
  'GET /login': {controller: 'AuthController', action: 'printLogin'},
  'GET /signup': {controller: 'AuthController', action: 'printSignUp'},
  'POST /login': {controller: 'AuthController', action: 'login'},
  'GET /logout': {controller: 'AuthController', action: 'logout'},
  
  'GET /collections/:slug': {controller: 'ProductController', action: 'index'},
  
  'GET /product/:slug': {controller: 'ProductController', action: 'show'},
  
  'POST /addtocart': { controller: 'CartController', action: 'add'},
  'GET /cart': { controller: 'CartController', action: 'show'},
  
  
  
  'GET /admin': {controller: 'AdminController', action: 'index'},
  
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
