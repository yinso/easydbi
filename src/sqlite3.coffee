
sqlite3 = require('sqlite3').verbose()
DBI = require './dbi'
Driver = require './driver'

class Sqlite3Driver extends Driver
  constructor: (@params) ->
  connect: (cb) =>
    #console.log 'Sqlite3Driver.connect', @params
    self = @
    @inner = new sqlite3.Database @params, (err) ->
      if err
        cb err
      else
        #console.log 'connect_inner', err, self
        cb null, self
  query: (key, args, cb) =>
    @inner.all key, args, cb 
  exec: (key, args, cb) =>
    #console.log 'Sqlite3Driver.exec:inner', key, args, @inner.run
    @inner.run key, args, (err, res) ->
      #console.log 'Sqlite3Driver.exec:inner', key, args, err, res
      cb err, res
  disconnect: (cb) =>
    @inner.close cb 

DBI.register 'sqlite', Sqlite3Driver

module.exports = Sqlite3Driver
