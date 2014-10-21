#!/usr/bin/env coffee # -*- coffee-script -*- -p
DBI = require '../src/main'
P = require '../src/promise'
assert = require 'assert'

describe 'sqlite driver test', () ->
  
  db = null 
  
  it 'can clone', (done) ->
    try 
      DBI.clone 'sqlite', 'test'
      done null
    catch e
      done e
  
  it 'can prepare', (done) ->
    try
      DBI.load 'test', require('../example/test')
      done null
    catch e
      done e
  
  it 'can ctor', (done) ->
    try
      db = DBI.make 'test', ':memory:'
      done null
    catch e
      done e

  it 'can create/insert/select', (done) ->
    P.make()
      .then (cb) ->
        db.connect cb 
      .then (db, cb) ->
        db.createTest {}, cb
      .then (cb) ->
        db.exec 'insert into test_t values (?, ?)', [1, 2], cb
      .then (cb) ->
        db.insertTest [3, 4], cb
      .then (cb) ->
        db.insertTest [5, 6], cb
      .then (cb) ->
        db.selectTest {}, cb
      .then (rows, cb) ->
        try 
          assert.deepEqual rows, [{c1: 1, c2: 2}, {c1: 3, c2: 4}, {c1: 5, c2: 6}]
          cb null 
        catch e
          cb e
      .then (cb) ->
        db.disconnect cb
      .catch (err) ->
        done err
      .done () ->
        done null

