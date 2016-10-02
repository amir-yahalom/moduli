describe("#moduli - integration test", function () {
    var assert = require('assert'),
        sinon = require('sinon'),
        moduli = require('../index'),
        moduliConfig = require('../lib/config'),
        baseDir = __dirname,
        $app;

    baseDir = baseDir.substring(0, baseDir.length - "test".length) + "example";
    
    moduli.initInjector(baseDir, "/modules.json");

    // initialize base dependencies
    moduli.init("db", ["dummy-connection-string"]);

    // start application
    $app = moduli.get("app");
    
    it("should initialize the app as expected", function (done) {
        assert.ok($app);
        assert.ok($app.authService);
        assert.ok($app.userService);
        done();
    });

    it("should initialize once singleton class", function (done) {
        var authService = moduli.get("authService");
        moduli.get("authService");
        assert.equal(authService.getCount(), 1);
        assert.ok(moduli.get("authService") === $app.authService);
        done();
    });

    it("should initialize modules on the fly (from within app component)", function (done) {
        var userService = moduli.get("userService");
        var user = userService.createUserEntity({email: "b@b.com", password: "BbBbBb", name: "Bb"});
        assert.equal(user.getFormattedName(), "Bb <b@b.com>");
        done();
    });

    it("should bind app components", function (done) {
        // testing app logic to verify all modules are connected properly
        $app.login({email: "a@a.com", password: "a@a.com"})
            .then(function (token) {
                assert.ok(token);
                return $app.login({email: "a@a.com", password: "xxx"});
            }, function () {
                done("should't get here..");
            }).then(function (res) {
                assert.ok(!res);
                return $app.login({email: "xxx", password: "a@a.com"})
            }, function () {
                done("should't get here..");
            }).then(function () {
                done("should't get here..");
            }, function () {
                done();
            });
    });
});