"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var defaultOptions = {
    key: '?',
    merge: false
};
function isFunction(arg) {
    return typeof (arg) === 'function' || (arg instanceof Function);
}
function arrayify(stmt, args, options) {
    if (options === void 0) { options = defaultOptions; }
    var segments = stmt.split(/(\$\w+)/g);
    var outputSegments = [];
    var outputArgs = [];
    segments.forEach(function (seg) {
        if (seg.match(/^\$/)) {
            var key = seg.substring(1);
            if (!args.hasOwnProperty(key)) {
                throw new Error("MissingArgument: " + key);
            }
            else if (options.merge) {
                outputSegments.push(escape(args[key]));
            }
            else if (isFunction(options.key)) {
                var keyVal = options.key();
                outputSegments.push(keyVal);
                outputArgs.push(args[key]);
            }
            else {
                outputSegments.push(options.key);
                outputArgs.push(args[key]);
            }
        }
        else {
            outputSegments.push(seg);
        }
    });
    var normedStmt = outputSegments.join('');
    return [normedStmt, outputArgs];
}
exports.arrayify = arrayify;
function escape(arg) {
    if (typeof (arg) === 'string') {
        return "'" + arg.replace(/'/g, "\\'") + "'";
    }
    else if (arg instanceof Date) {
        return escape(arg.toISOString());
    }
    else {
        return arg.toString();
    }
}
exports.escape = escape;
//# sourceMappingURL=query-helper.js.map