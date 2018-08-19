import * as Promise from 'bluebird';
import { suite , test , timeout } from 'mocha-typescript';
import * as driver from '../lib/driver';
import * as assert from 'assert';
import { inspect } from 'util';

export class MockDriver extends driver.Driver {
    connectAsync() : Promise<MockDriver> {
        return Promise.resolve(this);
    }

    isConnected() : boolean { return true }

    queryAsync(stmt : driver.QueryType, args : driver.QueryArgs = {}) : Promise<driver.ResultRecord[]> {
        return Promise.resolve([
            { a : 1 , b : 2}
        ])
    }

    execAsync(stmt : driver.QueryType, args : driver.QueryArgs = {}) : Promise<void> {
        return Promise.resolve();
    }

    disconnectAsync() : Promise<void> {
        return Promise.resolve();
    }
}

@suite class DriverTest {
    driver : MockDriver;
    constructor() {
        this.driver = new MockDriver('test', {})
    }

    @test canConnect() {
        return this.driver.connectAsync();
    }

    @test isConnected() {
        assert.equal(this.driver.isConnected(), true)
    }

    @test queryAsyncWorks() {
        return this.driver.queryAsync('test')
            .then((records) => {
                assert.deepEqual([{ a : 1, b : 2}], records)
            })
    }

    @test execAsyncWorks() {
        return this.driver.execAsync('test')
    }

    @test canDisconnect() {
        return this.driver.disconnectAsync()
    }
}
