/**
 * Created by saurabh on 3/1/17.
 */

var ApiLogModel = require('../models/ApiLogModel');
var Q = require('q');
var moment = require('moment-timezone');
moment.tz.setDefault(C.timeZone);

module.exports = {

    create: function(req, res, params) {

        var deferred = Q.defer();
        var apiLog = new ApiLogModel({

            apiName: params.apiName,
            requestUrl: req.protocol + "://" + req.get('host') + req.path,
            getRequestParams: req.query,
            postRequestParams: req.body,
            requestHeaders: req.headers,
            response: '',
            requestTime: moment().toDate(),
            sourceId: req.query.source,
            subSourceId: req.query.subSource
        });

        apiLog.save(function (err, logData) {
            if (err) {
                deferred.reject(err);
            }
            deferred.resolve(logData);
        });

        return deferred.promise;
    },

    update: function(req, res, params) {

        var deferred = Q.defer();

        ApiLogModel.findByIdAndUpdate(req._gibpl_apiLogId, params, function(err, logData) {

            if (err) {
                deferred.reject(err);
            }
            deferred.resolve(logData);
        });

        return deferred.promise;
    }
};
