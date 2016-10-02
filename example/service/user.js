var moduli = require('../../index');
var count = 0;

function UserService($db) {
    this.db = $db;
    count++;
}

UserService.prototype.addUser = function (data) {
    data = data || {};
    return this.db.setObj("users", data.email, data);
};

UserService.prototype.getUser = function (email) {
    return this.db.getObj("users", email);
};

UserService.prototype.getCount = function () {
    return count;
};

// creating objects on the fly
UserService.prototype.createUserEntity = function (data) {
    return moduli.get("User", [data.email, data.password, data.name]);
};

module.exports = UserService;