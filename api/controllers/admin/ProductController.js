/**
 * ProductController
 *
 * @description :: Server-side logic for managing Products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var slugg = require('slugg');
var _ = require('lodash');

var ProductController = {
  
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
      
      var featured = req.param('featured') == "true" ? true : false; 
      
      var paramObj = {
        name: req.param('name'),
        description: req.param('description'),
        slug: slugg(req.param('name')),
        category: req.param('category'),
        stock: parseInt(req.param('stock')),
        status: req.param('status'),
        featured: featured,
        price: parseFloat(req.param('price')),
        shipping: parseFloat(req.param('shipping')),
        options: [],
        images: []
      }
           
      if(req.param('oname')){
        if(typeof req.param('oname') == "object"){
          //Two or more options
          for(var i in req.param('oname')){
            paramObj.options.push({name: req.param('oname')[i], stock: req.param('ostock')[i]});
          }
        }else{
          //One option
          paramObj.options.push({name: req.param('oname'), stock: req.param('ostock')});
        }
      }  
      
      Product.create(paramObj, function (err, product) {
        if (err) {
          sails.log.error(err);
        } else {      
          //UPLOAD
          image.upload(req, product, function(err, product){
            if(err){
              console.log('ERROR IMAGE');
              console.log(err);
            }else{
              return res.redirect('/admin/product'); 
            }
          });
        }
      });
      
    },
  
    edit: function(req, res, data) {
      Product.findOne(req.param('id'), function(err, product){
        Category.find(function(err, categories){
          if(req.paramObj)
            product = req.paramObj;
          return res.view('admin/product/edit',{
            layout:'layouts/dashboardLayout',
            product: product,
            categories: categories
          });  
        });
      });

    },
  
    update: function(req, res) {
      
      var images = req.param('images[]') ? req.param('images[]') : [];
      var featured = req.param('featured') == "true" ? true : false; 
      
      var paramObj = {
        name: req.param('name'),
        description: req.param('description'),
        slug: slugg(req.param('name')),
        category: req.param('category'),
        stock: parseInt(req.param('stock')),
        featured: featured,
        status: req.param('status'),
        price: parseFloat(req.param('price')),
        shipping: parseFloat(req.param('shipping')),
        options: [],
        images: images
      }
      
       if(req.param('oname')){
        if(typeof req.param('oname') == "object"){
          //Two or more options
          for(var i in req.param('oname')){
            paramObj.options.push({name: req.param('oname')[i], stock: req.param('ostock')[i]});
          }
        }else{
          //One option
          paramObj.options.push({name: req.param('oname'), stock: req.param('ostock')});
        }
      }

      Product.update(req.param('id'), paramObj, function (err,product) {
        if (err) {
          sails.log.error("ProductController#update error");        
          sails.log.error(err);
          
          req.paramObj = paramObj;
          req.paramObj.id = req.param('id');
          
          ProductController.edit(req, res);
        } else {
          
          //UPLOAD
          image.upload(req, product[0], function(err, product){
            if(err){
              console.log('ERROR IMAGE');
              console.log(err);
            }else{
              return res.redirect('/admin/product'); 
            }
          });
          
        }
      });
      
    },
  
    destroy: function(req, res, next) {
      Product.destroy(req.param('id'), function (err) {
        if (err) {
          sails.log.error("ProductController#destroy error");        
          res.serverError();
        } else {
          res.redirect('/admin/product');
        }
      });
    },
};

module.exports = ProductController;
