/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var bcrypt = require('bcryptjs');

module.exports = {
  
    tableName: 'users',
  
    attributes: {
        email: {
            type: 'email',
            required: true,
            unique: true
        },
        password: {
            type: 'string',
            minLength: 6,
            required: true
        },
      
        name: { type: 'string'},
        surname: { type: 'string'},
        address: { type: 'string'},
        city: { type: 'string'},
        cp: { type: 'string'},
        province: { type: 'string'},
        phone: { type: 'string'},
        country: { type: 'string'},
        is_admin : {
            type : "boolean",
            defaultsTo : false
        },
      
        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        }
    },
    beforeCreate: function(user, cb) {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    console.log(err);
                    cb(err);
                } else {
                    user.password = hash;
                    cb();
                }
            });
        });
    }
};