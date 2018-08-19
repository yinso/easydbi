import * as Promise from 'bluebird';
import * as driver from './driver';
import * as alloc from './allocator';

const drivers : {[key: string]: driver.DriverConstructor} = {};
const pools : {[key: string]: alloc.BaseAllocator} = {};

export function register(type : string, driver : driver.DriverConstructor) {
    drivers[type] = driver;
}

export function hasType(type : string) : driver.DriverConstructor {
    if (drivers.hasOwnProperty(type)) {
        return drivers[type]
    } else {
        throw new Error(`UnknownDriverType: ${type}`)
    }
}

export function getType(type : string) : driver.DriverConstructor {
    if (!drivers.hasOwnProperty(type)) {
        throw new Error(`UnknownDriverType: ${type}`)
    }
    return drivers[type];
}

export function hasSetup(key: string) : boolean {
    return pools.hasOwnProperty(key);
}

export interface SetupOptions {
    type: string;
    options: driver.DriverOptions;
    pool?: {
        min?: number;
        max?: number;
    }
}

export function setup(key : string, options : SetupOptions) {
    if (pools.hasOwnProperty(key)) {
        throw new Error(`Duplicatesetup: ${key}`)
    }
    let driver = getType(options.type)
    if (options.pool) {
        pools[key] = new alloc.PoolAllocator(key, driver, options.options);
    } else {
        pools[key] = new alloc.BaseAllocator(key, driver, options.options);
    }
}

export function tearDown(key : string) {
    if (pools.hasOwnProperty(key)) {
        delete pools[key]
    }
}

export function getPool(key : string) {
    if (pools.hasOwnProperty(key)) {
        return pools[key]
    } else {
        throw new Error(`UnknownDriverSpec: ${key}`)
    }
}

export function connectAsync(key: string) : Promise<driver.Driver> {
    return Promise.try(() => getPool(key))
        .then((driver) => driver.connectAsync())
}

export function connect(key : string, cb : driver.ConnectCallback) {
    return connectAsync(key)
        .then((driver) => cb(null, driver))
        .catch(cb);
}

export function load(key: string, module : {[key: string] : any}) {
    Object.keys(module).forEach((call) => {
        prepare(key, call, module[call]);
    })
}

export function prepare(key: string, call : string, options : any) {
    let driver = getPool(key);
    driver.prepare(call, options);
}
