var count = 0;

function AuthService(secret, $db, $utils, $userService) {
    this.secret = secret;
    this.db = $db;
    this.utils = $utils;
    this.userService = $userService;
    count++;
}

AuthService.prototype.authenticate = function (data) {
    data = data || {};
    return this.userService.getUser(data.email)
        .then(function (user) {
            if (this.utils.comparePassword(user.password, data.password)) {
                var token = this.utils.createToken();
                return this.saveToken(user, token);
            }
        }.bind(this));
};

AuthService.prototype.saveToken = function (user, token) {
    return this.db.setObj("tokens", (user || {}).email, token);
};

AuthService.prototype.isLoggedIn = function (user, token) {
    this.db.getObj("tokens", (user || {}).email)
        .then(function (tokenFromDb) {
            return !!tokenFromDb && tokenFromDb === token;
        });
};

AuthService.prototype.getCount = function () {
    return count;
};

module.exports = AuthService;