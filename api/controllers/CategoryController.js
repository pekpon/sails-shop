/**
 * CategoryController
 *
 * @description :: Server-side logic for managing Categories
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var slugg = require('slugg');

var sample = {
  name : '',
  slug : ''
};

var _doesCategoryExists = function (req, res, cb) {
  Category.findOne(req.param('id'), function (err, category) {
    if (err) {
      res.serverError();      
    } else {
      if (!category) {
        res.notFound();
      } else {
        cb(category);
      }
    }
  });
}

module.exports = {
	
  add: function(req,res){   
    var paramObj = req.flash('paramObj')
      , obj = (paramObj[0]) ? paramObj[0] : {}; 

    res.view('admin/category/add',{
      layout:'layouts/dashboardLayout',
      category: _.defaults(obj, sample)
    });    
  },

  create: function(req, res) {

    var paramObj = {
        name: req.param('name'),
        slug: slugg(req.param('name'))
    }

    // Create a Category with the params sent from 
    // the form --> add.ejs
    Category.create(paramObj, function (err, category) {

      if (err) {
        sails.log.error("CategoryController#create error");
        sails.log.error(err);

        if(err.ValidationError){
          error_object = validator(Category, err.ValidationError);
          req.flash('error', error_object);
          req.flash('paramObj', req.allParams());
          res.redirect('/admin/category/add');
        } else {
          res.serverError();      
        }

      } else {
        res.redirect('/admin/category/');
      }
    });
  },

  show: function(req, res, next) {
    _doesCategoryExists(req, res, function (category) {

        if (err) {
          sails.log.error("CategoryController#show error");        
          sails.log.error(err);
          res.serverError();
        } else {
          res.view('admin/category/show',{
            layout:'layouts/dashboardLayout',
            category: category
          });
        }    
  
    });
  },

  index: function(req, res, next) {
    Category.find(function (err, categorys) {
      if (err) {
        sails.log.error("CategoryController#index error");        
        sails.log.error(err);
        res.serverError();
      } else {        
        
        res.view('admin/category/index',{
          layout:'layouts/dashboardLayout',
          categorys: categorys
        });
        
      }
    });
  },

  edit: function(req, res, next) {

    _doesCategoryExists(req, res, function (category) {

          var paramObj = req.flash('paramObj')
            , obj = (paramObj[0]) ? paramObj[0] : {};

          res.view('admin/category/edit',{
            layout:'layouts/dashboardLayout',
            category: _.defaults(obj, category)
          });
        
    
    });
  },

  update: function(req, res, next) {

    var paramObj = {
        name: req.param('name'),
        slug: req.param('slug')
    }

    Category.update(req.param('id'), paramObj, function (err,category) {
      if (err) {
        sails.log.error("CategoryController#update error");        
        sails.log.error(err);

        if(err.ValidationError){
          error_object = validator(Category, err.ValidationError);
          req.flash('error', error_object);
          req.flash('paramObj', req.allParams());
          res.redirect('/admin/category/edit/' + req.param('id'));

        } else {
          res.serverError();
        }

      } else {
        res.redirect('/admin/category/');
      }
    });
  },

  destroy: function(req, res, next) {

    _doesCategoryExists(req, res, function (category) {
      Category.destroy(req.param('id'), function (err) {
        if (err) {
          sails.log.error("CategoryController#destroy error");        
          res.serverError();
        } else {
          res.redirect('/admin/category');
        }
      });
    });
  },

};



