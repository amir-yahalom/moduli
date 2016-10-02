// moduli can be used instead of manually resolve project dependencies
// for example, look at the injections of authService and userService in App.prototype.start()
// it comes to replace to following manual instantiation:
// var UserService = require('./service/user');
// ...
// var userService = new UserService();

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

// you can add inline configurations under "@moduli"
module.exports["@moduli"] = {
    "postConstructor": "start"
};
