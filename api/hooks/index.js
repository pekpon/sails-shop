module.exports = function(sails) {

  return {
    configure: function() {
      sails.config.paths.views = sails.config.paths.views + "/" + sails.config.views.theme;
    }
  }
  
};