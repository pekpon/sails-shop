/**
 * ProductController
 *
 * @description :: Server-side logic for managing Products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var slugg = require('slugg');

module.exports = {
  
	index: function(req, res, next) {
      Product.find(function(err, products){
        return res.view({
          layout:'layouts/dashboardLayout', 
          products: products
        });
      });
    },
  
    add: function(req,res){   
      Category.find(function(err, categories){
        
        return res.view({
          layout:'layouts/dashboardLayout',
          product: {},
          categories: categories
        });  
        
      });
    },

    create: function(req, res) {
      
      console.log(req.allParams);
      var paramObj = {
        name: req.param('name'),
        description: req.param('description'),
        slug: slugg(req.param('name')),
        category: req.param('category'),
        stock: req.param('stock'),
        status: req.param('status'),
        price: req.param('price'),
        shipping: req.param('shipping')
      }

      Product.create(paramObj, function (err, product) {

        if (err) {
          sails.log.error("ProductController#create error");
          sails.log.error(err);
        } else {
          var rootPath = sails.config.appPath;
          
          req.file('images')
            .upload({
              dirname: rootPath + '/assets/images/upload'
            },
            function whenDone(err, uploadedFiles) {
              if (err) {
                return res.serverError(err);
              }else{
                var images = [];
                for(var i in uploadedFiles){
                  var file = uploadedFiles[i].fd.split('/');
                  images.push('/images/upload/' + file[8]);
                }
                product.images = images;
                product.save();
                return res.redirect('/admin/product');
                
              } 
            });
      
        }
      });
      
    }
  
};

