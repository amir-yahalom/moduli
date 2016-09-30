var util = require('util');

function createInstance(Module, moduleData, aArgs) {
    if (moduleData.type === "class") {
        var Wrapper = createWrapperClass(Module);
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
function createWrapperClass(Module) {
    function Wrapper(args) {
        Module.apply(this, args);
    }
    util.inherits(Wrapper, Module);
    return Wrapper;
}

module.exports = {
    createInstance: createInstance,
    createWrapperClass: createWrapperClass
};