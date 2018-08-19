import * as driver from './driver';
import * as sql from 'sql.js';
import * as Promise from 'bluebird';
export interface SqljsDriverOptions extends driver.DriverOptions {
}
export declare class SqljsDriver extends driver.Driver {
    readonly inner: sql.Database;
    constructor(key: string, options: SqljsDriverOptions);
    connectAsync(): Promise<SqljsDriver>;
    isConnected(): boolean;
    queryAsync(query: driver.QueryType, args?: driver.QueryArgs): Promise<driver.ResultRecord[]>;
    private _mapQueryResult;
    execAsync(query: driver.QueryType, args?: driver.QueryArgs): Promise<void>;
    disconnectAsync(): Promise<void>;
}
