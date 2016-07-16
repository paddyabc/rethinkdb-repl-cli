# rethinkdb-client

Mysql client/Mongo shell like Nodejs command line client for [Rethinkdb](https://github.com/rethinkdb/rethinkdb)

###Installation
```
npm install -g rethinkdb-client
```

### Options

```  
Usage: rethinkdb-client [options]

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -u, --username <username>  database username
    -p, --password <password>  database user password
    -h, --host <host>          database hostname
    -P, --port <port>          database port number
    -d, --database <database>  database name

```

### How to use
```
# rethinkdb-client --host localhost
rethinkdb [test]>
```

Change default database
```
rethinkdb [test]> use abc
rethinkdb [abc]>
```

Execute ReQL
```
rethinkdb [test]> r.dbList()
['rethinkdb', 'test']
rethinkdb [test]>
```

Quit the command prompt
```
rethinkdb [test]> quit
#
```
