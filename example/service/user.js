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

module.exports = UserService;