#!/usr/bin/env coffee # -*- coffee-script -*- -p
DBI = require '../src/main'
P = require '../src/promise'
assert = require 'assert'
async = require 'async'
path = require 'path'
fs = require 'fs'

describe 'sqlite driver test', () ->
  
  db = null 
  
  it 'can setup', (done) ->
    try 
      DBI.setup 'test', {type: 'sqlite', options: {filePath: path.join(__dirname, '..', 'example', 'test.db')}}
      done null
    catch e
      done e
  
  it 'can prepare', (done) ->
    try
      DBI.load 'test', require('../example/test')
      done null
    catch e
      done e

  
  it 'can connect', (done) ->
    try
      DBI.connect 'test', (err, conn) ->
        if err
          done err
        else
          db = conn
          done null
    catch e
      done e

  it 'can create/insert/select', (done) ->
    P.make()
      .then (cb) ->
        db.createTest {}, cb
      .then (cb) ->
        db.exec 'insert into test_t values ($c1, $c2)', {c1: 1, c2: 2}, cb
      .then (cb) ->
        db.insertTest {c1:3, c2:4}, cb
      .then (cb) ->
        db.selectTest {}, cb
      .then (rows, cb) ->
        try 
          assert.deepEqual rows, [{c1: 1, c2: 2}, {c1: 3, c2: 4}]
          cb null 
        catch e
          cb e
      .catch (err) ->
        done err
      .done () ->
        done null
  
  it 'can have concurrent connections', 10000, (done) ->
    helper = (count, next) ->
      conn = null
      P.make()
        .then (cb) ->
          DBI.connect 'test', (err, c) ->
            if err
              cb err
            else
              conn = c
              cb null
        .then (cb) ->
          conn.insertTest {c1:2, c2:4}, cb
        .then (cb) ->
          conn.selectTest {}, cb
        .catch (err) ->
          conn.disconnect (e) ->
            next err
        .done () ->
          conn.disconnect next 
    list = [1, 2, 3, 4, 5, 6, 7]
    async.each list, helper, (err) ->
      #console.log 'async.last', err
      if err
        done err
      else
        P.make()
          .then (cb) ->
            db.selectTest {}, cb
          .then (rows, cb) ->
            try
              assert.equal rows.length, list.length + 2
              cb null
            catch e
              cb e
          .catch(done)
          .done(done)
    
  it 'clean up', (done) ->
    fs.unlink path.join(__dirname, '..', 'example', 'test.db'), done
    
    
    
