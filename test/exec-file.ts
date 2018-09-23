import * as driver from '../lib/driver';
import * as DBI from '../lib/dbi'
import * as Promise from 'bluebird';
import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs-extra-promise'
import * as util from '../lib/util'
require('../lib/sqljs-driver')

DBI.setup('test', {
    type: 'sqljs',
    options: {
        filePath: ":memory:",
    },
})
let standardDb : string = path.join(__dirname, './mock-schemas/standard/up.sql');
let standardDbTables : number = 3;
let commentsDb : string = path.join(__dirname, './mock-schemas/comments/up.sql');
let commentsDbCommentsRemoved: string = path.join(__dirname, './mock-schemas/comments/up-remove-comments.sql')
let commentsDbTables : number = 3;
let oddDb : string = path.join(__dirname, './mock-schemas/odd-syntax/up.sql');
let oddDbTables : number = 3;
let downDb : string = path.join(__dirname, './mock-schemas/standard/down.sql');

describe("test standard file parse", () => {
    let connect : driver.Driver
    before(() => {
        return DBI.connectAsync('test')
            .then(conn => {
                connect = conn
                return connect.execScriptAsync(standardDb)
            })
    })
    it('schema should have nonzero number of tables', () => {
        return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(result => assert.notEqual(result.length, 0))
    })
    it('should have the same number of tables as defined', () => {
        return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(result => assert.equal(result.length, standardDbTables))
    })
    it('should teardown correctly', () => {
        return connect.execScriptAsync(downDb)
            .then(() => connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(result => assert.equal(result.length, 0)))
    })
})


describe("test file parse with comments", () => {
    let connect : driver.Driver
    before(() => {
        return DBI.connectAsync('test')
            .then(conn => {
                connect = conn
                return connect.execScriptAsync(commentsDb)
            })
    })
    it('schema should have nonzero number of tables', () => {
        return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(result => assert.notEqual(result.length, 0))
    })
    it('should have the same number of tables as defined', () => {
        return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(result => assert.equal(result.length, commentsDbTables))
    })
    it('should teardown correctly', () => {
        return connect.execScriptAsync(downDb)
            .then(() => connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(result => assert.equal(result.length, 0)))
    })
})

describe("test file parse with wierd but valid syntax", () => {
    let connect : driver.Driver
    before(() => {
        return DBI.connectAsync('test')
            .then(conn => {
                connect = conn
                return connect.execScriptAsync(oddDb)
            })
    })
    it('schema should have nonzero number of tables', () => {
        return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(result => assert.notEqual(result.length, 0))
    })
    it('should have the same number of tables as defined', () => {
        return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(result => assert.equal(result.length, oddDbTables))
    })
    it('should teardown correctly', () => {
        return connect.execScriptAsync(downDb)
            .then(() => connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(result => assert.equal(result.length, 0)))
    })
})

describe("test comment removal regex", () => {
    it('should remove comments', () => {
        return fs.readFileAsync(commentsDb, 'utf8')
            .then((originalData) => {
                return fs.readFileAsync(commentsDbCommentsRemoved, 'utf8')
                    .then((commentsRemoved) => {
                        assert.deepEqual(util.removeComments(originalData), commentsRemoved)
                    })
            })
    })
})

let standardAsQueries = [ 'CREATE TABLE  "AGENTS" (\n    "AGENT_CODE" CHAR(6) NOT NULL PRIMARY KEY,\n\t"AGENT_NAME" CHAR(40),\n\t"WORKING_AREA" CHAR(35),\n\t"COMMISSION" NUMBER(10,2),\n\t"PHONE_NO" CHAR(15),\n\t"COUNTRY" VARCHAR2(25)\n)',
'CREATE TABLE  "CUSTOMER" (\n\t"CUST_CODE" VARCHAR2(6) NOT NULL PRIMARY KEY,\n\t"CUST_NAME" VARCHAR2(40) NOT NULL,\n\t"CUST_CITY" CHAR(35),\n\t"WORKING_AREA" VARCHAR2(35) NOT NULL,\n\t"CUST_COUNTRY" VARCHAR2(20) NOT NULL,\n\t"GRADE" NUMBER,\n\t"OPENING_AMT" NUMBER(12,2) NOT NULL,\n\t"RECEIVE_AMT" NUMBER(12,2) NOT NULL,\n\t"PAYMENT_AMT" NUMBER(12,2) NOT NULL,\n\t"OUTSTANDING_AMT" NUMBER(12,2) NOT NULL,\n\t"PHONE_NO" VARCHAR2(17) NOT NULL,\n\t"AGENT_CODE" CHAR(6) NOT NULL REFERENCES AGENTS\n)',
'CREATE TABLE  "ORDERS" (\n    "ORD_NUM" NUMBER(6,0) NOT NULL PRIMARY KEY,\n\t"ORD_AMOUNT" NUMBER(12,2) NOT NULL,\n\t"ADVANCE_AMOUNT" NUMBER(12,2) NOT NULL,\n\t"ORD_DATE" DATE NOT NULL,\n\t"CUST_CODE" VARCHAR2(6) NOT NULL REFERENCES CUSTOMER,\n\t"AGENT_CODE" CHAR(6) NOT NULL REFERENCES AGENTS,\n\t"ORD_DESCRIPTION" VARCHAR2(60) NOT NULL\n)',
'' ]

describe("test query array", () => {
    it('should create an array of queries', () => {
        return fs.readFileAsync(standardDb, 'utf8')
            .then((originalData) => assert.deepEqual(util.splitToQueries(originalData), standardAsQueries))
    })
})