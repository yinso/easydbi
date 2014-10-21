
# extremely easy 
class Driver 
  constructor: () ->
  connect: (options, cb) ->
  query: (key, args, cb) -> # query will return results. 
  queryOne: (key, args, cb) ->
    @query key, args, (err, rows) ->
      if err
        cb err
      if rows?.length == 0
        cb {error: 'no_rows_found'}
      else
        cb null, rows[0]
  exec: (key, args, cb) ->
    @query key, args, (err, rows) ->
      if err
        cb err
      else
        cb null 
  disconnect: (cb) ->

module.exports = Driver
