/**
 * A "Lazily-instantiated" driver. It doesn't connect until it tries to query.
 */
import * as driver from './driver';
import * as Promise from 'bluebird';
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as DBI from './dbi';
import { ExplicitAny } from './base';

export interface LazyDriverOptions extends driver.DriverOptions {
    driver: driver.DriverConstructor;
    driverOptions : driver.DriverOptions;
}

export function isLazyDriverOptions(v : ExplicitAny) : v is LazyDriverOptions {
    return driver.isDriverOptions(v) &&
        typeof((v as ExplicitAny).driver) === 'function' &&
        driver.isDriverOptions((v as ExplicitAny).driverOptions);
}

// strictly speaking I want this to be passed in...
export class LazyDriver extends driver.Driver {
    readonly driver : driver.DriverConstructor;
    readonly driverOptions : driver.DriverOptions
    private readonly _inner : driver.Driver;
    private _connected : boolean;
    constructor(key : string, options : driver.DriverOptions) {
        super(key, options)
        this._connected = false;
        if (isLazyDriverOptions(options)) {
            this.driver = options.driver;
            this.driverOptions = options.driverOptions;
            this._inner = new this.driver(key, this.driverOptions)
        } else {
            throw new Error(`SerializeDriver.ctor:InvalidSerializeDriverOptions`);
        }
    }

    connectAsync() : Promise<LazyDriver> {
        return Promise.resolve(this);
    }

    isConnected() {
        return this._connected;
    }

    queryAsync(query : driver.QueryType, args : driver.QueryArgs = {}) : Promise<driver.ResultRecord[]> {
        if (this._connected) {
            return this._inner.queryAsync(query, args);
        } else {
            return this._inner.connectAsync()
                .then(() => {
                    this._connected = true;
                    console.log('********************* LazyDriver.queryAsync.connected', query, args);
                    return this._inner.queryAsync(query, args);
                });
        }
    }

    execAsync(query : driver.QueryType, args : driver.QueryArgs = {}) : Promise<void> {
        if (this._connected) {
            return this._inner.execAsync(query, args);
        } else {
            return this._inner.connectAsync()
                .then(() => {
                    this._connected = true;
                    console.log('********************* LazyDriver.execAsync.connected', query, args);
                    return this._inner.execAsync(query, args);
                });
        }
    }

    disconnectAsync() : Promise<void> {
        if (this._connected) {
            return this._inner.disconnectAsync()
                .then(() => {
                    console.log('********************* LazyDriver.disconnectAsync.disconnected');
                    this._connected = false;
                })
        } else {
            return Promise.resolve();
        }
    }
}

DBI.register('lazy', LazyDriver);
