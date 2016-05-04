/*module.exports = {

  getFirst: function (images) {
    var image;
    
    if(images && images.length > 0){
      image = images[0];
    }else{
      image = "https://d1luk0418egahw.cloudfront.net/static/images/guide/NoImage_592x444.jpg"
    }
    
    return image;
  },
  
  getSize: function(image, type){
    var filename = image.split('.');
    var name = filename[0];
    var ext = filename[1];
    var final =  name + "-" + type + "." + ext;
    
    return final;
  },
  
    
  upload: function(req, product, callback){
    var Jimp = require("jimp");
    var rootPath = sails.config.appPath + '/assets/' + sails.config.views.theme;
          
      req.file('imagesUploader').upload({
        dirname: rootPath + '/images/upload'
      },
      function whenDone(err, uploadedFiles) {
        if (err) {
          sails.log.error(err);
          callback(err, null);
        }else{

          async.each(uploadedFiles, function(uploadedFile, callback) {
            var filePath = uploadedFile.fd.split('/');
            var filename = filePath[filePath.length-1].split('.');
            var name = filename[0];
            var ext = filename[1];
            var file = name + "." + ext;
            
            product.images.push('/images/upload/' + file);
            
            //CROP & THUMB            
            Jimp.read(rootPath + '/images/upload/' + file, function (err, img) {
              var imgThumb = img.clone();
              var imgCrop = img.clone();
              
              imgThumb.resize(400, Jimp.AUTO).write(rootPath + '/images/upload/' + name + "-thumb-med." + ext);
              imgThumb.resize(150, Jimp.AUTO).write(rootPath + '/images/upload/' + name + "-thumb-small." + ext);
              imgCrop.cover(400,400).write(rootPath + '/images/upload/' + name + "-crop-med." + ext);
              imgCrop.cover(150,150).write(rootPath + '/images/upload/' + name + "-crop-small." + ext);
              callback();
            });

          }, function(err){
              if( err ) {
                console.log('Image & crop ERROR');
              }
          });
          
          product.save();
          
          callback(null, product);
        } 
      });
  }
  
}*/

var fs = require('fs');

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
  
  getSize: function(image, type){
    var filename = image.split('.');
    var name = filename[0];
    var ext = filename[1];
    var final =  name + "-" + type + "." + ext;
    
    return final;
  },
  
  upload: function(req, product, callback){
    var Jimp = require("jimp");
    var rootPath = sails.config.appPath + '/assets/' + sails.config.views.theme;
          
      req.file('imagesUploader').upload({
        dirname: rootPath + '/images/upload'
      },
      function whenDone(err, uploadedFiles) {
        if (err) {
          sails.log.error(err);
          callback(err, null);
        }else{

          async.each(uploadedFiles, function(uploadedFile, callback) {
            var filePath = uploadedFile.fd.split('/');
            var filename = filePath[filePath.length-1].split('.');
            var name = filename[0];
            var ext = filename[1];
            var file = name + "." + ext;
            
            product.images.push('/images/upload/' + file);
            
            //CROP & THUMB            
            Jimp.read(rootPath + '/images/upload/' + file, function (err, img) {
              var imgThumb = img.clone();
              var imgCrop = img.clone();
              
              var fname1 = rootPath + '/images/upload/' + name + "-thumb-med." + ext;
              imgThumb.resize(400, Jimp.AUTO).write(fname1, function(){
                fs.createReadStream(fname1).pipe(fs.createWriteStream(fname1.replace('/assets/'+sails.config.views.theme+'/', '/.tmp/public/')));
              });
              
              var fname2 = rootPath + '/images/upload/' + name + "-thumb-small." + ext;
              imgThumb.resize(150, Jimp.AUTO).write(fname2, function(){
                fs.createReadStream(fname2).pipe(fs.createWriteStream(fname2.replace('/assets/'+sails.config.views.theme+'/', '/.tmp/public/')));
              });
              
              var fname3 = rootPath + '/images/upload/' + name + "-crop-med." + ext;
              imgCrop.cover(400,400).write(fname3, function(){
                fs.createReadStream(fname3).pipe(fs.createWriteStream(fname3.replace('/assets/'+sails.config.views.theme+'/', '/.tmp/public/')));
              });
              
              var fname4 = rootPath + '/images/upload/' + name + "-crop-small." + ext;
              imgCrop.cover(150,150).write(fname4, function(){
                fs.createReadStream(fname4).pipe(fs.createWriteStream(fname4.replace('/assets/'+sails.config.views.theme+'/', '/.tmp/public/')));
              });
              callback();
            });

          }, function(err){
              if( err ) {
                console.log('Image & crop ERROR');
              }
          });
          
          product.save();
          
          callback(null, product);
        } 
      });
  }
  
}