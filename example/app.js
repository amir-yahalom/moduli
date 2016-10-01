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

// var moduli = require('moduli');
//
// moduli.initInjector(__dirname, "/modules.json");
//
// moduli.init("db", ["dummy-connection-string"]);
//
// // create from singleton class
// authService = moduli.get("authService");
// console.log("authService count:", authService.getCount()); // 1
// moduli.get("authService");
// console.log("authService count:", authService.getCount()); // 1
//
// // create from multiple-instances class
// userAdapter = moduli.get("userAdapter");
// console.log("userAdapter count:", userAdapter.getCount()); // 1
// moduli.get("userAdapter");
// moduli.get("userAdapter");
// moduli.get("userAdapter");
// console.log("userAdapter count:", userAdapter.getCount()); // 4
//
// var db = moduli.get("db");
// console.log("db.connStr", db.connStr);
//
// authService.authenticate({email: "a@a.com", password: "a@a.com"})
//     .then(function () {
//         console.log("hooo haaa");
//         return authService.authenticate({email: "a@a.com", password: "xxx"});
//     }).then(function (res) {
//         console.log("res=", res);
//         return authService.authenticate({email: "xxx", password: "a@a.com"})
//     }).then(function () {
//         console.log("not good");
//     }, function () {
//         console.log("hooo haaa");
//     });
//
//
//
//
