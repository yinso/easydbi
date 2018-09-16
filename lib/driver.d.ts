/// <reference types="node" />
import * as Promise from 'bluebird';
import { EventEmitter } from 'events';
import { ExplicitAny } from './base';
export interface DriverOptions {
    pool?: {
        min?: number;
        max?: number;
    };
    [key: string]: ExplicitAny;
}
export interface QueryArgs {
    [key: string]: ExplicitAny;
}
export interface ResultRecord {
    [key: string]: ExplicitAny;
}
export declare type NoResultCallback = (err: Error | null) => void;
export declare type ResultRecordCallback = (err: Error | null, result?: ResultRecord) => void;
export declare type ResultSetCallback = (err: Error | null, result?: ResultRecord[]) => void;
export declare type ConnectCallback = (err: Error | null, driver?: Driver) => void;
export declare type QueryType = string;
export interface Allocator {
    connect(cb: ConnectCallback): void;
    connectAsync(): Promise<Driver>;
}
export declare abstract class Driver extends EventEmitter implements Allocator {
    readonly id: number;
    readonly pool: boolean;
    readonly key: string;
    readonly options: DriverOptions;
    constructor(key: string, options: DriverOptions);
    connect(cb: ConnectCallback): void;
    abstract isConnected(): boolean;
    driverName(): any;
    loadScript(filePath: string, inTransaction: boolean, cb: NoResultCallback): void;
    query(query: QueryType, cb: ResultSetCallback): void;
    query(query: QueryType, args: QueryArgs, cb: ResultSetCallback): void;
    queryOne(query: QueryType, cb: ResultRecordCallback): void;
    queryOne(query: QueryType, args: QueryArgs, cb: ResultRecordCallback): void;
    exec(query: QueryType, cb: NoResultCallback): void;
    exec(query: QueryType, args: QueryArgs, cb: NoResultCallback): void;
    begin(cb: NoResultCallback): void;
    commit(cb: NoResultCallback): void;
    rollback(cb: NoResultCallback): void;
    disconnect(cb: NoResultCallback): void;
    close(cb: NoResultCallback): void;
    execScript(filePath: string, cb: NoResultCallback): void;
    abstract connectAsync(): Promise<Driver>;
    abstract queryAsync(query: QueryType, args?: QueryArgs): Promise<ResultRecord[]>;
    queryOneAsync(query: QueryType, args?: QueryArgs): Promise<ResultRecord>;
    abstract execAsync(query: QueryType, args?: QueryArgs): Promise<void>;
    beginAsync(): Promise<void>;
    commitAsync(): Promise<void>;
    rollbackAsync(): Promise<void>;
    abstract disconnectAsync(): Promise<void>;
    closeAsync(): Promise<void>;
    execScriptAsync(filePath: string): Promise<void>;
    loadScriptAsync(filePath: string, inTransaction?: boolean): Promise<void>;
    private static _id;
    static id: number;
}
export declare function normalize<T>(arg: ExplicitAny, next?: ExplicitAny): [QueryArgs, T];
export interface DriverConstructor {
    new (key: string, options: DriverOptions): Driver;
}
