import * as driver from './driver';
import * as Promise from 'bluebird';
export interface SerializeDriverOptions extends driver.DriverOptions {
    outputDir: string;
    inner: driver.Driver;
}
export declare class SerializeDriver extends driver.Driver {
    readonly inner: driver.Driver;
    readonly outputDir: string;
    constructor(key: string, options: SerializeDriverOptions);
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
