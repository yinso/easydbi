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
var query = require("../lib/query-helper");
var assert = require("assert");
var QueryHelper = /** @class */ (function () {
    function QueryHelper() {
    }
    QueryHelper.prototype.arrayify = function () {
        var q = 'select * from test where a = $a and b = $b';
        var a = { a: 1, b: 2 };
        var _a = query.arrayify(q, a), stmt = _a[0], args = _a[1];
        assert.equal(stmt, 'select * from test where a = ? and b = ?');
        assert.deepEqual(args, [1, 2]);
    };
    QueryHelper.prototype.escapeString = function () {
        var input = "what's your name - what's up?";
        var expected = "'what\\'s your name - what\\'s up?'";
        assert.equal(query.escape(input), expected);
    };
    QueryHelper.prototype.escapeDate = function () {
        var input = new Date('2018-01-01T00:00:00.000Z');
        var expected = "'2018-01-01T00:00:00.000Z'";
        assert.equal(query.escape(input), expected);
    };
    QueryHelper.prototype.escapeNumber = function () {
        var input = 15;
        var expected = "15";
        assert.equal(query.escape(input), expected);
    };
    QueryHelper.prototype.escapeBoolean = function () {
        var input = true;
        var expected = "true";
        assert.equal(query.escape(input), expected);
    };
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], QueryHelper.prototype, "arrayify", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], QueryHelper.prototype, "escapeString", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], QueryHelper.prototype, "escapeDate", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], QueryHelper.prototype, "escapeNumber", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], QueryHelper.prototype, "escapeBoolean", null);
    QueryHelper = __decorate([
        mocha_typescript_1.suite
    ], QueryHelper);
    return QueryHelper;
}());
//# sourceMappingURL=query-helper.js.map