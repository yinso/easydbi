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
/**
 * A "Lazily-instantiated" driver. It doesn't connect until it tries to query.
 */
var driver = require("./driver");
var Promise = require("bluebird");
var DBI = require("./dbi");
function isLazyDriverOptions(v) {
    return driver.isDriverOptions(v) &&
        typeof (v.driver) === 'function' &&
        driver.isDriverOptions(v.driverOptions);
}
exports.isLazyDriverOptions = isLazyDriverOptions;
// strictly speaking I want this to be passed in...
var LazyDriver = /** @class */ (function (_super) {
    __extends(LazyDriver, _super);
    function LazyDriver(key, options) {
        var _this = _super.call(this, key, options) || this;
        _this._connected = false;
        if (isLazyDriverOptions(options)) {
            _this.driver = options.driver;
            _this.driverOptions = options.driverOptions;
            _this._inner = new _this.driver(key, _this.driverOptions);
        }
        else {
            throw new Error("SerializeDriver.ctor:InvalidSerializeDriverOptions");
        }
        return _this;
    }
    LazyDriver.prototype.connectAsync = function () {
        return Promise.resolve(this);
    };
    LazyDriver.prototype.isConnected = function () {
        return this._connected;
    };
    LazyDriver.prototype.queryAsync = function (query, args) {
        var _this = this;
        if (args === void 0) { args = {}; }
        if (this._connected) {
            return this._inner.queryAsync(query, args);
        }
        else {
            return this._inner.connectAsync()
                .then(function () {
                _this._connected = true;
                console.log('********************* LazyDriver.queryAsync.connected', query, args);
                return _this._inner.queryAsync(query, args);
            });
        }
    };
    LazyDriver.prototype.execAsync = function (query, args) {
        var _this = this;
        if (args === void 0) { args = {}; }
        if (this._connected) {
            return this._inner.execAsync(query, args);
        }
        else {
            return this._inner.connectAsync()
                .then(function () {
                _this._connected = true;
                console.log('********************* LazyDriver.execAsync.connected', query, args);
                return _this._inner.execAsync(query, args);
            });
        }
    };
    LazyDriver.prototype.disconnectAsync = function () {
        var _this = this;
        if (this._connected) {
            return this._inner.disconnectAsync()
                .then(function () {
                console.log('********************* LazyDriver.disconnectAsync.disconnected');
                _this._connected = false;
            });
        }
        else {
            return Promise.resolve();
        }
    };
    return LazyDriver;
}(driver.Driver));
exports.LazyDriver = LazyDriver;
DBI.register('lazy', LazyDriver);
//# sourceMappingURL=lazy-driver.js.map