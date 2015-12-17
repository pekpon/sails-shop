/**
 * PageController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
  show: function(req, res, next) {
    return res.view('page/' + req.param('slug'));
  }
  
};

