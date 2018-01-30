/**
 * Created by Gaganjot on 20/01/18.
 */

let _ = require('underscore');

module.exports = function() {
	
	if(!process.env.NODE_ENV || typeof process.env.NODE_ENV === 'undefined') {
        process.env.NODE_ENV = "development";
    }
    var constants = {
        baseApiUrl : '/api/v1/',
        timeZone: 'Asia/Calcutta',
        TIMEZONE: 'Asia/Calcutta',
        TIMEZONE_UTC: 'UTC',
        DATE_FORMAT: 'YYYY-MM-DD',
        DATE_TIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    };

    var envConstants = {};
    switch (process.env.NODE_ENV) {

        case 'development' :
            envConstants = require('./development.constants') (constants);
            break;

        case 'staging' :
            envConstants = require('./staging.constants') (constants);
            break;

        case 'production' :
            envConstants = require('./production.constants') (constants);
            break;

        case 'uat' :
            envConstants = require('./uat.constants') (constants);
            break;

        case 'test' :
            envConstants = require('./unittest.constants') (constants);
            break;

        case 'staging1' :
            envConstants = require('./staging1.constants') (constants);
            break;

        case 'hdfc_staging' :
            envConstants = require('./hdfc_staging.constants') (constants);
            break;

        case 'hdfc_production' :
            envConstants = require('./hdfc_production.constants') (constants);
            break;

        case 'default' :
            envConstants = {};
            break;
    }

    return _.extend(constants, envConstants);
};