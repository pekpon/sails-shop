/**
 * ProductController
 *
 * @description :: Server-side logic for managing Products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  
	index: function(req, res, next) {
      Product.find({category: req.param('slug')}, function(products){
        res.view({products: products});
      });
    },
  
    add: function(req,res){   
      res.view('admin/product/add',{
        layout:'layouts/dashboardLayout',
        product: {}
      });  
    },

    create: function(req, res) {
      
      var paramObj = {
        name: req.param('name'),
        description: req.param('description'),
        slug: req.param('slug')
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
                return res.redirect('/admin/product/add');
                
              } 
            });
      
        }
      });
      
    },
  
    show: function(req, res, next) {
      Product.findOne({slug: req.param('slug')}, function(err, product){
        if(err) return res.serverError(err);
        return res.view({product: product});
      });
    },
  
};

