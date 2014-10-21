###
dbi = require 'dbi'
dbi.register require 'dbi-pg'

# are we going to try to use promise? 
conn = dbi.connect('sqlite3', options, db)
###

Driver = require './driver'

class DBI 
  @drivers = {}
  @register: (key, driver) ->
    @drivers[key] = driver
    @
  @clone: (key, newKey) -> # allows for separate prototyping. 
    driver = @get key
    @register newKey, class DriverWrapper extends Driver
      constructor: (args...) ->
        @inner = new driver args...
      connect: (args..., cb) ->
        self = @
        @inner.connect args..., (err, inner) ->
          if err
            cb err
          else
            cb null, self
      query: (args...) ->
        @inner.query args...
      queryOne: (args...) ->
        @inner.queryOne args...
      exec: (args...) ->
        @inner.exec args...
      disconnect: (args...) ->
        @inner.disconnect args...
    @
  @get: (key) ->
    if @drivers.hasOwnProperty(key)
      @drivers[key]
    else
      throw {error: 'unknown_dbi_driver', key: key}
  @make: (key, options) ->
    driver = @get key
    new driver options
  @load: (key, module) ->
    for call, options of module
      @prepare key, call, options 
    @
  @prepare: (key, call, options) ->
    driver = @get key
    driver.prototype[call] = @_prepare driver, call, options
    @
  @_prepare: (driver, call, options) ->
    if options?.query 
      (args, cb) ->
        @query options.query, args, cb 
    else if options?.exec
      (args, cb) ->
        @exec options.exec, args, cb 
    else if options instanceof Function 
      options
    else
      throw {error: 'invalid_prepare_option', call: call, options: options}

module.exports = DBI
