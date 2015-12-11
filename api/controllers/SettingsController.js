/**
 * SettingsController
 *
 * @description :: Server-side logic for managing settings
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  
  indexAdmin: function(req, res) {
      Settings.find(function(err, settings){
        
        //Check default values
        var defaultValues = ["analytics_code", "shipping"];
        
        for(var i in settings){
          switch(settings[i].key){
              case "analytics_code" :  defaultValues = _.without(defaultValues, "analytics_code"); break;
              case "shipping" :  defaultValues = _.without(defaultValues, "shipping"); break;
              case "default" : break;
          }
        }
        
        return res.view('admin/settings/index',{
          layout:'layouts/dashboardLayout',
          settings: settings,
          defaultValues: defaultValues
        });
      });
    },
  
  addAdmin: function(req, res) {
      return res.view('admin/settings/add',{
        layout:'layouts/dashboardLayout',
        settings: {key: req.param('key')}
      });
    },
  
  editAdmin: function(req, res) {
    Settings.findOne(req.param('id'), function(err, settings){
      return res.view('admin/settings/edit',{
        layout:'layouts/dashboardLayout',
        settings: settings
      });
    });
  },
	
};

