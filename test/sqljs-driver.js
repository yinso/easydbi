"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var mocha_typescript_1 = require("mocha-typescript");
var assert = require("assert");
var DBI = require("../lib/dbi");
require('../lib/sqljs-driver');
var conn;
DBI.setup('test-sqljs', {
    type: 'sqljs',
    options: {}
});
var SqlJsTest = /** @class */ (function () {
    function SqlJsTest() {
    }
    SqlJsTest.prototype.canConnect = function () {
        return DBI.connectAsync('test-sqljs')
            .then(function (driver) {
            conn = driver;
        });
    };
    SqlJsTest.prototype.canCreateTable = function () {
        return conn.execAsync('create table test(c1 int, c2 int)')
            .then(function () { return conn.queryAsync('select * from test'); });
    };
    SqlJsTest.prototype.canInsert = function () {
        return conn.execAsync('insert into test values (1, 2), (3, 4)');
    };
    SqlJsTest.prototype.canSelect = function () {
        return conn.queryAsync('select * from test')
            .then(function (records) {
            assert.deepEqual([
                {
                    c1: 1,
                    c2: 2
                },
                {
                    c1: 3,
                    c2: 4
                }
            ], records);
        });
    };
    SqlJsTest.prototype.canGetSchema = function () {
        return conn.queryAsync('select * from sqlite_master', {})
            .then(function (results) {
            assert.deepEqual([
                {
                    type: 'table',
                    name: 'test',
                    tbl_name: 'test',
                    rootpage: 2,
                    sql: "CREATE TABLE test(c1 int, c2 int)"
                },
            ], results);
        });
    };
    SqlJsTest.prototype.canDisconnect = function () {
        return conn.disconnectAsync();
    };
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SqlJsTest.prototype, "canConnect", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SqlJsTest.prototype, "canCreateTable", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SqlJsTest.prototype, "canInsert", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SqlJsTest.prototype, "canSelect", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SqlJsTest.prototype, "canGetSchema", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SqlJsTest.prototype, "canDisconnect", null);
    SqlJsTest = __decorate([
        mocha_typescript_1.suite
    ], SqlJsTest);
    return SqlJsTest;
}());
//# sourceMappingURL=sqljs-driver.js.map