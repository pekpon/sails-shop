/**
 * PageController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
  show: function(req, res, next) {
    return res.view(sails.config.views.theme + '/page/' + req.param('slug'));
  }
  
};

