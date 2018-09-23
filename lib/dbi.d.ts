import * as Promise from 'bluebird';
import * as driver from './driver';
import * as alloc from './allocator';
export declare function register(type: string, driver: driver.DriverConstructor): void;
export declare function hasType(type: string): driver.DriverConstructor;
export declare function getType(type: string): driver.DriverConstructor;
export declare function hasSetup(key: string): boolean;
export interface SetupOptions {
    type: string;
    options: driver.DriverOptions;
    pool?: {
        min?: number;
        max?: number;
    };
}
export declare function setup(key: string, options: SetupOptions): void;
export declare function tearDown(key: string): void;
export declare function getPool(key: string): alloc.BaseAllocator;
export declare function connectAsync(key: string): Promise<driver.Driver>;
export declare function connect(key: string, cb: driver.ConnectCallback): Promise<void>;
export declare function load(key: string, module: {
    [key: string]: any;
}): void;
export declare function prepare(key: string, call: string, options: any): void;
