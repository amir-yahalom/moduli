describe("#moduli - utils.js", function () {
    var assert = require('assert'),
        sinon = require('sinon'),
        utils = require('../lib/utils');

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

    function DummyClass() {
        this.args = Array.prototype.slice.call(arguments);
    }
});