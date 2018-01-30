/**
 * Created by Gaganjot on 20/01/18.
 */

module.exports = function(constants) {

    var envConstants = {
        defaultPort : 4000,
        API_URL: "localhost:4000/api/v1/motor/",
        mongodbConnection : "mongodb://172.17.0.1/insurance_brokerage", // 192.168.72.24 // 115.249.18.124
        email_config : {
            host     : 'smtp.gmail.com',
            secure   : true,
            port     : 465,
            username : 'offlineinsurance@girnarinsurance.com',
            password : '0ffl1n3G!r@r',
            fromAddress: 'offlineinsurance@girnarinsurance.com'
        }
    };

    return envConstants;
};