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
var fs = require("fs-extra-promise");
var path = require("path");
var DBI = require("./dbi");
// strictly speaking I want this to be passed in...
var SerializeDriver = /** @class */ (function (_super) {
    __extends(SerializeDriver, _super);
    function SerializeDriver(key, options) {
        var _this = _super.call(this, key, options) || this;
        _this.outputDir = options.outputDir;
        _this.driver = options.driver;
        _this.driverOptions = options.driverOptions;
        _this._inner = new _this.driver(key, _this.driverOptions);
        return _this;
    }
    SerializeDriver.prototype.connectAsync = function () {
        var _this = this;
        return this._inner.connectAsync()
            .then(function () { return _this; });
    };
    SerializeDriver.prototype.isConnected = function () {
        return this._inner.isConnected();
    };
    SerializeDriver.prototype.queryAsync = function (query, args) {
        if (args === void 0) { args = {}; }
        return this._inner.queryAsync(query, args);
    };
    SerializeDriver.prototype.execAsync = function (query, args) {
        var _this = this;
        if (args === void 0) { args = {}; }
        return this._inner.execAsync(query, args)
            .then(function () {
            var affectedTable = getQueryTable(query);
            if (affectedTable) {
                return _this._serializeTable(affectedTable, isDropTableQuery(query));
            }
            else {
                return;
            }
        });
    };
    SerializeDriver.prototype._serializeTable = function (table, isDropTable) {
        var filePath = this._getTablePath(table);
        if (isDropTable) {
            return fs.unlinkAsync(filePath);
        }
        else {
            return this._inner.queryAsync("select * from " + table)
                .then(function (results) {
                return fs.writeFileAsync(filePath, JSON.stringify(results, null, 2));
            })["catch"](function (e) {
                console.log('*********** SerializeDriver.error', e);
                throw e;
            });
        }
    };
    SerializeDriver.prototype._getTablePath = function (table) {
        return path.join(this.outputDir, table + ".json");
    };
    SerializeDriver.prototype.disconnectAsync = function () {
        return this._inner.disconnectAsync();
    };
    return SerializeDriver;
}(driver.Driver));
exports.SerializeDriver = SerializeDriver;
function isInsertQuery(query) {
    var match = query.match(/^\s*insert\s+(into\s+)?(\w+)/i);
    if (match) {
        return match[2];
    }
    else {
        return false;
    }
}
exports.isInsertQuery = isInsertQuery;
function isUpdateQuery(query) {
    var match = query.match(/^\s*update\s+(\w+)/i);
    if (match) {
        return match[1];
    }
    else {
        return false;
    }
}
exports.isUpdateQuery = isUpdateQuery;
function isDeleteQuery(query) {
    var match = query.match(/^\s*delete\s+(from\s+)?(\w+)/i);
    if (match) {
        return match[2];
    }
    else {
        return false;
    }
}
exports.isDeleteQuery = isDeleteQuery;
function isCreateTableQuery(query) {
    var match = query.match(/^\s*create\s+table\s+(\w+)/i);
    if (match) {
        return match[1];
    }
    else {
        return false;
    }
}
exports.isCreateTableQuery = isCreateTableQuery;
function isAlterTableQuery(query) {
    var match = query.match(/^\s*alter\s+table\s+(\w+)/i);
    if (match) {
        return match[1];
    }
    else {
        return false;
    }
}
exports.isAlterTableQuery = isAlterTableQuery;
function isDropTableQuery(query) {
    var match = query.match(/^\s*drop\s+table\s+(\w+)/i);
    if (match) {
        return match[1];
    }
    else {
        return false;
    }
}
exports.isDropTableQuery = isDropTableQuery;
function getQueryTable(query) {
    if (typeof (query) === 'string') {
        var isInsert = isInsertQuery(query);
        var isUpdate = isUpdateQuery(query);
        var isDelete = isDeleteQuery(query);
        var isCreateTable = isCreateTableQuery(query);
        var isAlterTable = isAlterTableQuery(query);
        var isDropTable = isDropTableQuery(query);
        return isInsert || isUpdate || isDelete || isCreateTable || isAlterTable || isDropTable;
    }
    else {
        throw new Error("UnknownQueryType: " + query);
    }
}
exports.getQueryTable = getQueryTable;
DBI.register('serialize', SerializeDriver);
