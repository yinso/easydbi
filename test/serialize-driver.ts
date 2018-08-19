import * as Promise from 'bluebird';
import { suite , test , timeout } from 'mocha-typescript';
import * as assert from 'assert';
import * as serialize from '../lib/serialize-driver';
import * as sqljs from '../lib/sqljs-driver';
import * as path from 'path';
import * as fs from 'fs-extra-promise'
import * as DBI from '../lib/dbi';

describe('SerializeHelperTest', () => {
    let cases : {
        input: string;
        expected: string | false;
        name ?: string;
    }[] = [
        {
            input: `create table foo (c1 int, c2 int)`,
            expected: `foo`,
        },
        {
            input: `insert into foo values (1, 2), (3, 4)`,
            expected: 'foo'
        },
        {
            input: `insert foo values (1, 2), (3, 4)`,
            expected: 'foo'
        },
        {
            input: `update foo set c1 = 2 where c2 = 2`,
            expected: 'foo'
        },
        {
            input: `delete from foo where c2 = 2`,
            expected: 'foo'
        },
        {
            input: `delete foo where c2 = 2`,
            expected: 'foo'
        },
        {
            input: `alter table foo add column c2 int default null`,
            expected: `foo`
        },
        {
            input: `drop table foo`,
            expected : `foo`
        }
    ]

    cases.forEach(({name, input , expected }) => {
        it(name || `can get table name from: ${input}`, () => {
            let actual = serialize.getQueryTable(input)
            assert.deepEqual(expected, actual)
        })
    })
})

let conn : serialize.SerializeDriver<sqljs.SqljsDriver>;

let outputDir = path.join(__dirname, '..', 'run')
let fooTablePath = path.join(outputDir, `foo.json`)

DBI.setup('test-serialize', {
    type: 'serialize',
    options: {
        driver: sqljs.SqljsDriver,
        driverOptions: {},
        outputDir: outputDir
    }
})

@suite
class SerializeDriverTest {
    @test
    canConnect() {
        return DBI.connectAsync<serialize.SerializeDriver<sqljs.SqljsDriver>>('test-serialize')
            .then((driver) => {
                conn = driver;

            })
        conn = new serialize.SerializeDriver('test', {
            driver: sqljs.SqljsDriver,
            driverOptions: {},
            outputDir: outputDir
        })
        return conn.connectAsync()
    }

    @test
    canCreateTable() {
        return conn.execAsync(`create table foo (c1 int, c2 int)`)
            .then(() => {
                return fs.existsAsync(fooTablePath)
                    .then((result) => assert.equal(true, result))
            })
    }

    @test
    canInsertRecords() {
        return conn.execAsync(`insert into foo values (1, 2), (3, 4)`)
            .then(() => {
                return fs.readFileAsync(fooTablePath, 'utf8')
                    .then((data) => JSON.parse(data))
                    .then((data) => {
                        assert.deepEqual([
                            { c1: 1, c2: 2 },
                            { c1: 3, c2: 4 }
                        ], data)
                        return
                    })
            })
    }

    @test
    canUpdateRecords() {
        return conn.execAsync(`update foo set c1 = 2 where c2 = 2`)
            .then(() => {
                return fs.readFileAsync(fooTablePath, 'utf8')
                    .then((data) => JSON.parse(data))
                    .then((data) => assert.deepEqual([
                        { c1: 2, c2: 2 },
                        { c1: 3, c2: 4 }
                    ], data))
            })
    }

    @test
    canDeleteRecords() {
        return conn.execAsync(`delete from foo where c2 = 2`)
            .then(() => {
                return fs.readFileAsync(fooTablePath, 'utf8')
                    .then((data) => JSON.parse(data))
                    .then((records) => {
                        assert.deepEqual([
                            { c1: 3, c2: 4 }
                        ], records)
                        return
                    })
            })
    }

    @test
    canDropTable() {
        conn.execAsync(`drop table foo`, {})
            .then(() => {
                return fs.existsAsync(fooTablePath)
                    .then((result) => assert.equal(false, result))
            })
    }

    @test
    canDisconnect() {
        return conn.disconnectAsync()
    }
}