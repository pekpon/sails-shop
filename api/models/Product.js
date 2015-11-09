/**
* Product.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName: 'products',

  attributes: {
  
    name : { type: 'string'},
    description : { type: 'string'},
    slug : { type: 'string'},
    images: { type: 'array'}
  
  }
  
};

