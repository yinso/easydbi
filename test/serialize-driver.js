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
var serialize = require("../lib/serialize-driver");
var sqljs = require("../lib/sqljs-driver");
var path = require("path");
var fs = require("fs-extra-promise");
var DBI = require("../lib/dbi");
describe('SerializeHelperTest', function () {
    var cases = [
        {
            input: "create table foo (c1 int, c2 int)",
            expected: "foo",
        },
        {
            input: "insert into foo values (1, 2), (3, 4)",
            expected: 'foo'
        },
        {
            input: "insert foo values (1, 2), (3, 4)",
            expected: 'foo'
        },
        {
            input: "update foo set c1 = 2 where c2 = 2",
            expected: 'foo'
        },
        {
            input: "delete from foo where c2 = 2",
            expected: 'foo'
        },
        {
            input: "delete foo where c2 = 2",
            expected: 'foo'
        },
        {
            input: "alter table foo add column c2 int default null",
            expected: "foo"
        },
        {
            input: "drop table foo",
            expected: "foo"
        }
    ];
    cases.forEach(function (_a) {
        var name = _a.name, input = _a.input, expected = _a.expected;
        it(name || "can get table name from: " + input, function () {
            var actual = serialize.getQueryTable(input);
            assert.deepEqual(expected, actual);
        });
    });
});
var conn;
var outputDir = path.join(__dirname, '..', 'run');
var fooTablePath = path.join(outputDir, "foo.json");
DBI.setup('test-serialize', {
    type: 'serialize',
    options: {
        driver: sqljs.SqljsDriver,
        driverOptions: {},
        outputDir: outputDir
    }
});
var SerializeDriverTest = /** @class */ (function () {
    function SerializeDriverTest() {
    }
    SerializeDriverTest.prototype.canConnect = function () {
        DBI.connectAsync('test-serialize')
            .then(function (driver) {
            conn = driver;
        });
    };
    SerializeDriverTest.prototype.canCreateTable = function () {
        return conn.execAsync("create table foo (c1 int, c2 int)")
            .then(function () {
            return fs.existsAsync(fooTablePath)
                .then(function (result) { return assert.equal(true, result); });
        });
    };
    SerializeDriverTest.prototype.canInsertRecords = function () {
        return conn.execAsync("insert into foo values (1, 2), (3, 4)")
            .then(function () {
            return fs.readFileAsync(fooTablePath, 'utf8')
                .then(function (data) { return JSON.parse(data); })
                .then(function (data) {
                assert.deepEqual([
                    { c1: 1, c2: 2 },
                    { c1: 3, c2: 4 }
                ], data);
                return;
            });
        });
    };
    SerializeDriverTest.prototype.canUpdateRecords = function () {
        return conn.execAsync("update foo set c1 = 2 where c2 = 2")
            .then(function () {
            return fs.readFileAsync(fooTablePath, 'utf8')
                .then(function (data) { return JSON.parse(data); })
                .then(function (data) { return assert.deepEqual([
                { c1: 2, c2: 2 },
                { c1: 3, c2: 4 }
            ], data); });
        });
    };
    SerializeDriverTest.prototype.canDeleteRecords = function () {
        return conn.execAsync("delete from foo where c2 = 2")
            .then(function () {
            return fs.readFileAsync(fooTablePath, 'utf8')
                .then(function (data) { return JSON.parse(data); })
                .then(function (records) {
                assert.deepEqual([
                    { c1: 3, c2: 4 }
                ], records);
                return;
            });
        });
    };
    SerializeDriverTest.prototype.canDropTable = function () {
        conn.execAsync("drop table foo", {})
            .then(function () {
            return fs.existsAsync(fooTablePath)
                .then(function (result) { return assert.equal(false, result); });
        });
    };
    SerializeDriverTest.prototype.canDisconnect = function () {
        return conn.disconnectAsync();
    };
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SerializeDriverTest.prototype, "canConnect", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SerializeDriverTest.prototype, "canCreateTable", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SerializeDriverTest.prototype, "canInsertRecords", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SerializeDriverTest.prototype, "canUpdateRecords", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SerializeDriverTest.prototype, "canDeleteRecords", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SerializeDriverTest.prototype, "canDropTable", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SerializeDriverTest.prototype, "canDisconnect", null);
    SerializeDriverTest = __decorate([
        mocha_typescript_1.suite
    ], SerializeDriverTest);
    return SerializeDriverTest;
}());
//# sourceMappingURL=serialize-driver.js.map