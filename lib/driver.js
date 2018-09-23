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
var events_1 = require("events");
var fs = require("fs-extra-promise");
var util = require("./util");
var Driver = /** @class */ (function (_super) {
    __extends(Driver, _super);
    function Driver(key, options) {
        var _this = _super.call(this) || this;
        _this.key = key;
        _this.options = options;
        Driver.id++;
        _this.id = Driver.id;
        _this.pool = true;
        return _this;
    }
    Driver.prototype.connect = function (cb) {
        this.connectAsync()
            .then(function (driver) { return cb(null, driver); })
            .catch(cb);
    };
    Driver.prototype.driverName = function () { return (this.constructor).name; };
    Driver.prototype.loadScript = function (filePath, inTransaction, cb) {
        this.loadScriptAsync(filePath, inTransaction)
            .then(function () { return cb(null); })
            .catch(cb);
    };
    Driver.prototype.query = function (query, next, last) {
        var _a = normalize(next, last), args = _a[0], cb = _a[1];
        this.queryAsync(query, args)
            .then(function (records) { return cb(null, records); })
            .catch(cb);
    };
    Driver.prototype.queryOne = function (query, next, last) {
        var _a = normalize(next, last), args = _a[0], cb = _a[1];
        this.queryOneAsync(query, args)
            .then(function (record) { return cb(null, record); })
            .catch(cb);
    };
    Driver.prototype.exec = function (query, next, last) {
        var _a = normalize(next, last), args = _a[0], cb = _a[1];
        this.execAsync(query, args)
            .then(function () { return cb(null); })
            .catch(cb);
    };
    Driver.prototype.begin = function (cb) {
        this.beginAsync()
            .then(function () { return cb(null); })
            .catch(cb);
    };
    Driver.prototype.commit = function (cb) {
        this.commitAsync()
            .then(function () { return cb(null); })
            .catch(cb);
    };
    Driver.prototype.rollback = function (cb) {
        this.rollbackAsync()
            .then(function () { return cb(null); })
            .catch(cb);
    };
    Driver.prototype.disconnect = function (cb) {
        this.disconnectAsync()
            .then(function () { return cb(null); })
            .catch(cb);
    };
    Driver.prototype.close = function (cb) {
        this.closeAsync()
            .then(function () { return cb(null); })
            .catch(cb);
    };
    Driver.prototype.execScript = function (filePath, cb) {
        this.execScriptAsync(filePath)
            .then(function () { return cb(null); })
            .catch(cb);
    };
    Driver.prototype.queryOneAsync = function (query, args) {
        return this.queryAsync(query, args)
            .then(function (records) {
            if (records.length == 0) {
                throw new Error("ExpectOneRecord");
            }
            else {
                return records[0];
            }
        });
    };
    Driver.prototype.beginAsync = function () {
        return this.execAsync('begin');
    };
    Driver.prototype.commitAsync = function () {
        return this.execAsync('commit');
    };
    Driver.prototype.rollbackAsync = function () {
        return this.execAsync('rollback');
    };
    Driver.prototype.closeAsync = function () {
        return this.disconnectAsync();
    };
    Driver.prototype.execScriptAsync = function (filePath) {
        var _this = this;
        return fs.readFileAsync(filePath, 'utf8')
            .then(function (data) {
            var commentsRemoved = util.removeComments(data);
            var queries = util.splitToQueries(commentsRemoved);
            return Promise.each(queries, function (query) {
                if (query)
                    return _this.execAsync(query);
            });
        })
            .then(function () { });
    };
    Driver.prototype.loadScriptAsync = function (filePath, inTransaction) {
        var _this = this;
        if (inTransaction === void 0) { inTransaction = true; }
        return fs.readFileAsync(filePath, 'utf8')
            .then(function (data) {
            var commentsRemoved = util.removeComments(data);
            var queries = util.splitToQueries(commentsRemoved);
            if (inTransaction) {
                return _this.beginAsync()
                    .then(function () {
                    return Promise.each(queries, function (query) {
                        if (query)
                            return _this.execAsync(query);
                    })
                        .then(function () { });
                })
                    .then(function () { return _this.commitAsync(); })
                    .catch(function (e) {
                    return _this.rollbackAsync()
                        .then(function () {
                        throw e;
                    })
                        .catch(function () {
                        throw e;
                    });
                });
            }
            else {
                return Promise.each(queries, function (query) {
                    return _this.execAsync(query);
                })
                    .then(function () { });
            }
        });
    };
    Object.defineProperty(Driver, "id", {
        get: function () { return this._id; },
        set: function (value) { this._id = value; },
        enumerable: true,
        configurable: true
    });
    Driver._id = 0;
    return Driver;
}(events_1.EventEmitter));
exports.Driver = Driver;
function normalize(arg, next) {
    if (typeof (next) === 'function') {
        return [arg, next];
    }
    else {
        return [{}, arg];
    }
}
exports.normalize = normalize;
//# sourceMappingURL=driver.js.map