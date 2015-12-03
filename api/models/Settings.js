/**
* Settings.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName: 'settings',
  attributes: {
    
    key: {type:'string'},
    value: {type: 'string'}

  }
};

