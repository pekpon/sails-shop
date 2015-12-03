/**
 * SettingsController
 *
 * @description :: Server-side logic for managing settings
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  
  index: function(req, res) {
      return res.view('admin/settings/index',{
        layout:'layouts/dashboardLayout'
      });
    },
  
  add: function(req, res) {
      return res.view('admin/settings/add',{
        layout:'layouts/dashboardLayout',
        settings: {}
      });
    }
	
};

