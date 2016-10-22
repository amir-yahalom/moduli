var Q;

var db = {
    users: {
        "a@a.com": {
            email: "a@a.com",
            password: "a@a.com"
        }
    },
    tokens: {
    }
};

module.exports = {
    getObj: function (collection, id) {
        var deferred = Q.defer();

        process.nextTick(function () {
            var res = (db[collection] || {})[id];
            if (res) {
                return deferred.resolve(res);
            }
            return deferred.reject("not found");
        });
        
        return deferred.promise;
    },
    setObj: function (collection, id, data) {
        var deferred = Q.defer();

        if (!db[collection]) {
            db[collection] = {};
        }
        process.nextTick(function () {
            db[collection][id] = data;
            deferred.resolve(data);
        });
        
        return deferred.promise;
    },
    init: function (connStr, $q) {
        this.connStr = connStr;
        Q = $q;
    }
};