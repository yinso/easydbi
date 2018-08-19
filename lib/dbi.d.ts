import * as Promise from 'bluebird';
import * as driver from './driver';
export declare function register<T extends driver.Driver>(type: string, driver: driver.DriverConstructor<T>): void;
export declare function hasType<T extends driver.Driver>(type: string): driver.DriverConstructor<T>;
export declare function getType<T extends driver.Driver>(type: string): driver.DriverConstructor<T>;
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
export declare function getPool(key: string): any;
export declare function connectAsync<T extends driver.Driver>(key: string): Promise<T>;
export declare function connect(key: string, cb: driver.ConnectCallback): Promise<void>;
export declare function load(key: string, module: {
    [key: string]: any;
}): void;
export declare function prepare(key: string, call: string, options: any): void;
