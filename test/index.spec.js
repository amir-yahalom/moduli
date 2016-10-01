describe("#moduli - integration test", function () {
    var assert = require('assert'),
        sinon = require('sinon'),
        moduli = require('../index'),
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
        moduli.get("authService");
        assert.equal(authService.getCount(), 1);
        assert.ok(moduli.get("authService") === $app.authService);
        done();
    });

    it("should initialize multiple times 'multiple' class", function (done) {
        var user = moduli.get("User", ["a@a.com", "AaAaAa", "Aa"]);
        var initialCount = user.getCount();
        moduli.get("User");
        moduli.get("User");
        assert.equal(user.getCount(), initialCount + 2);
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