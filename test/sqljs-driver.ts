import * as Promise from 'bluebird';
import { suite , test , timeout } from 'mocha-typescript';
import * as assert from 'assert';
import { inspect } from 'util';
import * as sql from '../lib/sqljs-driver';
import { Driver } from '../lib';
import * as DBI from '../lib/dbi';

var conn : Driver;

DBI.setup('test-sqljs', {
    type: 'sqljs',
    options: {}
})

@suite class SqlJsTest {
    @test
    canConnect() {
        return DBI.connectAsync('test-sqljs')
            .then((driver) => {
                conn = driver
            })
    }

    @test
    canCreateTable() {
        return conn.execAsync('create table test(c1 int, c2 int)')
            .then(() => conn.queryAsync('select * from test'))
    }

    @test
    canInsert() {
        return conn.execAsync('insert into test values (1, 2), (3, 4)')
    }

    @test
    canSelect() {
        return conn.queryAsync('select * from test')
            .then((records) => {
                assert.deepEqual([
                    {
                        c1: 1,
                        c2: 2
                    },
                    {
                        c1: 3,
                        c2: 4
                    }
                ], records)
            })
    }

    @test
    canGetSchema() {
        return conn.queryAsync('select * from sqlite_master', {})
            .then((results) => {
                assert.deepEqual([
                    {
                        type: 'table',
                        name: 'test',
                        tbl_name: 'test',
                        rootpage: 2,
                        sql: `CREATE TABLE test(c1 int, c2 int)`
                    },
                ], results)
            })
    }

    @test
    canDisconnect() {
        return conn.disconnectAsync()
    }
}
