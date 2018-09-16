import * as Promise from 'bluebird';
import { ExplicitAny } from './base';
import { Driver, DriverOptions, DriverConstructor, ConnectCallback, Allocator } from './driver';
export declare type PrepareOptions = Function | {
    query: string;
} | {
    exec: string;
};
export declare class BaseAllocator implements Allocator {
    readonly key: string;
    readonly options: DriverOptions;
    readonly _Driver: DriverConstructor;
    constructor(key: string, driver: DriverConstructor, options: DriverOptions);
    connect(cb: ConnectCallback): void;
    connectAsync(): Promise<Driver>;
    prepare(call: string, options: ExplicitAny): void;
    _prepareQuery(call: string, query: string): void;
    _prepareExec(call: string, query: string): void;
}
export declare type WaitForCallback<T> = (err: Error | null, result?: T) => void;
export declare class PoolAllocator extends BaseAllocator {
    private _pool;
    constructor(key: string, driver: DriverConstructor, options: DriverOptions);
    connectAsync(): Promise<Driver>;
}
