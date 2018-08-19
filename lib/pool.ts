import * as Promise from 'bluebird';
import { Driver , DriverOptions, DriverConstructor, ConnectCallback, Allocator, NoResultCallback, ResultRecord , normalize , QueryArgs , ResultSetCallback } from './driver';
import { EventEmitter } from 'events';

import * as pool from 'generic-pool';
import { resolve } from 'path';

export type PrepareOptions = Function |
    {
        query: string;
    } |
    {
        exec: string;
    };

export class NoPoolAllocator implements Allocator {
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

export class Pool<T> extends EventEmitter {
    readonly maker: () => Promise<T>;
    readonly total : T[];
    readonly available : T[];
    readonly min : number;
    readonly max : number;
    readonly waitQueue : WaitForCallback<T>[];
    constructor(maker : () => Promise<T>, min : number = 0, max : number = Infinity) {
        super();
        this.maker = maker;
        this.total = [];
        this.available = [];
        this.min = min;
        this.max = max;
        this.waitQueue = [];
        for (var i = 0; i < min; ++i) {
            this.maker()
                .then((item) => {
                    this.total.push(item)
                })
        }
        this.on('available', (item) => {
            this._resolveWaitFor(item);
        })
    }

    acquire(cb : WaitForCallback<T>) : void {
        if (this.total.length <= this.max) {
            this.maker()
                .then((item) => {
                    this.total.push(item)
                    cb(null, item);
                })
                .catch(cb)
        } else if (this.available.length > 0) {
            let item = this.available.shift()
            if (item) {
                cb(null, item);
            } else {
                this._pushWaitFor(cb);
            }
        } else {
            this._pushWaitFor(cb);
        }
    }

    release(item : T) : void {
        this.available.push(item);
        this.emit('available', item);
    }

    private _pushWaitFor(cb : WaitForCallback<T>) {
        this.waitQueue.push(cb);
    }

    private _resolveWaitFor(item : T) : void {
        if (this.waitQueue.length > 0) {
            let waitFor = this.waitQueue.shift();
            if (waitFor) {
                this.available.shift();
                waitFor(null, item)
            } else {
                // NO OP
                //this.available.push(item);
            }
        } else {
            // NO OP
            //this.available.push(item);
        }
    }
}

// this driver is going to share a particular pool?
// or that the pool is going to return a 
export class PoolAllocator extends NoPoolAllocator  {
    private _pool : pool.Pool<Driver>;
    constructor(key : string, driver : DriverConstructor, options : DriverOptions) {
        super(key, driver, options);
        this._pool = pool.createPool({
            create: () => Promise.resolve(new driver(key, options)),
            destroy: (client) => client.disconnectAsync()
        }, options.pool || { min : 0, max : Infinity })
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
