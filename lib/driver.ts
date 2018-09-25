import * as Promise from 'bluebird';
import { EventEmitter } from 'events';
import * as fs from 'fs-extra-promise';
import * as util from './util';
import { ExplicitAny } from './base';

export interface PoolOptions {
    min ?: number;
    max ?: number;
}

export function isPoolOptions(v : ExplicitAny) : v is PoolOptions {
    return !!v && (v.min ? typeof(v.min) === 'number' : true) && (v.max ? typeof(v.max) === 'number' : true);
}

export interface DriverOptions {
    pool ?: PoolOptions;
    [key: string]: ExplicitAny;
}

export function isDriverOptions(v : ExplicitAny) : v is DriverOptions {
    return !!v && (v.pool ? isPoolOptions(v.pool) : true);
}

export interface QueryArgs {
    [key: string]: any;
}

export interface ResultRecord {
    [key: string]: any;
}
  
export type NoResultCallback = (err : Error | null) => void;

export type ResultRecordCallback = (err : Error | null, result ?: ResultRecord) => void;

export type ResultSetCallback = (err : Error | null, result ?: ResultRecord[]) => void;
  
export type ConnectCallback = (err : Error | null, driver ?: Driver) => void;

export type QueryType = string;

export interface Allocator {
    connect(cb : ConnectCallback) : void;
    connectAsync() : Promise<Driver>;
}

export abstract class Driver extends EventEmitter implements Allocator {
    readonly id : number;
    readonly pool : boolean;
    readonly key: string;
    readonly options: DriverOptions;
    constructor(key: string, options: DriverOptions) {
        super();
        this.key = key;
        this.options = options;
        Driver.id++;
        this.id = Driver.id;
        this.pool = true;
    }

    connect(cb : ConnectCallback) : void {
        this.connectAsync()
            .then((driver) => cb(null, driver))
            .catch(cb)
    }

    abstract isConnected() : boolean;

    driverName() { return ((<any>this).constructor).name; }

    loadScript(filePath : string, inTransaction : boolean, cb : NoResultCallback) : void {
        this.loadScriptAsync(filePath, inTransaction)
            .then(() => cb(null))
            .catch(cb)
    }

    query(query : QueryType, cb : ResultSetCallback) : void;
    query(query : QueryType, args :QueryArgs, cb : ResultSetCallback) : void;
    query(query : QueryType , next : any, last ?: any) : void {
        let [ args , cb ] = normalize<ResultSetCallback>(next, last);
        this.queryAsync(query, args)
            .then((records) => cb(null, records))
            .catch(cb);
    }

    queryOne(query : QueryType, cb : ResultRecordCallback) : void;
    queryOne(query : QueryType, args :QueryArgs, cb : ResultRecordCallback) : void;
    queryOne(query : QueryType, next : any, last ?: any) : void {
        let [ args , cb ] = normalize<ResultRecordCallback>(next, last);
        this.queryOneAsync(query, args)
            .then((record) => cb(null, record))
            .catch(cb)
    }

    exec(query : QueryType, cb : NoResultCallback) : void;
    exec(query : QueryType, args : QueryArgs , cb : NoResultCallback) : void;
    exec(query : QueryType, next : any, last ?: any) : void {
        let [ args , cb ] = normalize<NoResultCallback>(next, last);
        this.execAsync(query, args)
            .then(() => cb(null))
            .catch(cb)
    }

    begin(cb : NoResultCallback) : void {
        this.beginAsync()
            .then(() => cb(null))
            .catch(cb)
    }

    commit(cb : NoResultCallback) : void {
        this.commitAsync()
            .then(() => cb(null))
            .catch(cb)
    }

    rollback(cb : NoResultCallback) : void {
        this.rollbackAsync()
            .then(() => cb(null))
            .catch(cb)
    }

    disconnect(cb : NoResultCallback) : void {
        this.disconnectAsync()
            .then(() => cb(null))
            .catch(cb)
    }

    close(cb : NoResultCallback) : void {
        this.closeAsync()
            .then(() => cb(null))
            .catch(cb)
    }

    execScript(filePath : string, cb : NoResultCallback) : void {
        this.execScriptAsync(filePath)
            .then(() => cb(null))
            .catch(cb)
    }

    abstract connectAsync() : Promise<Driver>;

    abstract queryAsync(query : QueryType, args ?: QueryArgs) : Promise<ResultRecord[]>;

    queryOneAsync(query : QueryType, args ?: QueryArgs) : Promise<ResultRecord> {
        return this.queryAsync(query, args)
            .then((records) => {
                if (records.length == 0) {
                    throw new Error(`ExpectOneRecord`)
                } else {
                    return records[0]
                }
            })
    }

    abstract execAsync(query : QueryType, args ?: QueryArgs) : Promise<void>;

    beginAsync() : Promise<void> {
        return this.execAsync('begin')
    }
    commitAsync() : Promise<void> {
        return this.execAsync('commit')
    }
    rollbackAsync() : Promise<void> {
        return this.execAsync('rollback')
    }
    abstract disconnectAsync() : Promise<void>;
    closeAsync() : Promise<void> {
        return this.disconnectAsync();
    }
    execScriptAsync(filePath : string) : Promise<void> {
        return fs.readFileAsync(filePath, 'utf8')
            .then((data) => {
                let commentsRemoved = util.removeComments(data)
                let queries = util.splitToQueries(commentsRemoved)
                return Promise.each(queries, (query) => {
                    if (query) return this.execAsync(query);
                })
            })
                .then(() => {})
    }
    loadScriptAsync(filePath : string, inTransaction : boolean = true) : Promise<void> {
        return fs.readFileAsync(filePath, 'utf8')
            .then((data) => {
                let commentsRemoved = util.removeComments(data)
                let queries = util.splitToQueries(commentsRemoved)
                if (inTransaction) {
                    return this.beginAsync()
                        .then(() => {
                            return Promise.each(queries, (query) => {
                                if (query) return this.execAsync(query);
                            })
                                .then(() => {})
                        })
                        .then(() => this.commitAsync())
                        .catch((e) => {
                            return this.rollbackAsync()
                                .then(() => {
                                    throw e
                                })
                                .catch(() => {
                                    throw e
                                })
                        })
                } else {
                    return Promise.each(queries, (query) => {
                        return this.execAsync(query)
                    })
                        .then(() => {})
                }
            })
    }
    private static _id : number = 0;
    static get id() { return this._id }
    static set id(value : number) { this._id = value; }
}

export function normalize<T>(arg : any, next ?: any) : [ QueryArgs , T ] {
    if (typeof(next) === 'function') {
        return [ arg , next ];
    } else {
        return [ {} , arg ]
    }
}

export interface DriverConstructor {
    new(key: string, options: DriverOptions) : Driver;
}
