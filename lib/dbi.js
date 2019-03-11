"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var alloc = require("./allocator");
var drivers = {};
var pools = {};
function register(type, driver) {
    drivers[type] = driver;
}
exports.register = register;
function hasType(type) {
    if (drivers.hasOwnProperty(type)) {
        return drivers[type];
    }
    else {
        throw new Error("UnknownDriverType: " + type);
    }
}
exports.hasType = hasType;
function getType(type) {
    if (!drivers.hasOwnProperty(type)) {
        throw new Error("UnknownDriverType: " + type);
    }
    return drivers[type];
}
exports.getType = getType;
function hasSetup(key) {
    return pools.hasOwnProperty(key);
}
exports.hasSetup = hasSetup;
function setup(key, options) {
    if (pools.hasOwnProperty(key)) {
        throw new Error("Duplicatesetup: " + key);
    }
    var driver = getType(options.type);
    if (options.options.pool) {
        pools[key] = new alloc.PoolAllocator(key, driver, options.options);
    }
    else {
        pools[key] = new alloc.BaseAllocator(key, driver, options.options);
    }
}
exports.setup = setup;
function tearDown(key) {
    if (pools.hasOwnProperty(key)) {
        delete pools[key];
    }
}
exports.tearDown = tearDown;
function getPool(key) {
    if (pools.hasOwnProperty(key)) {
        return pools[key];
    }
    else {
        throw new Error("UnknownDriverSpec: " + key);
    }
}
exports.getPool = getPool;
function connectAsync(key) {
    return Promise.try(function () { return getPool(key); })
        .then(function (driver) { return driver.connectAsync(); });
}
exports.connectAsync = connectAsync;
function connect(key, cb) {
    return connectAsync(key)
        .then(function (driver) { return cb(null, driver); })
        .catch(cb);
}
exports.connect = connect;
function load(key, module) {
    Object.keys(module).forEach(function (call) {
        prepare(key, call, module[call]);
    });
}
exports.load = load;
function prepare(key, call, options) {
    var driver = getPool(key);
    driver.prepare(call, options);
}
exports.prepare = prepare;
//# sourceMappingURL=dbi.js.map