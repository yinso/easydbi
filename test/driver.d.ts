import * as Promise from 'bluebird';
import * as driver from '../lib/driver';
export declare class MockDriver extends driver.Driver {
    connectAsync(): Promise<driver.Driver>;
    isConnected(): boolean;
    queryAsync(stmt: driver.QueryType, args?: driver.QueryArgs): Promise<driver.ResultRecord[]>;
    execAsync(stmt: driver.QueryType, args?: driver.QueryArgs): Promise<void>;
    disconnectAsync(): Promise<void>;
}
