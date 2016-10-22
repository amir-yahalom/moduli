var uuid;

module.exports = {
    init: function ($uuid) {
        uuid = $uuid;
    },
    comparePassword: function (a, b) {
        return a === b;
    },
    createToken: function () {
        return uuid.v1();
    }
};