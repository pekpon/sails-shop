/**
 * SettingsController
 *
 * @description :: Server-side logic for managing settings
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  
  indexAdmin: function(req, res) {
      Settings.find(function(err, settings){
        return res.view('admin/settings/index',{
          layout:'layouts/dashboardLayout',
          settings: settings
        });
      });
    },
  
  addAdmin: function(req, res) {
      return res.view('admin/settings/add',{
        layout:'layouts/dashboardLayout',
        settings: {}
      });
    }
	
};

