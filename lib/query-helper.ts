import * as driver from './driver';
import { ExplicitAny } from './base';

export interface ArrayifyOptions {
    key: string | Function;
    merge: boolean;
}

let defaultOptions = {
    key: '?',
    merge: false
}

function isFunction(arg : ExplicitAny) : arg is Function {
    return typeof(arg) === 'function' || (arg instanceof Function);
}

export function arrayify(stmt : driver.QueryType, args : driver.QueryArgs, options : ArrayifyOptions = defaultOptions) : [ string, ExplicitAny[] ] {
    let segments = stmt.split(/(\$\w+)/g);
    let outputSegments : string[] = [];
    let outputArgs : ExplicitAny[] = []
    segments.forEach((seg) => {
        if (seg.match(/^\$/)) {
            let key = seg.substring(1)
            if (!args.hasOwnProperty(key)) {
                throw new Error(`MissingArgument: ${key}`)
            } else if (options.merge) {
                outputSegments.push(escape(args[key]))                
            } else if (isFunction(options.key)) {
                let keyVal = options.key();
                outputSegments.push(keyVal);
                outputArgs.push(args[key])
            } else {
                outputSegments.push(options.key)
                outputArgs.push(args[key])
            }
        } else {
            outputSegments.push(seg)
        }
    })
    let normedStmt = outputSegments.join('')
    return [ normedStmt, outputArgs ]
}

export function escape(arg : string | Date | boolean | number) : string {
    if (typeof(arg) === 'string') {
        return `'${arg.replace(/'/g, "\\'")}'`;
    } else if (arg instanceof Date) {
        return escape(arg.toISOString());
    } else {
        return arg.toString();
    }
}

