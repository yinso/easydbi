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
var Promise = require("bluebird");
var mocha_typescript_1 = require("mocha-typescript");
var assert = require("assert");
var sql = require("../lib/sqljs-driver");
var pool = require("../lib/pool-wrapper");
var conn;
var connPool;
var PoolWrapperTest = /** @class */ (function () {
    function PoolWrapperTest() {
    }
    PoolWrapperTest.prototype.canCreatePool = function () {
        connPool = pool.createPool({
            create: function () { return Promise.resolve(new sql.SqljsDriver('test', {})); },
            destroy: function (client) { return client.disconnectAsync(); }
        }, { min: 0, max: Infinity });
    };
    PoolWrapperTest.prototype.canConnect = function () {
        return connPool.acquire()
            .then(function (driver) {
            conn = driver;
            return conn.connectAsync();
        });
    };
    PoolWrapperTest.prototype.canCreateTable = function () {
        return conn.execAsync('create table test(c1 int, c2 int)')
            .then(function () { return conn.queryAsync('select * from test'); });
    };
    PoolWrapperTest.prototype.canInsert = function () {
        return conn.execAsync('insert into test values (1, 2), (3, 4)');
    };
    PoolWrapperTest.prototype.canSelect = function () {
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
    PoolWrapperTest.prototype.canGetSchema = function () {
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
    PoolWrapperTest.prototype.canDisconnect = function () {
        return connPool.release(conn);
    };
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PoolWrapperTest.prototype, "canCreatePool", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PoolWrapperTest.prototype, "canConnect", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PoolWrapperTest.prototype, "canCreateTable", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PoolWrapperTest.prototype, "canInsert", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PoolWrapperTest.prototype, "canSelect", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PoolWrapperTest.prototype, "canGetSchema", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PoolWrapperTest.prototype, "canDisconnect", null);
    PoolWrapperTest = __decorate([
        mocha_typescript_1.suite
    ], PoolWrapperTest);
    return PoolWrapperTest;
}());
//# sourceMappingURL=pool-wrapper.js.map