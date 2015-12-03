/**
 * SettingsController
 *
 * @description :: Server-side logic for managing settings
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  
  indexAdmin: function(req, res) {
      return res.view('admin/settings/index',{
        layout:'layouts/dashboardLayout'
      });
    },
  
  addAdmin: function(req, res) {
      return res.view('admin/settings/add',{
        layout:'layouts/dashboardLayout',
        settings: {}
      });
    }
	
};

