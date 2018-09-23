"use strict";
exports.__esModule = true;
var DBI = require("../lib/dbi");
var assert = require("assert");
var path = require("path");
require('../lib/sqljs-driver');
DBI.setup('test', {
    type: 'sqljs',
    options: {
        filePath: ":memory:"
    }
});
var standardDb = path.join(__dirname, './mock-schemas/standard/up.sql');
var standardDbTables = 3;
var commentsDb = path.join(__dirname, './mock-schemas/comments/up.sql');
var commentsDbTables = 3;
var oddDb = path.join(__dirname, './mock-schemas/odd-syntax/up.sql');
var oddDbTables = 3;
var downDb = path.join(__dirname, './mock-schemas/standard/down.sql');
describe("test standard file parse", function () {
    var connect;
    before(function () {
        return DBI.connectAsync('test')
            .then(function (conn) {
            connect = conn;
            return connect.execScriptAsync(standardDb);
        });
    });
    it('schema should have nonzero number of tables', function () {
        return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(function (result) { return assert.notEqual(result.length, 0); });
    });
    it('should have the same number of tables as defined', function () {
        return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(function (result) { return assert.equal(result.length, standardDbTables); });
    });
    it('should teardown correctly', function () {
        return connect.execScriptAsync(downDb)
            .then(function () { return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(function (result) { return assert.equal(result.length, 0); }); });
    });
});
describe("test file parse with comments", function () {
    var connect;
    before(function () {
        return DBI.connectAsync('test')
            .then(function (conn) {
            connect = conn;
            return connect.execScriptAsync(commentsDb);
        });
    });
    it('schema should have nonzero number of tables', function () {
        return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(function (result) { return assert.notEqual(result.length, 0); });
    });
    it('should have the same number of tables as defined', function () {
        return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(function (result) { return assert.equal(result.length, commentsDbTables); });
    });
    it('should teardown correctly', function () {
        return connect.execScriptAsync(downDb)
            .then(function () { return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(function (result) { return assert.equal(result.length, 0); }); });
    });
});
describe("test file parse with wierd but valid syntax", function () {
    var connect;
    before(function () {
        return DBI.connectAsync('test')
            .then(function (conn) {
            connect = conn;
            return connect.execScriptAsync(oddDb);
        });
    });
    it('schema should have nonzero number of tables', function () {
        return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(function (result) { return assert.notEqual(result.length, 0); });
    });
    it('should have the same number of tables as defined', function () {
        return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(function (result) { return assert.equal(result.length, oddDbTables); });
    });
    it('should teardown correctly', function () {
        return connect.execScriptAsync(downDb)
            .then(function () { return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(function (result) { return assert.equal(result.length, 0); }); });
    });
});
