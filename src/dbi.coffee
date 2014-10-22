
{ EventEmitter } = require 'events'
Driver = require './driver'
Pool = require './pool'


class DBI 
  @drivers = {}
  @pools = {} 
  # this register the type... 
  @register: (type, driver) ->
    @drivers[type] = driver
    @
  @getType: (type) ->
    if @drivers.hasOwnProperty(type)
      @drivers[type]
    else
      throw {error: 'unknown_dbi_driver_type', type: type}
  @setup: (key, {type, options, pool}) ->
    driver = @getType type 
    if driver.pool
      @pools[key] = new Pool key, driver, options, pool
    else
      @pools[key] = new Pool.NoPool key, driver, options, pool
    @
  @getPool: (key) ->
    if @pools.hasOwnProperty(key)
      @pools[key]
    else
      throw {error: 'unknown_driver_spec', key: key}
  @connect: (key, cb) ->
    #console.log 'DBI.connect', key
    try 
      pool = @getPool key
      pool.connect cb 
    catch e 
      cb e
  @load: (key, module) ->
    for call, options of module
      @prepare key, call, options 
    @
  @prepare: (key, call, options) ->
    pool= @getPool key
    pool.prepare call, options
    @

module.exports = DBI
