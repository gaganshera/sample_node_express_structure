/**
 * Created by Gaganjot on 20/01/18.
 */

let Utils = require('../../lib/common-utils');

module.exports = function (app, router) {

cl(C.baseApiUrl)
	router.get(C.baseApiUrl + 'encrypt', function(req, res) {

        let encryptionController = require('./controllers/EncryptionController');

        encryptionController.encrypt(req, res).then(function(response) {

            Utils.responseWithSuccess(req, res, response);
        }, function(err) {

            Utils.responseWithError(req, res, err);
        });
    });
};