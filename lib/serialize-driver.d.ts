import * as driver from './driver';
import * as Promise from 'bluebird';
import { ExplicitAny } from './base';
export interface SerializeDriverOptions extends driver.DriverOptions {
    outputDir: string;
    driver: driver.DriverConstructor;
    driverOptions: driver.DriverOptions;
}
export declare function isSerializeDriverOptions(v: ExplicitAny): v is SerializeDriverOptions;
export declare class SerializeDriver extends driver.Driver {
    readonly outputDir: string;
    readonly driver: driver.DriverConstructor;
    readonly driverOptions: driver.DriverOptions;
    private readonly _inner;
    constructor(key: string, options: driver.DriverOptions);
    connectAsync(): Promise<SerializeDriver>;
    isConnected(): boolean;
    queryAsync(query: driver.QueryType, args?: driver.QueryArgs): Promise<driver.ResultRecord[]>;
    execAsync(query: driver.QueryType, args?: driver.QueryArgs): Promise<void>;
    private _serializeTable;
    private _getTablePath;
    disconnectAsync(): Promise<void>;
}
export declare function isInsertQuery(query: string): string | false;
export declare function isUpdateQuery(query: string): string | false;
export declare function isDeleteQuery(query: string): string | false;
export declare function isCreateTableQuery(query: string): string | false;
export declare function isAlterTableQuery(query: string): string | false;
export declare function isDropTableQuery(query: string): string | false;
export declare function getQueryTable(query: driver.QueryType): string | false;
