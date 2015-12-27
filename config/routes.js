module.exports.routes = {
  
  //NORMAL ROUTES
  
  'GET /': { controller: 'MainController', action: 'index' },
  
  'GET /login': {controller: 'AuthController', action: 'printLogin'},
  'GET /signup': {controller: 'AuthController', action: 'printSignUp'},
  'POST /login': {controller: 'AuthController', action: 'login'},
  'GET /logout': {controller: 'AuthController', action: 'logout'},
  
  'GET /collections/:slug': {controller: 'ProductController', action: 'index'},
  'GET /product/:slug': {controller: 'ProductController', action: 'show'},
  
  // CART
  'GET /cart/checkout': { controller: 'CartController', action: 'viewCheckOut'},
  
  'POST /payment' : {controller: 'PaymentController', action: 'payment'},
  'GET /paypal': { controller: 'PaymentController', action: 'paypal'},
  'GET /payment/execute': { controller: 'PaymentController', action: 'execute' },
  'GET /payment/cancel': { controller: 'PaymentController', action: 'cancel' },

  'GET /creditcard': { controller: 'PaymentController', action: 'creditCard'},
  
  'GET /cart/show': { controller: 'CartController', action: 'viewCartDetails'},
  // end CART

  
  'GET /account': { controller: 'UserController', action: 'account'},
  'POST /account': { controller: 'UserController', action: 'update'},
  'GET /account/orders': { controller: 'OrderController', action: 'myorders'},
  'GET /user/success': {controller: 'UserController', action: 'success'},
  'GET /pages/:slug': {controller: 'PageController', action: 'show'},
  
  
  
  
  //ADMIN ROUTES
  
  'GET /admin': {controller: 'admin/AdminController', action: 'index'},
  'GET /admin/settings': {controller: 'SettingsController', action: 'indexAdmin'},
  'GET /admin/settings/add': {controller: 'SettingsController', action: 'addAdmin'},
  'GET /admin/settings/edit/:id': {controller: 'SettingsController', action: 'editAdmin'},
  
  'GET /admin/category': {controller: 'admin/CategoryController', action: 'index'},
  'GET /admin/category/add': {controller: 'admin/CategoryController', action: 'add'},
  'POST /admin/category/create': {controller: 'admin/CategoryController', action: 'create'},
  'GET /admin/category/:id': {controller: 'admin/CategoryController', action: 'show'},
  'GET /admin/category/edit/:id': {controller: 'admin/CategoryController', action: 'edit'},
  'POST /admin/category/update/:id': {controller: 'admin/CategoryController', action: 'update'},
  'GET /admin/category/destroy/:id': {controller: 'admin/CategoryController', action: 'destroy'},
  
  'GET /admin/product': {controller: 'admin/ProductController', action: 'index'},
  'GET /admin/product/add': {controller: 'admin/ProductController', action: 'add'},
  'POST /admin/product/create': {controller: 'admin/ProductController', action: 'create'},
  'POST /admin/product/update/:id': {controller: 'admin/ProductController', action: 'update'},
  
};
