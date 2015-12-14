module.exports = {

  getFirst: function (images) {
    var image;
    
    if(images && images.length > 0){
      image = images[0];
    }else{
      image = "https://d1luk0418egahw.cloudfront.net/static/images/guide/NoImage_592x444.jpg"
    }
    
    return image;
  },
  
    
  upload: function(req, product, callback){
    var rootPath = sails.config.appPath;
          
      req.file('imagesUploader').upload({
        dirname: rootPath + '/assets/'+ sails.config.views.theme +'/images/upload'
      },
      function whenDone(err, uploadedFiles) {
        if (err) {
          sails.log.error(err);
          callback(err, null);
        }else{
          for(var i in uploadedFiles){
            var file = uploadedFiles[i].fd.split('/');
            product.images.push('/images/upload/' + file[9]);
          }
          product.save();
          
          callback(null, product);
        } 
      });
  }
  
}