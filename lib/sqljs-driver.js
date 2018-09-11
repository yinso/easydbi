"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var driver = require("./driver");
var sql = require("sql.js");
var Promise = require("bluebird");
var helper = require("./query-helper");
var DBI = require("./dbi");
var SqljsDriver = /** @class */ (function (_super) {
    __extends(SqljsDriver, _super);
    function SqljsDriver(key, options) {
        var _this = _super.call(this, key, options) || this;
        _this.inner = new sql.Database();
        return _this;
    }
    SqljsDriver.prototype.connectAsync = function () {
        return Promise.resolve(this);
    };
    SqljsDriver.prototype.isConnected = function () {
        return true;
    };
    SqljsDriver.prototype.queryAsync = function (query, args) {
        var _this = this;
        if (args === void 0) { args = {}; }
        return new Promise(function (resolve, reject) {
            try {
                var _a = helper.arrayify(query, args, { merge: true, key: '?' }), normStmt = _a[0], normArgs = _a[1];
                var results = _this.inner.exec(normStmt);
                if (results.length > 0) {
                    resolve(_this._mapQueryResult(results[0]));
                }
                else {
                    resolve([]);
                }
            }
            catch (e) {
                reject(e);
            }
        });
    };
    SqljsDriver.prototype._mapQueryResult = function (result) {
        return result.values.map(function (record) {
            return result.columns.reduce(function (acc, column, i) {
                acc[column] = record[i];
                return acc;
            }, {});
        });
    };
    SqljsDriver.prototype.execAsync = function (query, args) {
        var _this = this;
        if (args === void 0) { args = {}; }
        return new Promise(function (resolve, reject) {
            try {
                var _a = helper.arrayify(query, args, { merge: true, key: '?' }), normStmt = _a[0], normArgs = _a[1];
                _this.inner.run(normStmt);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    };
    SqljsDriver.prototype.disconnectAsync = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                _this.inner.close();
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    };
    return SqljsDriver;
}(driver.Driver));
exports.SqljsDriver = SqljsDriver;
DBI.register('sqljs', SqljsDriver);
