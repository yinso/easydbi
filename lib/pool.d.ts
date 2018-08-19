/// <reference types="node" />
import * as Promise from 'bluebird';
import { Driver, DriverOptions, DriverConstructor, ConnectCallback, Allocator } from './driver';
import { EventEmitter } from 'events';
export declare type PrepareOptions = Function | {
    query: string;
} | {
    exec: string;
};
export declare class NoPoolAllocator implements Allocator {
    readonly key: string;
    readonly options: DriverOptions;
    readonly _Driver: DriverConstructor;
    constructor(key: string, driver: DriverConstructor, options: DriverOptions);
    connect(cb: ConnectCallback): void;
    connectAsync(): Promise<Driver>;
    prepare(call: string, options: any): void;
    _prepareQuery(call: string, query: string): void;
    _prepareExec(call: string, query: string): void;
}
export declare type WaitForCallback<T> = (err: Error | null, result?: T) => void;
export declare class Pool<T> extends EventEmitter {
    readonly maker: () => Promise<T>;
    readonly total: T[];
    readonly available: T[];
    readonly min: number;
    readonly max: number;
    readonly waitQueue: WaitForCallback<T>[];
    constructor(maker: () => Promise<T>, min?: number, max?: number);
    acquire(cb: WaitForCallback<T>): void;
    release(item: T): void;
    private _pushWaitFor;
    private _resolveWaitFor;
}
export declare class PoolAllocator extends NoPoolAllocator {
    private _pool;
    constructor(key: string, driver: DriverConstructor, options: DriverOptions);
    connectAsync(): Promise<Driver>;
}
