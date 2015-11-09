module.exports = {

  getFirst: function (images) {
    var image;
    
    if(images && images.length > 0){
      image = images[0];
    }else{
      image = "https://d1luk0418egahw.cloudfront.net/static/images/guide/NoImage_592x444.jpg"
    }
    
    return image;
  }
  
}