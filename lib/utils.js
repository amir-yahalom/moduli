var util = require('util'),
    fs = require('fs'),
    Q = require('q'),
    async = require('async'),
    _ = require('underscore');

module.exports = {
    getInjectedName: getInjectedName,
    getGroupModules: getGroupModules,
    createInstance: createInstance,
    _createWrapperClass: _createWrapperClass
};

/**
 * returns the name of the injected module according to:
 * 1. inline injection ($)
 * 2. defined injection
 * @param param
 * @param moduleData
 * @returns {string}
 */
function getInjectedName(param, moduleData) {
    if (param.charAt(0) === "$") {
        return param.substr(1);
    }
    if (moduleData.injections && param in moduleData.injections) {
        return moduleData.injections[param];
    }
}

/**
 *
 * @param basePath
 * @param group
 * @returns {promise} which resolves the modules of the given group
 */
function getGroupModules(basePath, group) {
    // initialize required properties on group
    group.alias = group.alias || {};
    group.ignore = group.ignore || [];

    if (group.dir) {
        return _getModulesInDir(basePath, group, group.dir);
    }
    return Q.resolve({});
}

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

//  Private Functions

/**
 * extract all the modules in a given directory (recursively)
 * @param basePath
 * @param group
 * @param dir
 * @returns {promise}
 * @private
 */
function _getModulesInDir(basePath, group, dir) {
    var deferred = Q.defer();

    fs.readdir(basePath + dir, function (err, children) {
        var modules = {};
        if (!err && children && children.length > 0) {
            async.each(children, function (child, callback) {
                var path = dir + "/" + child;
                if (group.ignore.indexOf(path.replace(group.dir, "")) >= 0) {
                    return callback();
                }
                isDir(basePath + path, function (isDir) {
                    if (isDir) {
                        _getModulesInDir(basePath, group, path)
                            .then(function (modulesOfDir) {
                                _.extend(modules, modulesOfDir);
                                callback();
                            });
                    } else {
                        _addGroupModule(modules, group, dir, child);
                        callback();
                    }
                });
            }, function () {
                deferred.resolve(modules);
            });
        } else {
            deferred.resolve(modules);
        }
    });

    return deferred.promise;
}

function _addGroupModule(modules, group, dir, child) {
    var moduleName = child.replace(/\.[^/.]+$/, ""); // remove file extension
    var modulePath = dir + "/" + moduleName;
    if (moduleName in group.alias) {
        moduleName = group.alias[moduleName];
    }
    if (group.prefix) {
        moduleName = group.prefix + moduleName;
    }
    modules[moduleName] = {
        module: modulePath
    };
    _.extend(modules[moduleName], group.data);
}

function isDir(path, callback) {
    fs.lstat(path, function (err, stats) {
        callback(stats && stats.isDirectory());
    });
}