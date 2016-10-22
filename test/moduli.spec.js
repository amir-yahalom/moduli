describe("#moduli - moduli.js", function () {
    var assert = require('assert'),
        sinon = require('sinon'),
        moduli = require('../lib/moduli'),
        baseDir = __dirname,
        moduliConfig = require('../lib/config');

    baseDir = baseDir.substring(0, baseDir.length - "test".length) + "example";

    describe("initInjector()", function () {
        var moduleData = {},
            instance;
        it("should initiate moduli with configuration object", function (done) {
            delete moduliConfig.groups;
            delete moduliConfig.npm;
            delete moduliConfig.node;
            moduli.initInjector(baseDir, {
                "mode": "dummy",
                "modules": {
                    "db": {
                        "module": "/db",
                        "type": "object",
                        "postConstructor": "init"
                    }
                }
            }).then(function () {
                assert.equal(moduliConfig.mode, "dummy");
                assert.deepEqual(moduliConfig.modules, {
                    "db": {
                        "module": "/db",
                        "type": "object",
                        "postConstructor": "init"
                    }
                });
                done();
            }).catch(done);
        });

        it("should initiate moduli with configuration json file", function (done) {
            var config = require("../example/modules.json");
            moduli.initInjector(baseDir, "/modules.json")
                .then(function () {
                    assert.equal(moduliConfig.mode, "tolerant");
                    assert.deepEqual(moduliConfig.modules, config.modules);
                    // verify grouped modules were loaded
                    assert.deepEqual(moduliConfig.modules.User, { module: '/entity/User', type: 'class', initiate: 'multiple' });
                    // verify aliased module 
                    assert.deepEqual(moduliConfig.modules.DummyModule, { module: '/entity/Dummy', type: 'class', initiate: 'multiple' });
                    // verify nested module
                    assert.deepEqual(moduliConfig.modules.NestedModule, { module: '/entity/nested/NestedModule', type: 'class', initiate: 'multiple' });
                    // verify npm module
                    assert.deepEqual(moduliConfig.modules.async, { module: 'npm#async', src: 'npm' });
                    // verify node core module
                    assert.deepEqual(moduliConfig.modules.zlib, { module: 'node#zlib', src: 'node' });
                    done();
                }).catch(done);
        });
    });
    
    describe('get()', function () {
        it("should initialize once singleton class", function (done) {
            var authService = moduli.get("authService");
            moduli.get("authService");
            moduli.get("authService");
            assert.equal(authService.getCount(), 1);
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
    });

    describe('set()', function () {
        it("should register new modules", function (done) {
            var dummyModule = moduli.get("dummyModule");
            assert.ok(!dummyModule);
            moduli.set("dummyModule", {a: "b"});
            dummyModule = moduli.get("dummyModule");
            assert.deepEqual(dummyModule, {a: "b"});
            assert.deepEqual(moduliConfig.modules["dummyModule"], {});
            // set with configurations
            moduli.set("dummyModule", {a: "b"}, {type: "object"});
            assert.deepEqual(moduliConfig.modules["dummyModule"], {type: "object"});
            done();
        });

        it("should set existing modules", function (done) {
            var origAuthService = moduli.get("authService");
            moduli.set("authService", {a: "b"});
            assert.deepEqual(moduli.get("authService"), {a: "b"});
            // set authService back to original
            moduli.set("authService", origAuthService);
            done();
        });
    });

    describe('init()', function () {
        it("should initialize modules", function (done) {
            moduli.init("db", ["dummy-connection-string"]);
            assert.equal(moduli.get("db").connStr, "dummy-connection-string");
            moduli.init("db", ["bbb"]);
            assert.equal(moduli.get("db").connStr, "bbb");
            done();
        });
    });

});