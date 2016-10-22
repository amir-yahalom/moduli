var getParamsNames = require('get-parameter-names'),
    _ = require('underscore'),
    Q = require('q'),
    utils = require('./utils'),
    config = require('./config'),
    instances = {},
    basePath = "";

module.exports = {
    initInjector: initInjector,
    set: set,
    get: get,
    init: init
};

/**
 *
 * @param projectBasePath (string) is the absolute path of the project (if called from project root -> __dirname)
 * @param modulesConfig (object || string) is configurations from moduli (string if you want to load configurations from file)
 *
 */
function initInjector(projectBasePath, modulesConfig) {
    basePath = projectBasePath || __dirname.replace("/node_modules/moduli/lib", "");
    var userConfig;
    if (typeof modulesConfig === "string") {
        userConfig = _require(modulesConfig);
    } else {
        userConfig = modulesConfig || {};
    }
    _.extend(config, userConfig);
    config.modules = config.modules || {};
    config.npm && _resolveNpmDependencies();
    config.node && _resolveNodeCoreModules();
    return _processGroups();
}

/**
 * returns the desired module
 * the module will be initiated on demand
 * @param sName is the name of the desired module (as defined in the modules configurations)
 * @param aArgs is array of the arguments for the constructor / init function
 * @returns {*}
 */
function get(sName, aArgs) {
    if (sName in config.modules) {
        var moduleData = config.modules[sName];
        if (!(sName in instances) || moduleData.initiate === "multiple") {
            init(sName, aArgs);
        }
        return instances[sName];
    }
}

/**
 * set module instance (useful for tests)
 * @param sName is the name of the desired module (as defined in the modules configurations)
 * @param oInstance is the desired instance, note that it should be instantiated already
 * @param oModuleData is the configuration for the specified module
 */
function set(sName, oInstance, oModuleData) {
    if (!(sName in config.modules)) {
        config.modules[sName] = {};
    }
    if (oModuleData) {
        _.extend(config.modules[sName], oModuleData);
    }
    instances[sName] = oInstance;
}

/**
 * initialize single module
 * @param sName is the name of the desired module (as defined in the modules configurations)
 * @param aArgs [] - array of the arguments for the constructor / init function
 */
function init(sName, aArgs) {
    if (sName in config.modules) {
        var moduleData = config.modules[sName] || {};
        moduleData.lock = true;
        var Module;
        if (moduleData.src === "npm" || moduleData.src === "node") {
            Module = require(sName);            
        } else {
            Module = _require(moduleData.module);
            if (Module["@moduli"]) { // add inline configuration
                var inlineConfig = Module["@moduli"];
                _.extend(moduleData, inlineConfig);
            }
        }
        if (moduleData.extends) {
            moduleData.extends.forEach(function (sParentGroup) {
                config.groups[sParentGroup] && _.extend(moduleData, config.groups[sParentGroup].data);
            });
        }
        aArgs = aArgs || [];
        _prapareArgs(Module, moduleData, aArgs, sName);
        instances[sName] = utils.createInstance(Module, moduleData, aArgs);
        var instance = instances[sName] || {};
        if (moduleData.postConstructor && typeof instance[moduleData.postConstructor] === "function") {
            var fnPostConstructor = instance[moduleData.postConstructor];
            _prapareArgs(fnPostConstructor, moduleData, aArgs, sName);
            fnPostConstructor.apply(instance, aArgs);
        }
        moduleData.lock = false;
    }
}

// Private Functions

function _require(sPath) {
    return require(basePath + sPath);
}

function _resolveNpmDependencies() {
    var packageJson;
    try {
        packageJson = _require("/package.json");
    } catch (err) {
        console.error(err);
        throw new Error("Failed to load package.json");
    }
    if (packageJson.dependencies) {
        for (var moduleName in packageJson.dependencies) {
            if (!config.modules[moduleName]) { // local module overrides npm module
                config.modules[moduleName] = config.npm[moduleName] || {};
                config.modules[moduleName].src = "npm";
                config.modules[moduleName].module = "npm#" + moduleName;
            }
        }
    }
}

function _resolveNodeCoreModules() {
    (require('repl')._builtinLibs || []).forEach(function (moduleName) {
        if (!config.modules[moduleName]) { // local module overrides node modules
            config.modules[moduleName] = config.node[moduleName] || {};
            config.modules[moduleName].src = "node";
            config.modules[moduleName].module = "node#" + moduleName;
        }
    });
}

function _processGroups() {
    var groups = Object.keys(config.groups || {});
    if (groups.length > 0) {
        var promises = groups.map(function (groupName) {
            var group = config.groups[groupName];
            group.data = group.data || {};
            if (group.extends) {
                group.extends.forEach(function (sParentGroup) {
                    config.groups[sParentGroup] && _.extend(group.data, config.groups[sParentGroup].data);
                });
            }
            return utils.getGroupModules(basePath, group);
        });
        return Q.all(promises)
            .then(function (results) {
                (results || []).forEach(function (groupModules) {
                    _.extend(config.modules, groupModules);
                });
            });
    }
    return Q.resolve();
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