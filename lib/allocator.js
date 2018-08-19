"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var driver_1 = require("./driver");
var pool = require("./pool-wrapper");
var BaseAllocator = /** @class */ (function () {
    function BaseAllocator(key, driver, options) {
        this.key = key;
        this.options = options;
        this._Driver = driver;
    }
    BaseAllocator.prototype.connect = function (cb) {
        this.connectAsync()
            .then(function (conn) { return cb(null, conn); })
            .catch(cb);
    };
    BaseAllocator.prototype.connectAsync = function () {
        var _this = this;
        return Promise.try(function () { return new _this._Driver(_this.key, _this.options); })
            .then(function (conn) { return conn.connectAsync(); })
            .then(function (conn) { return conn; });
    };
    BaseAllocator.prototype.prepare = function (call, options) {
        console.log('****** Pool.prepare', call, options);
        if (typeof (options) === 'function') {
            this._Driver.prototype[call] = options;
            this._Driver.prototype[call + "Async"] = function (args) {
                var _this = this;
                if (args === void 0) { args = {}; }
                return new Promise(function (resolve, reject) {
                    _this[call](args, function (err, result) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(result);
                        }
                    });
                });
            };
        }
        else if (typeof options.query === 'string') {
            this._prepareQuery(call, options.query);
        }
        else if (typeof options.exec === 'string') {
            this._prepareExec(call, options.exec);
        }
    };
    BaseAllocator.prototype._prepareQuery = function (call, query) {
        var callAsync = call + "Async";
        var callAsyncProc = function (args) {
            if (args === void 0) { args = {}; }
            return this.queryAsync(query, args);
        };
        this._Driver.prototype[callAsync] = callAsyncProc;
        this._Driver.prototype[call] = function () {
            var _a = driver_1.normalize(arguments[0], arguments[1]), args = _a[0], cb = _a[1];
            this[callAsync](args)
                .then(function (records) { return cb(null, records); })
                .catch(cb);
        };
    };
    BaseAllocator.prototype._prepareExec = function (call, query) {
        var callAsync = call + "Async";
        var callAsyncProc = function (args) {
            if (args === void 0) { args = {}; }
            return this.execAsync(query, args);
        };
        this._Driver.prototype[callAsync] = callAsyncProc;
        this._Driver.prototype[call] = function () {
            var _a = driver_1.normalize(arguments[0], arguments[1]), args = _a[0], cb = _a[1];
            this[callAsync](args)
                .then(function () { return cb(null); })
                .catch(cb);
        };
    };
    return BaseAllocator;
}());
exports.BaseAllocator = BaseAllocator;
// this driver is going to share a particular pool?
// or that the pool is going to return a 
var PoolAllocator = /** @class */ (function (_super) {
    __extends(PoolAllocator, _super);
    function PoolAllocator(key, driver, options) {
        var _this = _super.call(this, key, driver, options) || this;
        _this._pool = pool.createPool({
            create: function () { return Promise.resolve(new driver(key, options)); },
            destroy: function (client) { return client.disconnectAsync(); }
        }, options.pool || { min: 0, max: Infinity });
        return _this;
    }
    PoolAllocator.prototype.connectAsync = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            return _this._pool.acquire()
                .then(function (driver) {
                driver.disconnectAsync = function () {
                    return new Promise(function (resolve, reject) {
                        _this._pool.release(driver)
                            .then(resolve, reject);
                    });
                };
                resolve(driver);
            }, reject);
        });
    };
    return PoolAllocator;
}(BaseAllocator));
exports.PoolAllocator = PoolAllocator;
//# sourceMappingURL=allocator.js.map