var getParamsNames = require('get-parameter-names'),
    _ = require('underscore'),
    utils = require('./utils'),
    config = require('./config'),
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
    if (name in config.modules) {
        var moduleData = config.modules[name];
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
    if (sName in config.modules) {
        var moduleData = config.modules[sName] || {};
        moduleData.lock = true;
        var Module = _require(moduleData.module);
        if (Module["@moduli"]) { // add inline configuration
            var inlineConfig = Module["@moduli"];
            _.extend(moduleData, inlineConfig);
        }
        aArgs = aArgs || [];
        _prapareArgs(Module, moduleData, aArgs, sName);
        var instance = instances[sName] = utils.createInstance(Module, moduleData, aArgs) || {};
        if (moduleData.postConstructor && typeof instance[moduleData.postConstructor] === "function") {
            var fnPostConstructor = instance[moduleData.postConstructor];
            _prapareArgs(fnPostConstructor, moduleData, aArgs, sName);
            fnPostConstructor.apply(instance, aArgs);
        }
        moduleData.lock = false;
    }
}

module.exports = {
    /**
     *
     * @param projectBasePath (string) is the absolute path of the project (if called from project root -> __dirname)
     * @param opts (object || string) is configurations from moduli (string if you want to load configurations from file)
     *
     */
    initInjector: function (projectBasePath, opts) {
        basePath = projectBasePath || __dirname.replace("/node_modules/moduli/lib", "");
        var userConfig;
        if (typeof opts === "string") {
            userConfig = _require(opts);
        } else {
            userConfig = opts || {};
        }
        _.extend(config, userConfig);
        config.modules = config.modules || {};
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
            var injectedName = utils.getInjectedName(param, moduleData);
            if (injectedName) {
                var injected = _handleInjectedArg(sName, injectedName);
                if (injected) {
                    aArgs[i] = injected;
                }
            }
        });
    }
}

function _handleInjectedArg(currentModuleName, injectedName) {
    if (!(injectedName in config.modules)) {
        return null;
    }
    if (config.modules[injectedName].lock) { // desired module is already during init process
        var msg = "Circular reference error: failed to initiate param['"
            + injectedName + "'] for module['" + currentModuleName + "']";
        if (config.mode !== "tolerant") {
            throw new Error(msg);
        }
    } else {
        return get(injectedName);
    }
}