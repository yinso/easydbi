# EasyDBI - A Simple Database Interface for NodeJS

EasyDBI is a simple database interface for NodeJS. The precessor, `DBConnect`, turns out to still be too complex, so this is even more simplified.

By default EasyDBI comes with Sqlite3. 

# Installation

    npm install easydbi

# Usage

    var DBI = require('easydbi'); // already comes with sqlite3
    
    DBI.setup('test', {type: 'sqlite', options: {filePath: './test.db'}})
    
    // "prepare" queries. 
    DBI.prepare('test', 'createTest', {exec: 'create table test_t (c1 int, c2 int)'});
    DBI.prepare('test', 'insertTest', {exec: 'insert into test_t valeus ($c1, $c2)'});
    
    // load a whole module of prepared queries. => sync operation. 
    DBI.load('sqlite', require('some-prepared-module'));
    
    // making a connection
    DBI.connect(function (err, conn) {
      if (err) {
        return err;
      } else {
        conn.createTest({}, function(... ) { ... })
      }
    });
    

## Setup

`EasyDBI` has a setup process that's a bit different from other database interfaces. The design is meant to make
the abstraction over the different drivers as uniform as possible.

`DBConnect.setup` 

* `name` - this is the key to the name of the connection. You can refer to this later in `DBI.connect`
* `options` - this has the following information: 
  * `type` - a string that is the name of the registered DBI driver module
  * `options` - for `sqlite` it inclues the following
    * `filePath`: the file path to the database file. This one takes precedence.
    * `memory`: true or false
    * `timeout`: used to control timeout for retries when encountering `SQLITE_BUSY` with multiple concurrent connections - keep in mind that it slows down the queries.

## Connection Creation

`DBI.connect` creates the connection (auto connected). It expects the `name` that was used in the setup process, as well as a `callback` function that expects an error and a connection object. 

    DBI.connect('test', function(err, conn) {
      if (err) {
        //...  
      } else {
        //...
      }
    });

## Closing the Connection

`conn.disconnect(cb)` will close the connection.

## Database Query

Althoug the database query will be specific to the underlying driver, currently for SQL databases we use the following conventions: 

* The arguments will be an object
* The query will expect named parameters with `$name` as the parameter.

For example, 

    conn.query('select * from test_t where c1 = $c1', {c1: 2}, function(err, rows) { /* ... */ });

DML such as `insert`, `update`, and `delete` should be passed via `conn.exec` instead of `conn.query`, since no results are expected. 

    conn.exec('insert into test_t values ($c1, $c2)', {c1: 3, c2: 4}, function(err) { /* ... */ });

`conn.begin`, `conn.commit`, and `conn.rollback` handles the transactions. Use them rather than passing raw `conn.exec('begin')` since the underlying driver might not be able to handle raw query statements for transactions.

    conn.begin(function(err) { /* ... */ });
    
    conn.commit(function(err) { /* ... */ });
    
    conn.rollback(function(err) { /* ... */ });




