var util = require('util'),
    getParamsNames = require('get-parameter-names'),
    config,
    modules = {},
    instances = {},
    basePath = "";

/**
 * returns the desired module
 * the module will be initiated on demand
 * @param name
 * @param args
 * @returns {*}
 */
function get(name, args) {
    if (name in modules) {
        var moduleData = modules[name];
        var isMultipleInstance = (moduleData.type === "class" && moduleData.initiate === "multiple");
        if (!(name in instances) || isMultipleInstance) {
            init(name, args);
        }
        return instances[name];
    }
}

/**
 * set module instance (useful for tests)
 * @param name
 * @param instance
 */
function set(name, instance) {
    instances[name] = instance;
}

/**
 * initialize single module
 * @param sName
 * @param aArgs [] - array of the arguments for the constructor / init function
 */
function init(sName, aArgs) {
    if (sName in modules) {
        var moduleData = modules[sName] || {};
        moduleData.lock = true;
        var Module = _require(moduleData.module);
        if (Module["@moduli"]) {
            var inlineConfig = Module["@moduli"];
            for (var prop in inlineConfig) {
                moduleData[prop] = inlineConfig[prop];
            }
        }
        aArgs = aArgs || [];
        _prapareArgs(Module, moduleData, aArgs, sName);
        var instance = instances[sName] = _createInstance(Module, moduleData, aArgs) || {};
        if (moduleData.postConstructor && typeof instance[moduleData.postConstructor] === "function") {
            var fnPostConstructor = instance[moduleData.postConstructor];
            _prapareArgs(fnPostConstructor, moduleData, aArgs, sName);
            fnPostConstructor.apply(instance, aArgs);
        }
        moduleData.lock = false;
    }
}

module.exports = {
    initInjector: function (projectBasePath, opts) {
        basePath = projectBasePath || __dirname.replace("/node_modules/moduli/lib", "");
        if (typeof opts === "string") {
            config = _require(opts);
        } else {
            config = opts;
        }
        config = config || {};
        modules = config.modules || {};
    },
    set: set,
    get: get,
    init: init
};

function _require(sPath) {
    return require(basePath + sPath);
}

function _prapareArgs(fnInit, moduleData, aArgs, sName) {
    if (typeof fnInit === "function") {
        var params = getParamsNames(fnInit) || [];
        params.forEach(function (param, i) {
            var injected,
                injectedName;
            if (param.charAt(0) === "$") {
                injectedName = param = param.substr(1);
            }
            if (moduleData.injections && param in moduleData.injections) {
                injectedName = moduleData.injections[param];
            }
            if (injectedName && modules[injectedName]) {
                if (modules[injectedName].lock) { // desired module is already during init process
                    var msg = "Circular reference error: failed to initiate param['"
                        + injectedName + "'] for module['" + sName + "']";
                    if (config.mode !== "tolerant") {
                        throw new Error(msg);
                    }
                } else {
                    injected = get(injectedName);
                }
            }
            if (injected) {
                aArgs[i] = injected;
            }
        });
    }
}

function _createInstance(Module, moduleData, aArgs) {
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
