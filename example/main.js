var moduli = require('../index');

moduli.initInjector(__dirname, "/modules.json");

// initialize base dependencies
moduli.init("db", ["dummy-connection-string"]);

// start application
moduli.init("app");