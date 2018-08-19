import * as Promise from 'bluebird';
import { Driver, DriverOptions, DriverConstructor, ConnectCallback, Allocator } from './driver';
export declare type PrepareOptions = Function | {
    query: string;
} | {
    exec: string;
};
export declare class BaseAllocator<T extends Driver> implements Allocator {
    readonly key: string;
    readonly options: DriverOptions;
    readonly _Driver: DriverConstructor<T>;
    constructor(key: string, driver: DriverConstructor<T>, options: DriverOptions);
    connect(cb: ConnectCallback): void;
    connectAsync(): Promise<T>;
    prepare(call: string, options: any): void;
    _prepareQuery(call: string, query: string): void;
    _prepareExec(call: string, query: string): void;
}
export declare type WaitForCallback<T> = (err: Error | null, result?: T) => void;
export declare class PoolAllocator<T extends Driver> extends BaseAllocator<T> {
    private _pool;
    constructor(key: string, driver: DriverConstructor<T>, options: DriverOptions);
    connectAsync(): Promise<T>;
}
