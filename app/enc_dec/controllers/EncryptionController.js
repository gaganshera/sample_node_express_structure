/**
 * Created by Gaganjot on 20/01/18.
 */

var Q = require('q');
var UserModel = require('../models/UserModel');
// var UserValidator = require('../validation/UserValidation');
let Utils = require('../../../lib/common-utils');

module.exports = {

    encrypt: function (req, res) {

        let deferred = Q.defer();
        
        deferred.resolve({success: true, message: 'Successful.'});

        return deferred.promise;
    },

};