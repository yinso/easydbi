import * as driver from '../lib/driver';
import * as DBI from '../lib/dbi'
import * as Promise from 'bluebird';
import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs-extra-promise'
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
            .then(result => {
                return assert.notEqual(result.length, 0)
            })
    })
    it('should have the same number of tables as defined', () => {
        return connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {})
            .then(result => {
                return assert.equal(result.length, standardDbTables)
            })
    })
    it('should teardown correctly', () => {
        return connect.execScriptAsync(downDb)
            .then(() => connect.queryAsync("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;", {}))
            .then(result => {
                return assert.equal(result.length, 0)
            })
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