function App() {
}

App.prototype.start = function (authService, userService) {
    this.authService = authService;
    this.userService = userService;
};

App.prototype.login = function (data) {
    return this.authService.authenticate(data)
        .then(function (token) {
            return token
        });
};

App.prototype.register = function (data) {
    return this.userService.addUser(data)
        .then(this.authService.authenticate.bind(this.authService))
        .then(function (token) {
            return token
        });
};

App.prototype.getUser = function (email) {
    return this.userService.getUser(email);
};

module.exports = new App();

module.exports["@moduli"] = {
    "postConstructor": "start"
};
