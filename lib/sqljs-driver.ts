import * as driver from './driver';
import * as sql from 'sql.js';
import * as Promise from 'bluebird';
import * as helper from './query-helper';
import * as DBI from './dbi';

export interface SqljsDriverOptions extends driver.DriverOptions {

}

export class SqljsDriver extends driver.Driver {
    readonly inner : sql.Database;
    constructor(key : string, options : SqljsDriverOptions) {
        super(key, options)
        this.inner = new sql.Database();
    }

    connectAsync() : Promise<SqljsDriver> {
        return Promise.resolve(this)
    }

    isConnected() {
        return true
    }

    queryAsync(query : driver.QueryType, args : driver.QueryArgs = {}) : Promise<driver.ResultRecord[]> {
        return new Promise<driver.ResultRecord[]>((resolve, reject) => {
            try {
                let [ normStmt, normArgs ] = helper.arrayify(query, args, { merge: true, key : '?'});
                let results = this.inner.exec(normStmt);
                if (results.length > 0) {
                    resolve(this._mapQueryResult(results[0]))
                } else {
                    resolve([])
                }
            } catch (e) {
                reject(e)
            }
        })
    }

    private _mapQueryResult(result : sql.QueryResults) : driver.ResultRecord[] {
        return result.values.map((record) => {
            return result.columns.reduce((acc, column, i) => {
                acc[column] = record[i];
                return acc;
            }, {} as driver.ResultRecord)
        })
    }

    execAsync(query : driver.QueryType, args : driver.QueryArgs = {}) : Promise<void> {
        return  new Promise<void>((resolve, reject) => {
            try {
                let [ normStmt, normArgs ] = helper.arrayify(query, args, { merge: true, key : '?'});
                this.inner.run(normStmt);
                resolve();
            } catch (e) {
                reject(e)
            }
        })
    }

    disconnectAsync() : Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.inner.close();
                resolve()
            } catch (e) {
                reject(e)
            }
        })
    }
}

DBI.register('sqljs', SqljsDriver);
