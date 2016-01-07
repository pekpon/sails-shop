/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var bcrypt = require('bcryptjs');

module.exports = {
  
    tableName: 'users',
    

    uniqueEmail: false,
    types: {
        uniqueEmail: function(value) {
            return uniqueEmail;
        }
    },

    attributes: {
        email: {
            type: 'email',
            required: true,
            unique: true,
            uniqueEmail:true
        },
        password: {
            type: 'string',
            minLength: 6,
            required: true
        },
        sessionID: {type: 'string'},
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
        orders: {
            collection: 'Order',
            via: 'user'
        },
      
        toJSON: function() {
            var obj = this.toObject();
            delete obj.sessionID;
            delete obj.password;
            return obj;
        }
    },
    beforeValidate: function(values, cb) {
        User.findOne({email: values.email}).exec(function (err, record) {
            console.log('before validation ' + !err && !record);
            uniqueEmail = !err && !record;
            cb();
        });
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
    },
    validationMessages: {
        email: {
          required : 'Email is required',
          email : 'Enter valid email',
          uniqueEmail: 'Email already registered'
        }
    }
};