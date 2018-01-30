/**
 * Created by saurabh on 2/1/17.
 */

var mongoose = require('mongoose');

var ApiLogModelSchema = new mongoose.Schema(
    {
        apiName: String,
        requestUrl: String,
        getRequestParams: mongoose.Schema.Types.Mixed,
        postRequestParams: mongoose.Schema.Types.Mixed,
        requestHeaders: mongoose.Schema.Types.Mixed,
        response: mongoose.Schema.Types.Mixed,
        requestTime: {type: Date},
        responseTime: {type: Date},
        sourceId: String,
        subSourceId: String,
        createdAt: {type: Date},
        updatedAt: {type: Date, default: Date.now}
    },
    {
        collection: 'api_log'
    }
);

module.exports = mongoose.model('ApiLogModel', ApiLogModelSchema);
