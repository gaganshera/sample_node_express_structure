/**
 * Created by Gaganjot on 20/01/18.
 */

let mongoose = require('mongoose');

let UserModelSchema = new mongoose.Schema(
    {
        userId: { type: Number, index: { unique: true }},
        username: { type: String, index: { unique: true }, required: true},
        // password: {type: String, required: true},
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        token: String,
        tokenExpirationIn: { type: Number, default: 1800 },  // in seconds
        tokenCreatedAt: {type: Date},
        roleKey: String,
        sourceId: String,
        subSourceId: String,
        status: {type: Boolean, default: true},
        googleTokenInfo: mongoose.Schema.Types.Mixed,
        createdAt: {type: Date},
        updatedAt: {type: Date, default: Date.now},
        updatedBy: String
    },
    {
        collection: 'users'
    }
);

// Saves the user's password hashed (plain text password storage is not good)
/*
UserModelSchema.pre('save', function (next) {

    let user = this;
    if (user.isModified('password') || this.isNew) {
        bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});
*/

// Saves the userid auto-incremented
UserModelSchema.pre('save', function (next) {

    let user = this;
    config.findOneAndUpdate({configName: 'userIdCounter'}, {$inc: { configValue: 1 }}, function(error, counter) {

        if(error) {
            return next(error);
        }
        user.userId = counter.configValue;
        next();
    });
});

//middleware for findByIdAndUpdate also
UserModelSchema.pre('findOneAndUpdate', function (next) {

    let updateParams = this._update;
    next();
});

UserModelSchema.post('save', function (next) {

    let user = this;
    acl.addUserRoles(user.userId, user.roleKey);
});

// Create method to compare password input to password saved in database
UserModelSchema.methods.comparePassword = function(pw, cb) {
    bcrypt.compare(pw, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('UserModel', UserModelSchema);
