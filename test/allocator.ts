import * as Promise from 'bluebird';
import { suite , test , timeout } from 'mocha-typescript';
import { MockDriver } from './driver';
import * as assert from 'assert';
import * as pool from '../lib/allocator';
import * as driver from '../lib/driver';

@suite class NoPoolTest {
    pool : pool.BaseAllocator<MockDriver>;
    drivers : driver.Driver[];
    constructor() {
        this.pool = new pool.BaseAllocator('test', MockDriver, {})
        this.drivers = []
    }

    @test canConnect() {
        return this.pool.connectAsync()
            .then((driver) => {
                this.drivers.push(driver)
            })
    }

    @test canDisconnect() {
        return Promise.all(this.drivers.map((driver) => driver.disconnectAsync()))
            .then(() => {})
    }
}

@suite class PoolTest {
    pool : pool.PoolAllocator<MockDriver>;
    drivers : driver.Driver[];
    constructor() {
        this.pool = new pool.PoolAllocator('test', MockDriver, { pool: { min : 0, max: 10 }})
        this.drivers = []
    }

    @test canConnect() {
        return this.pool.connectAsync()
            .then((driver) => {
                this.drivers.push(driver)
            })
    }

    @test canDisconnect() {
        return Promise.all(this.drivers.map((driver) => driver.disconnectAsync()))
            .then(() => {})
    }
}
