var moduli = require('../index');

moduli.initInjector(__dirname, "/modules.json")
    .then(function () {
        // initialize base dependencies
        moduli.init("db", ["dummy-connection-string"]);
        // start application
        moduli.init("app");
    });