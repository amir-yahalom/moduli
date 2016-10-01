var util = require('util');

module.exports = {
    createInstance: createInstance,
    _createWrapperClass: _createWrapperClass
};

/**
 * return instance of the given module
 * 
 * @param Module
 * @param moduleData
 * @param aArgs
 * @returns {*}
 */
function createInstance(Module, moduleData, aArgs) {
    if (moduleData.type === "class") {
        var Wrapper = _createWrapperClass(Module);
        return new Wrapper(aArgs);
    } else if (moduleData.type === "function") {
        return Module.apply({}, aArgs);
    } else {
        return Module;
    }
}

/**
 * wraps the given class in order to apply() it with the given arguments
 * @param Module
 * @returns {Wrapper}
 */
function _createWrapperClass(Module) {
    function Wrapper(args) {
        Module.apply(this, args);
    }
    util.inherits(Wrapper, Module);
    return Wrapper;
}