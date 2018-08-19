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
var driver_1 = require("./driver");
var pool = require("../lib/allocator");
var NoPoolTest = /** @class */ (function () {
    function NoPoolTest() {
        this.pool = new pool.BaseAllocator('test', driver_1.MockDriver, {});
        this.drivers = [];
    }
    NoPoolTest.prototype.canConnect = function () {
        var _this = this;
        return this.pool.connectAsync()
            .then(function (driver) {
            _this.drivers.push(driver);
        });
    };
    NoPoolTest.prototype.canDisconnect = function () {
        return Promise.all(this.drivers.map(function (driver) { return driver.disconnectAsync(); }))
            .then(function () { });
    };
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], NoPoolTest.prototype, "canConnect", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], NoPoolTest.prototype, "canDisconnect", null);
    NoPoolTest = __decorate([
        mocha_typescript_1.suite,
        __metadata("design:paramtypes", [])
    ], NoPoolTest);
    return NoPoolTest;
}());
var PoolTest = /** @class */ (function () {
    function PoolTest() {
        this.pool = new pool.PoolAllocator('test', driver_1.MockDriver, { pool: { min: 0, max: 10 } });
        this.drivers = [];
    }
    PoolTest.prototype.canConnect = function () {
        var _this = this;
        return this.pool.connectAsync()
            .then(function (driver) {
            _this.drivers.push(driver);
        });
    };
    PoolTest.prototype.canDisconnect = function () {
        return Promise.all(this.drivers.map(function (driver) { return driver.disconnectAsync(); }))
            .then(function () { });
    };
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PoolTest.prototype, "canConnect", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], PoolTest.prototype, "canDisconnect", null);
    PoolTest = __decorate([
        mocha_typescript_1.suite,
        __metadata("design:paramtypes", [])
    ], PoolTest);
    return PoolTest;
}());
//# sourceMappingURL=allocator.js.map