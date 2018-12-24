import * as Promise from 'bluebird';
import { suite , test , timeout } from 'mocha-typescript';
import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs-extra-promise'
import * as DBI from '../lib/dbi';
import { Driver } from '../lib';
import '../lib/lazy-driver';
import * as sqljs from '../lib/sqljs-driver';

let conn : Driver;

DBI.setup('test-lazy', {
    type: 'lazy',
    options: {
        driver: sqljs.SqljsDriver,
        driverOptions: {
            pool: {
                min: 2,
                max: 10
            }
        },
    },
})

@suite
class LazyDriverTest {
    @test
    canConnect() {
        return DBI.connectAsync('test-lazy')
            .then((driver) => {
                conn = driver
                assert.deepEqual(false, conn.isConnected());
            })
            .then(() => {
                return conn.disconnectAsync();
            })
    }

    @test
    canCreateTable() {
        return conn.execAsync(`create table foo (c1 int, c2 int)`)
    }

    @test
    canInsertRecords() {
        return conn.execAsync(`insert into foo values (1, 2), (3, 4)`)
    }

    @test
    canUpdateRecords() {
        return conn.execAsync(`update foo set c1 = 2 where c2 = 2`)
    }

    @test
    canDeleteRecords() {
        return conn.execAsync(`delete from foo where c2 = 2`)
    }

    @test
    canDropTable() {
        conn.execAsync(`drop table foo`, {})
    }

    @test
    canDisconnect() {
        return conn.disconnectAsync()
    }
}
