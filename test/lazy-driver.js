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
require("../lib/lazy-driver");
var sqljs = require("../lib/sqljs-driver");
var conn;
DBI.setup('test-lazy', {
    type: 'lazy',
    options: {
        driver: sqljs.SqljsDriver,
        driverOptions: {
            pool: {
                min: 2,
                max: 10
            }
        },
    },
});
var LazyDriverTest = /** @class */ (function () {
    function LazyDriverTest() {
    }
    LazyDriverTest.prototype.canConnect = function () {
        return DBI.connectAsync('test-lazy')
            .then(function (driver) {
            conn = driver;
            assert.deepEqual(false, conn.isConnected());
        })
            .then(function () {
            return conn.disconnectAsync();
        });
    };
    LazyDriverTest.prototype.canCreateTable = function () {
        return conn.execAsync("create table foo (c1 int, c2 int)");
    };
    LazyDriverTest.prototype.canInsertRecords = function () {
        return conn.execAsync("insert into foo values (1, 2), (3, 4)");
    };
    LazyDriverTest.prototype.canUpdateRecords = function () {
        return conn.execAsync("update foo set c1 = 2 where c2 = 2");
    };
    LazyDriverTest.prototype.canDeleteRecords = function () {
        return conn.execAsync("delete from foo where c2 = 2");
    };
    LazyDriverTest.prototype.canDropTable = function () {
        conn.execAsync("drop table foo", {});
    };
    LazyDriverTest.prototype.canDisconnect = function () {
        return conn.disconnectAsync();
    };
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], LazyDriverTest.prototype, "canConnect", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], LazyDriverTest.prototype, "canCreateTable", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], LazyDriverTest.prototype, "canInsertRecords", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], LazyDriverTest.prototype, "canUpdateRecords", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], LazyDriverTest.prototype, "canDeleteRecords", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], LazyDriverTest.prototype, "canDropTable", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], LazyDriverTest.prototype, "canDisconnect", null);
    LazyDriverTest = __decorate([
        mocha_typescript_1.suite
    ], LazyDriverTest);
    return LazyDriverTest;
}());
//# sourceMappingURL=lazy-driver.js.map