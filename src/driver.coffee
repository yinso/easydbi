{ EventEmitter } = require 'events'
Promise = require 'bluebird'
fs = Promise.promisifyAll require 'fs.extra'

# extremely easy 
class Driver extends EventEmitter
  @id = 0
  @pool = true
  constructor: (@key, @options) ->
    #console.log 'Driver.ctor', @key, @options
    @constructor.id++
    @id = @constructor.id
  connect: (cb) ->
  isConnected: () -> false
  driverName: () ->
    @constructor.name
  query: (key, args, cb) -> # query will return results. 
  queryOne: (key, args, cb) ->
    if arguments.length == 2
      cb = args
      args = {}
    @query key, args, (err, rows) ->
      if err
        cb err
      if rows?.length == 0
        cb {error: 'no_rows_found'}
      else if rows?.length > 0
        cb null, rows[0]
      else
        cb {error: 'unknown_result', result: rows}
  exec: (key, args, cb) ->
    if arguments.length == 2
      cb = args
      args = {}
    @query key, args, (err, rows) ->
      if err
        cb err
      else
        cb null
  begin: (cb) ->
    @exec 'begin', cb
  commit: (cb) ->
    @exec 'commit', cb
  rollback: (cb) ->
    @exec 'rollback', cb
  disconnect: (cb) ->
  close: (cb) -> # same as disconnect except in pool scenario.
  execScript: (filePath, cb) ->
    self = @
    fs.readFileAsync(filePath, 'utf8')
      .then((data) ->
        queries = data.split /\w*;\w/
        return Promise.each queries, (query) ->
          console.log 'try', query
          self.execAsync query, {}
      ).then(() ->
        cb null
      ).catch(cb)

Promise.promisifyAll Driver.prototype

module.exports = Driver
