
sqlite3 = require('sqlite3').verbose()
DBI = require './dbi'
Driver = require './driver'
queryHelper = require './query'
loglet = require 'loglet'

class Sqlite3Driver extends Driver
  @pool = false
  @id = 0
  constructor: (@key, @options) ->
    super @key, @options
    @connstr = @makeConnStr @options
    #loglet.log 'constructor:id', @id, @connstr
    @type = 'sqlite3'
  makeConnStr: (options) ->
    if options?.memory
      ":memory:"
    else if options.filePath
      options.filePath 
    else
      ":memory:"
  connect: (cb) ->
    #loglet.log "#{@driverName()}.connect", @options, @connstr
    self = @
    @inner = new sqlite3.Database @connstr, (err) ->
      if err
        cb err
      else
        loglet.debug "#{self.driverName()}.connect:OK", self.id
        cb null, self
  isConnected: () ->
    val = @inner instanceof sqlite3.Database
    loglet.debug "#{@driverName()}.isConnected", val
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
