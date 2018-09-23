"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DBI = require("../lib/dbi");
var assert = require("assert");
var path = require("path");
var fs = require("fs-extra-promise");
var util = require("../lib/util");
require('../lib/sqljs-driver');
DBI.setup('test', {
    type: 'sqljs',
    options: {
        filePath: ":memory:",
    },
});
var standardDb = path.join(__dirname, './mock-schemas/standard/up.sql');
var standardDbTables = 3;
var commentsDb = path.join(__dirname, './mock-schemas/comments/up.sql');
var commentsDbCommentsRemoved = path.join(__dirname, './mock-schemas/comments/up-remove-comments.sql');
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
describe("test comment removal regex", function () {
    it('should remove comments', function () {
        return fs.readFileAsync(commentsDb, 'utf8')
            .then(function (originalData) {
            return fs.readFileAsync(commentsDbCommentsRemoved, 'utf8')
                .then(function (commentsRemoved) {
                assert.deepEqual(util.removeComments(originalData), commentsRemoved);
            });
        });
    });
});
var standardAsQueries = ['CREATE TABLE  "AGENTS" (\n    "AGENT_CODE" CHAR(6) NOT NULL PRIMARY KEY,\n\t"AGENT_NAME" CHAR(40),\n\t"WORKING_AREA" CHAR(35),\n\t"COMMISSION" NUMBER(10,2),\n\t"PHONE_NO" CHAR(15),\n\t"COUNTRY" VARCHAR2(25)\n)',
    'CREATE TABLE  "CUSTOMER" (\n\t"CUST_CODE" VARCHAR2(6) NOT NULL PRIMARY KEY,\n\t"CUST_NAME" VARCHAR2(40) NOT NULL,\n\t"CUST_CITY" CHAR(35),\n\t"WORKING_AREA" VARCHAR2(35) NOT NULL,\n\t"CUST_COUNTRY" VARCHAR2(20) NOT NULL,\n\t"GRADE" NUMBER,\n\t"OPENING_AMT" NUMBER(12,2) NOT NULL,\n\t"RECEIVE_AMT" NUMBER(12,2) NOT NULL,\n\t"PAYMENT_AMT" NUMBER(12,2) NOT NULL,\n\t"OUTSTANDING_AMT" NUMBER(12,2) NOT NULL,\n\t"PHONE_NO" VARCHAR2(17) NOT NULL,\n\t"AGENT_CODE" CHAR(6) NOT NULL REFERENCES AGENTS\n)',
    'CREATE TABLE  "ORDERS" (\n    "ORD_NUM" NUMBER(6,0) NOT NULL PRIMARY KEY,\n\t"ORD_AMOUNT" NUMBER(12,2) NOT NULL,\n\t"ADVANCE_AMOUNT" NUMBER(12,2) NOT NULL,\n\t"ORD_DATE" DATE NOT NULL,\n\t"CUST_CODE" VARCHAR2(6) NOT NULL REFERENCES CUSTOMER,\n\t"AGENT_CODE" CHAR(6) NOT NULL REFERENCES AGENTS,\n\t"ORD_DESCRIPTION" VARCHAR2(60) NOT NULL\n)',
    ''];
describe("test query array", function () {
    it('should create an array of queries', function () {
        return fs.readFileAsync(standardDb, 'utf8')
            .then(function (originalData) {
            var queries = util.splitToQueries(originalData);
            assert.deepEqual(homogenizeNewline(queries), standardAsQueries);
        });
    });
});
function homogenizeNewline(array) {
    return array.map(function (query) { return query.replace(/\r\n/g, '\n'); });
}
//# sourceMappingURL=exec-file.js.map