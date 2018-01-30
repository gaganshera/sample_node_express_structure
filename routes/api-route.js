/**
 * Created by Gaganjot on 20/01/18.
 */

let Guid = require('guid');
let Utils = require('../lib/common-utils');

module.exports = function (app, router) {

    // app.use(passportLib.authenticationMiddleware);
    app.use(router);
    // router.use(authMiddleware.checkAcl);

    router.use(function (req, res, next) {

        console.log('Request Timestamp:', moment().format());
        req._gibpl_uniqueReqId = Guid.create().value;
        var params = {
            apiName: 'api'
        };
        global.apiName = 'api';
        req._gibpl_apiName = 'api';
        Utils.logApiRequest(req, res, params).then(function(data) {

            req._gibpl_apiLogId = data._id;
            next();
        }, function(err) {

            req._gibpl_apiLogId = 0;
        });
    });

    var enc_dec = require('../app/enc_dec/routes') (app, router);

    router.get('/', function(req, res) {
    //router.get('/', passportLib.authenticationMiddleware(), function(req, res) {

        var error = {
            status: 404,
            body: [{
                "code": "AR0001",
                "message": "Invalid Request",
                "detail": "Invalid Request"
            }]
        };
        Utils.responseWithError(req, res, error);
    });

    router.get('/authenticationError', function (req, res) {

        var error = {
            status: 401,
            body: [{
                "code": "AR0003",
                "message": "Unauthorized request",
                "detail": "Unauthorized request"
            }]
        };
        Utils.responseWithError(req, res, error);
    });

    router.all('*', function (req, res) {

        var error = {
            status: 404,
            body: [{
                "code": "AR0002",
                "message": "Invalid Request",
                "detail": "Invalid Request"
            }]
        };
        Utils.responseWithError(req, res, error);
    });
};