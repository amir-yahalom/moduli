var uuid = require('uuid');

module.exports = {
    comparePassword: function (a, b) {
        return a === b;
    },
    createToken: function () {
        return uuid.v1();
    }
};