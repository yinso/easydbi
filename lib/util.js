"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function removeComments(data) {
    return data.replace(/(--).*/g, '');
}
exports.removeComments = removeComments;
function splitToQueries(data) {
    return data.split(/\s*;\s*/);
}
exports.splitToQueries = splitToQueries;
//# sourceMappingURL=util.js.map