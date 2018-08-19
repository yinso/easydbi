import * as driver from './driver';
export interface ArrayifyOptions {
    key: string | Function;
    merge: boolean;
}
export declare function arrayify(stmt: driver.QueryType, args: driver.QueryArgs, options?: ArrayifyOptions): [string, any[]];
export declare function escape(arg: string | Date | boolean | number): string;
