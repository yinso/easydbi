import * as driver from './driver';
import * as Promise from 'bluebird';
import * as fs from 'fs-extra-promise';
import * as path from 'path';

export interface SerializeDriverOptions extends driver.DriverOptions {
    outputDir: string;
    inner : driver.Driver
}

// strictly speaking I want this to be passed in...
export class SerializeDriver extends driver.Driver {
    readonly inner : driver.Driver;
    readonly outputDir : string;
    constructor(key : string, options : SerializeDriverOptions) {
        super(key, options)
        this.inner = options.inner;
        this.outputDir = options.outputDir;
    }

    connectAsync() : Promise<SerializeDriver> {
        return this.inner.connectAsync()
            .then(() => this)
    }

    isConnected() {
        return this.inner.isConnected();
    }

    queryAsync(query : driver.QueryType, args : driver.QueryArgs = {}) : Promise<driver.ResultRecord[]> {
        return this.inner.queryAsync(query, args);
    }

    execAsync(query : driver.QueryType, args : driver.QueryArgs = {}) : Promise<void> {
        return this.inner.execAsync(query, args)
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
            return this.inner.queryAsync(`select * from ${table}`)
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
        return this.inner.disconnectAsync();
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
