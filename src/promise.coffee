
async = require 'async'
loglet = require 'loglet'

class Promise
  @make: () ->
    new Promise() 
  constructor: () ->
    @calls = []
    @error = console.error 
    @
  then: (proc) ->
    if proc.length == 1
      @calls.push (cb) ->
        try 
          proc cb 
        catch e
          cb e
    else
      @calls.push (res, cb) ->
        try 
          proc res, cb 
        catch e
          cb e
    @
  catch: (@error) ->
    @
  done: (lastCB = () ->) ->
    self = @
    interim = null
    helper = (call, next) ->
      cb = (err, res) ->
          loglet.debug 'cb======', err, interim
          if err 
            next err
          else 
            interim = res 
            next null 
      if call.length > 1 
        call interim, cb
      else
        loglet.debug 'helper-non-interim', call
        call cb
    async.eachSeries @calls, helper, (err) ->
      try 
        if err 
          self.error err 
        else
          lastCB()
      catch e
        lastCB e
    @

module.exports = Promise
