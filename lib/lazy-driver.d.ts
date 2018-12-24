/**
 * A "Lazily-instantiated" driver. It doesn't connect until it tries to query.
 */
import * as driver from './driver';
import * as Promise from 'bluebird';
import { ExplicitAny } from './base';
export interface LazyDriverOptions extends driver.DriverOptions {
    driver: driver.DriverConstructor;
    driverOptions: driver.DriverOptions;
}
export declare function isLazyDriverOptions(v: ExplicitAny): v is LazyDriverOptions;
export declare class LazyDriver extends driver.Driver {
    readonly driver: driver.DriverConstructor;
    readonly driverOptions: driver.DriverOptions;
    private readonly _inner;
    private _connected;
    constructor(key: string, options: driver.DriverOptions);
    connectAsync(): Promise<LazyDriver>;
    isConnected(): boolean;
    queryAsync(query: driver.QueryType, args?: driver.QueryArgs): Promise<driver.ResultRecord[]>;
    execAsync(query: driver.QueryType, args?: driver.QueryArgs): Promise<void>;
    disconnectAsync(): Promise<void>;
}
