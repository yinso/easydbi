import * as Promise from 'bluebird';
import { Driver , DriverOptions, DriverConstructor, ConnectCallback, Allocator, NoResultCallback, ResultRecord , normalize , QueryArgs , ResultSetCallback } from './driver';
import { EventEmitter } from 'events';

import * as pool from './pool-wrapper';

export type PrepareOptions = Function |
    {
        query: string;
    } |
    {
        exec: string;
    };

export class BaseAllocator implements Allocator {
    readonly key : string;
    readonly options : DriverOptions;
    readonly _Driver: DriverConstructor;
    constructor(key : string, driver : DriverConstructor, options : DriverOptions) {
        this.key = key;
        this.options = options;
        this._Driver = driver;
    }

    connect(cb : ConnectCallback) : void {
        this.connectAsync()
            .then((conn) => cb(null, conn))
            .catch(cb)
    }

    connectAsync() : Promise<Driver> {
        return Promise.try(() => new this._Driver(this.key, this.options))
            .then((conn) => conn.connectAsync())
    }

    prepare (call : string, options : any) {
        console.log('****** Pool.prepare', call, options)
        if (typeof(options) === 'function') {
            this._Driver.prototype[call] = options;
            this._Driver.prototype[`${call}Async`] =function (args : QueryArgs = {}) : Promise<ResultRecord[]> {
                return new Promise<ResultRecord[]>((resolve, reject) => {
                    ((this as any)[call] as Function)(args, (err : Error | null, result ?:ResultRecord[]) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(result)
                        }
                    })
                });
            };

        } else if (typeof(options as any).query === 'string') {
            this._prepareQuery(call, options.query);
        } else if (typeof(options as any).exec === 'string') {
            this._prepareExec(call, options.exec);
        }
    }

    _prepareQuery(call : string, query : string) {
        let callAsync = `${call}Async`;
        let callAsyncProc = function (args : QueryArgs = {}) : Promise<ResultRecord[]> {
            return (this as Driver).queryAsync(query, args);
        }
        this._Driver.prototype[callAsync] = callAsyncProc;
        this._Driver.prototype[call] = function() {
            let [ args, cb ] = normalize<ResultSetCallback>(arguments[0], arguments[1]);
            this[callAsync](args)
                .then((records : ResultRecord[]) => cb(null, records))
                .catch(cb)
        }
    }

    _prepareExec(call : string, query : string) {
        let callAsync = `${call}Async`;
        let callAsyncProc = function (args : QueryArgs = {}) : Promise<void> {
            return (this as Driver).execAsync(query, args);
        }
        this._Driver.prototype[callAsync] = callAsyncProc;
        this._Driver.prototype[call] = function() {
            let [ args, cb ] = normalize<NoResultCallback>(arguments[0], arguments[1]);
            this[callAsync](args)
                .then(() => cb(null))
                .catch(cb)
        }
    }
}

export type WaitForCallback<T> = (err : Error | null, result ?: T) => void;

// this driver is going to share a particular pool?
// or that the pool is going to return a 
export class PoolAllocator extends BaseAllocator  {
    private _pool : pool.Pool<Driver>;
    constructor(key : string, driver : DriverConstructor, options : DriverOptions) {
        super(key, driver, options);
        let poolOptions = {
            min : options.pool ? options.pool.min || 0 : 0,
            max : options.pool ? options.pool.max || Infinity : Infinity
        };
        this._pool = pool.createPool({
            create: () => {
                try {
                    let conn = new driver(key, options);
                    return conn.connectAsync();
                } catch (e) {
                    return Promise.reject(e)
                }
            },
            destroy: (client) => client.disconnectAsync()
        }, poolOptions)
    }

    connectAsync() : Promise<Driver> {
        return new Promise<Driver>((resolve, reject) => {
            return this._pool.acquire()
                .then((driver) => {
                    driver.disconnectAsync = () => {
                        return new Promise((resolve, reject) => {
                            this._pool.release(driver)
                                .then(resolve, reject)
                        })
                    }
                    resolve(driver)
                }, reject)
        })
    }
}
