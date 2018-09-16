import * as driver from './driver';
import { ExplicitAny } from './base';
export interface ArrayifyOptions {
    key: string | Function;
    merge: boolean;
}
export declare function arrayify(stmt: driver.QueryType, args: driver.QueryArgs, options?: ArrayifyOptions): [string, ExplicitAny[]];
export declare function escape(arg: string | Date | boolean | number): string;
