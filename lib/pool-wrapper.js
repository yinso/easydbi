const pool = require('generic-pool');

function PoolWrapper(options) {
    this._inner = new pool.Pool(options)
}

PoolWrapper.prototype.acquire = function (priority) {
    return this._inner.acquire(priority)
}

PoolWrapper.prototype.release = function (resource) {
    return this._inner.release(resource);
}

module.exports = {
    Pool: PoolWrapper
}