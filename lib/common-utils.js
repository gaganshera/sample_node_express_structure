/**
 * Created by Gaganjot on 20/01/18.
 */

var Q = require('q');
var util = require('util');
var request = require('request');
var path = require('path');

/**
 * Typecast from string to Float
 * @param str
 * @returns Float Value || 0
 */
String.prototype.parseFloat = function() {

    return !isNaN(this.toString()) && this.toString() != '' ? parseFloat(this.toString()) : 0;
};
Number.prototype.parseFloat = function() {

    return !isNaN(this.toString()) && this.toString() != '' ? parseFloat(this.toString()) : 0;
};

String.prototype.capitalize = function(){

    return (this.toString()).replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

module.exports = {

	logApiRequest: function(req, res, params) {

        var deferred = Q.defer();
        var ApiLogController = require('../app/common/controllers/ApiLogController');
        ApiLogController.create(req, res, params).then(function(data) {

            deferred.resolve(data);
        }, function(err) {

            deferred.reject(err);
        });

        return deferred.promise;
    },

    logApiResponse: function(req, res, params) {

        var deferred = Q.defer();
        var ApiLogController = require('../app/common/controllers/ApiLogController');
        ApiLogController.update(req, res, params).then(function(data) {

            deferred.resolve(data);
        }, function(err) {

            deferred.reject(err);
        });

        return deferred.promise;
    },

    responseWithError: function(req, res, error) {

        var isErrorFormatOk = true;
        if(_.isObject(error)) {

            if(this.isEmpty(error.status) || this.isEmpty(error.body)) {
                isErrorFormatOk = false;
            } else {

                for(var i in error.body) {

                    var obj = error.body[i];
                    if(!_.isObject(obj) || (!_.has(obj, 'code') || !_.has(obj, 'message') || !_.has(obj, 'detail'))) {

                        isErrorFormatOk = false;
                        break;
                    }
                }
            }
        } else {

            isErrorFormatOk = false;
        }
        if(!isErrorFormatOk) {
            cl(error, __line, __file);
            if(this.isset(req._gibpl_elk_api_log)) {
                req._gibpl_elk_api_log.response_data_raw = _.isString(error) ? error : JSON.stringify(error);
                req._gibpl_elk_api_log.level = 5;
            }
            //TODO - Log the error before modifying
            error = {
                status: 500,
                body: [{
                    code: 500,
                    message: 'Some error occurred',
                    detail: 'Some error occurred'
                }]
            };
        } else {
            if(this.isset(req._gibpl_elk_api_log)) {
                req._gibpl_elk_api_log.level = 3;
                req._gibpl_elk_api_log.response_data_raw = JSON.stringify(error);
            }
        }

        var response = {
            response: error,
            responseTime: moment().format(),
            apiName: req._gibpl_apiName
        };
        this.logApiResponse(req, res, response).then(function(data) { }, function(err) { });

        if(this.isset(req._gibpl_elk_api_log)) {
            req._gibpl_elk_api_log.status_code = response.response.body[0].code;
            req._gibpl_elk_api_log.http_code = response.response.status;
            req._gibpl_elk_api_log.response_data = this.convertToElkErrorParams(response.response);
            let WinstonLogUtils = require('./winston-log-utils');
            WinstonLogUtils.logWinstonApiRequest(req, res, C.winstonLogMessages.apiLog.error);
        }

        console.log('Response Timestamp:', moment().format());
        res.status(error.status).send({errors: error.body});
    },

    responseWithSuccess: function(req, res, data) {

        var response = {
            response: {status: 200, body: {data: data}},
            responseTime: moment().format(),
            apiName: req._gibpl_apiName
        };
        this.logApiResponse(req, res, response).then(function(data) {
            //TODO
        }, function() {
            //TODO
        });

        if(this.isset(req._gibpl_elk_api_log)) {
            req._gibpl_elk_api_log.response_data_raw = JSON.stringify(response.response.body);
            req._gibpl_elk_api_log.level = 0;
            req._gibpl_elk_api_log.status_code = '';
            req._gibpl_elk_api_log.http_code = response.response.status;
            let WinstonLogUtils = require('./winston-log-utils');
            WinstonLogUtils.logWinstonApiRequest(req, res, C.winstonLogMessages.apiLog.success);
        }

        console.log('Response Timestamp:', moment().format());
        res.status(200).send({data: data});
    },

    /**
     * returns true if data is '' or null or undefined
     * for object, checks if it's length is non zero or not
     * @param data {Mixed}
     * @param zeroIsNotEmpty {boolean}: pass true only if you want 0 to be considered as non-empty
     * @returns {boolean}
     */
    isEmpty: function(data, zeroIsNotEmpty) {
        if(typeof data !== 'object' && (data === null || data === '' || typeof data === 'undefined')) {
            return true;
        } else if(data === null) {
            return true;
        } else if(typeof data === 'string' && data === '0' && !zeroIsNotEmpty) {
            return true;
        } else if(typeof data.length !== 'undefined') {
            if(data.length > 0) {
                return false;
            } else {
                return true;
            }
        } else {
            if(Object.keys(data).length > 0) {
                return false;
            } else if(typeof data === 'number' && (data !== 0 || zeroIsNotEmpty)) {
                return false;
            } else {
                if(data === true) {
                    return false
                }
                return true;
            }
        }
    },

    /**
     * checks if a data's type is undefined or not
     * @param data
     * @returns {boolean}
     */
    isset: function(data) {
        return typeof data !== 'undefined';
    },

    /**
     * checks if a data's type is undefined or not, works nested too
     * @param obj
     * @returns {boolean}
     */
    issetNested: function(obj /*, level1, level2, ... levelN*/) {
        var args = Array.prototype.slice.call(arguments, 1);

        for (var i = 0; i < args.length; i++) {
            if (!obj || !this.isset(obj[args[i]])) {
                return false;
            }
            obj = obj[args[i]];
        }
        return true;
    },
};