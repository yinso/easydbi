
async = require 'async'

class Promise
  @make: () ->
    new Promise() 
  constructor: () ->
    @calls = []
    @error = console.error 
    @
  then: (proc) ->
    @calls.push proc
    @
  catch: (@error) ->
    @
  done: (lastCB = () ->) ->
    self = @
    interim = null
    helper = (call, next) ->
      cb = (err, res) ->
          #console.log 'cb======', err, interim
          if err 
            next err
          else 
            interim = res 
            next null 
      if interim != null and interim != undefined
        #console.log 'helper-interim', call, interim
        call interim, cb
      else
        #console.log 'helper-non-interim', call
        call cb
    async.eachSeries @calls, helper, (err) ->
      if err 
        self.error err 
      else
        lastCB()
    @

module.exports = Promise
