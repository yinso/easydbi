
sqlite3 = require('sqlite3').verbose()
DBI = require './dbi'
Driver = require './driver'
queryHelper = require './query'

class Sqlite3Driver extends Driver
  @pool = false
  @id = 0
  constructor: (@options) ->
    super @options
    #console.log 'constructor:id', @id
    @connstr = @makeConnStr @options
  makeConnStr: (options) ->
    if options.memory
      ":memory:"
    else if options.filePath
      options.filePath 
    else
      ":memory:"
  connect: (cb) ->
    #console.log "#{@driverName()}.connect", @options
    self = @
    @inner = new sqlite3.Database @connstr, (err) ->
      if err
        cb err
      else
        #console.log "#{self.driverName()}.connect:OK", self.id
        cb null, self
  isConnected: () ->
    val = @inner instanceof sqlite3.Database
    #console.log "#{@driverName()}.isConnected", val
    val
  query: (stmt, args, cb) ->
    try 
      [ normedStmt, normedArgs ] = queryHelper.arrayify stmt, args
      @inner.all normedStmt, normedArgs, cb 
    catch e 
      cb e
  _exec: (stmt, args, cb) ->
    self = @
    waitCallback = () ->
      self._exec stmt, args, cb 
    @inner.run stmt, args, (err, res) ->
      if err?.code == 'SQLITE_BUSY'
        setTimeout waitCallback, self.options?.timeout or 500
      else
        cb err, res
  exec: (stmt, args, cb) ->
    try 
      [ stmt, args ] = queryHelper.arrayify stmt, args
      @_exec stmt, args, cb
    catch e
      cb e
  disconnect: (cb) ->
    @inner.close cb 
  close: (cb) ->
    @inner.close cb 

DBI.register 'sqlite', Sqlite3Driver

module.exports = Sqlite3Driver
