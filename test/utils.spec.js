describe("#moduli - utils.js", function () {
    var assert = require('assert'),
        sinon = require('sinon'),
        utils = require('../lib/utils'),
        baseDir = __dirname;

    baseDir = baseDir.substring(0, baseDir.length - "test".length) + "example";

    describe("createInstance()", function () {
        var moduleData = {},
            instance;
        it("should create instance according to the given type", function (done) {
            moduleData.type = "class";
            instance = utils.createInstance(DummyClass, moduleData, ["a", "b", "c"]);
            assert.deepEqual(instance.args, ["a", "b", "c"]);
            moduleData.type = "object";
            instance = utils.createInstance({"a": "b"}, moduleData, ["a", "b", "c"]);
            assert.deepEqual(instance, {"a": "b"});
            moduleData.type = "function";
            var module = {fn: function () {return {"c": "d"};}};
            instance = utils.createInstance(module.fn, moduleData, ["a", "b", "c"]);
            assert.deepEqual(instance, {"c": "d"});
            done();
        });
    });

    describe("_createWrapperClass()", function () {
        var instance;
        it("should wrap the given class", function (done) {
            var WrapperClass = utils._createWrapperClass(DummyClass);
            assert.ok(typeof WrapperClass === "function");
            instance = new WrapperClass([1, 2, 3]);
            assert.deepEqual(instance.args, [1, 2, 3]);
            done();
        });
        it("should throw exception for wrong input", function (done) {
            assert.throws(function () {utils._createWrapperClass()}, Error);
            assert.throws(function () {utils._createWrapperClass(null)}, Error);
            assert.throws(function () {utils._createWrapperClass({})}, Error);
            done();
        });
    });

    describe("getInjectedName()", function () {
        it("should return name without '$'", function (done) {
            var name = utils.getInjectedName("$xxx");
            assert.equal(name, "xxx");
            done();
        });
        it("should return name of injected param", function (done) {
            var name = utils.getInjectedName("xxx", {injections: {xxx: "bbb"}});
            assert.equal(name, "bbb");
            name = utils.getInjectedName("xxx", {injections: {}});
            assert.ok(!name);
            done();
        });
    });

    describe("getGroupModules()", function () {
        var group = {
            "dir": "/entity",
            "ignore": ["IgnoredModule.js"],
            "alias": {
                "Dummy": "DummyModule"
            },
            "data": {
                "type": "class",
                "initiate": "multiple"
            }
        };
        it("should return all modules in group", function (done) {
            utils.getGroupModules(baseDir, group)
                .then(function (modules) {
                    assert.equal(Object.keys(modules).length, 3);
                    assert.deepEqual(modules["User"], { module: '/entity/User', type: 'class', initiate: 'multiple' });
                    assert.deepEqual(modules["DummyModule"], { module: '/entity/Dummy', type: 'class', initiate: 'multiple' });
                    assert.deepEqual(modules["NestedModule"], { module: '/entity/nested/NestedModule', type: 'class', initiate: 'multiple' });
                    done();
                }).catch(done);
        });
    });

    function DummyClass() {
        this.args = Array.prototype.slice.call(arguments);
    }
});