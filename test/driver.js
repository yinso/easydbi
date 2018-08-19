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
var driver = require("../lib/driver");
var assert = require("assert");
var MockDriver = /** @class */ (function (_super) {
    __extends(MockDriver, _super);
    function MockDriver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MockDriver.prototype.connectAsync = function () {
        return Promise.resolve(this);
    };
    MockDriver.prototype.isConnected = function () { return true; };
    MockDriver.prototype.queryAsync = function (stmt, args) {
        if (args === void 0) { args = {}; }
        return Promise.resolve([
            { a: 1, b: 2 }
        ]);
    };
    MockDriver.prototype.execAsync = function (stmt, args) {
        if (args === void 0) { args = {}; }
        return Promise.resolve();
    };
    MockDriver.prototype.disconnectAsync = function () {
        return Promise.resolve();
    };
    return MockDriver;
}(driver.Driver));
exports.MockDriver = MockDriver;
var DriverTest = /** @class */ (function () {
    function DriverTest() {
        this.driver = new MockDriver('test', {});
    }
    DriverTest.prototype.canConnect = function () {
        return this.driver.connectAsync();
    };
    DriverTest.prototype.isConnected = function () {
        assert.equal(this.driver.isConnected(), true);
    };
    DriverTest.prototype.queryAsyncWorks = function () {
        return this.driver.queryAsync('test')
            .then(function (records) {
            assert.deepEqual([{ a: 1, b: 2 }], records);
        });
    };
    DriverTest.prototype.execAsyncWorks = function () {
        return this.driver.execAsync('test');
    };
    DriverTest.prototype.canDisconnect = function () {
        return this.driver.disconnectAsync();
    };
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], DriverTest.prototype, "canConnect", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], DriverTest.prototype, "isConnected", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], DriverTest.prototype, "queryAsyncWorks", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], DriverTest.prototype, "execAsyncWorks", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], DriverTest.prototype, "canDisconnect", null);
    DriverTest = __decorate([
        mocha_typescript_1.suite,
        __metadata("design:paramtypes", [])
    ], DriverTest);
    return DriverTest;
}());
//# sourceMappingURL=driver.js.map