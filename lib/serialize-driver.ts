import * as driver from './driver';
import * as Promise from 'bluebird';
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as DBI from './dbi';
import { ExplicitAny } from './base';

export interface SerializeDriverOptions extends driver.DriverOptions {
    outputDir: string;
    driver: driver.DriverConstructor;
    driverOptions : driver.DriverOptions;
}

export function isSerializeDriverOptions(v : ExplicitAny) : v is SerializeDriverOptions {
    return driver.isDriverOptions(v) &&
        typeof((v as ExplicitAny).outputDir) === 'string' &&
        typeof((v as ExplicitAny).driver) === 'function' &&
        driver.isDriverOptions((v as ExplicitAny).driverOptions);
}

// strictly speaking I want this to be passed in...
export class SerializeDriver extends driver.Driver {
    readonly outputDir : string;
    readonly driver : driver.DriverConstructor;
    readonly driverOptions : driver.DriverOptions
    private readonly _inner : driver.Driver;
    constructor(key : string, options : driver.DriverOptions) {
        super(key, options)
        if (isSerializeDriverOptions(options)) {
            this.outputDir = options.outputDir;
            this.driver = options.driver;
            this.driverOptions = options.driverOptions;
            this._inner = new this.driver(key, this.driverOptions)
        } else {
            throw new Error(`SerializeDriver.ctor:InvalidSerializeDriverOptions`);
        }
    }

    connectAsync() : Promise<SerializeDriver> {
        return this._inner.connectAsync()
            .then(() => this)
    }

    isConnected() {
        return this._inner.isConnected();
    }

    queryAsync(query : driver.QueryType, args : driver.QueryArgs = {}) : Promise<driver.ResultRecord[]> {
        return this._inner.queryAsync(query, args);
    }

    execAsync(query : driver.QueryType, args : driver.QueryArgs = {}) : Promise<void> {
        return this._inner.execAsync(query, args)
            .then(() => {
                let affectedTable = getQueryTable(query);
                if (affectedTable) {
                    return this._serializeTable(affectedTable, isDropTableQuery(query));
                } else {
                    return;
                }
            })
    }

    private _serializeTable(table : string, isDropTable : string | false) : Promise<void> {
        let filePath = this._getTablePath(table)
        if (isDropTable) {
            return fs.unlinkAsync(filePath)
        } else {
            return this._inner.queryAsync(`select * from ${table}`)
            .then((results) => {
                return fs.writeFileAsync(filePath, JSON.stringify(results, null, 2))
            })
            .catch((e) => {
                console.log('*********** SerializeDriver.error', e)
                throw e
            })
        }
    }

    private _getTablePath(table : string) : string {
        return path.join(this.outputDir, `${table}.json`)
    }

    disconnectAsync() : Promise<void> {
        return this._inner.disconnectAsync();
    }
}

export function isInsertQuery(query : string) : string | false {
    let match = query.match(/^\s*insert\s+(into\s+)?(\w+)/i)
    if (match) {
        return match[2];
    } else {
        return false
    }
}

export function isUpdateQuery(query : string) : string | false {
    let match = query.match(/^\s*update\s+(\w+)/i)
    if (match) {
        return match[1];
    } else {
        return false
    }
}

export function isDeleteQuery(query : string) : string | false {
    let match = query.match(/^\s*delete\s+(from\s+)?(\w+)/i)
    if (match) {
        return match[2];
    } else {
        return false
    }
}

export function isCreateTableQuery(query : string) : string | false {
    let match = query.match(/^\s*create\s+table\s+(\w+)/i)
    if (match) {
        return match[1];
    } else {
        return false
    }
}

export function isAlterTableQuery(query : string) : string | false {
    let match = query.match(/^\s*alter\s+table\s+(\w+)/i)
    if (match) {
        return match[1];
    } else {
        return false
    }
}

export function isDropTableQuery(query : string) : string | false {
    let match = query.match(/^\s*drop\s+table\s+(\w+)/i)
    if (match) {
        return match[1];
    } else {
        return false
    }
}

export function getQueryTable(query : driver.QueryType) : string | false {
    if (typeof(query) === 'string') {
        let isInsert = isInsertQuery(query);
        let isUpdate = isUpdateQuery(query);
        let isDelete = isDeleteQuery(query);
        let isCreateTable = isCreateTableQuery(query);
        let isAlterTable = isAlterTableQuery(query);
        let isDropTable = isDropTableQuery(query)
        return isInsert || isUpdate || isDelete || isCreateTable || isAlterTable || isDropTable;
    } else {
        throw new Error(`UnknownQueryType: ${query}`)
    }
}

DBI.register('serialize', SerializeDriver);
