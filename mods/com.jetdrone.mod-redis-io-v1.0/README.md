Redis busmod for Vert.x
=============================

This module allows data to be saved, retrieved, searched for, and deleted in a Redis. Redis is an open source, BSD
licensed, advanced key-value store. It is often referred to as a data structure server since keys can contain strings,
hashes, lists, sets and sorted sets. To use this module you must have a Redis server instance running on your network.

[![Build Status](https://travis-ci.org/pmlopes/mod-redis-io.png)](https://travis-ci.org/pmlopes/mod-redis-io)

This is a worker module and must be started as a worker verticle. (not entirelly true since I am still coding against
Vert.x 1.3.1). On the vertx-2 branch worker is set to true.

## Dependencies

This module requires a Redis server to be available on the network.

## Name

The module name is `com.jetdrone.vertx.mods.redis`.

## Configuration

The module takes the following configuration:

    {
        "address": <address>,
        "host": <host>,
        "port": <port>,
        "encoding": <charset>,
        "binary": <boolean>
    }

For example:

    {
        "address": "test.my_redis",
        "host": "localhost",
        "port": 6379
    }

Let's take a look at each field in turn:

* `address` The main address for the module. Every module has a main address. Defaults to `vertx.mod-redis-io`.
* `host` Host name or ip address of the Redis instance. Defaults to `localhost`.
* `port` Port at which the Redis instance is listening. Defaults to `6379`.
* `encoding` The character encoding for string conversions (e.g.: `UTF-8`, `ISO-8859-1`, `US-ASCII`). Defaults to the platform default.
* `binary` If true then a no conversion to String is done and binary data is returned. Also all String values are expected to be in byte array format.

## Usage

Simple example:

```groovy
    def eb = vertx.eventBus()
    def config = new JsonObject()

    config.putString("address", address)
    config.putString("host", "localhost")
    config.putNumber("port", 6379)

    container.deployModule("vertx.mods.redis", config, 1)

    eb.send(address, [command: 'get', key: 'mykey']) { reply ->
        if (reply.body.status.equals('ok') {
            // do something with reply.body.value
        } else {
            println('Error #{reply.body.message}')
        }
    }
```

Simple example with binary mode:

```groovy
    def eb = vertx.eventBus()
    def config = new JsonObject()

    config.putString("address", address)
    config.putString("host", "localhost")
    config.putNumber("port", 6379)
    config.putNumber("binary", true)

    container.deployModule("vertx.mods.redis", config, 1)

    eb.send(address, [command: "del", key: key]) { reply0 ->

        eb.send(address, [command: "append", key: key, value: "Hello".getBytes()]) { reply1 ->
            assertNumber(5, reply1)

                eb.send(address, [command: "append", key: key, value: " World".getBytes()]) { reply2 ->
                    assertNumber(11, reply2)

                    eb.send(address, [command: "get", key: key]) { reply3 ->
                        def expected = "Hello World".getBytes()
                        def result = reply3.body.getBinary("value")

                        tu.azzert(expected.length == result.length)

                        for (int i = 0; i < expected.length; i++) {
                            tu.azzert(expected[i] == result[i])
                        }
                        tu.testComplete()
                    }
                }
            }
        }
    }
```


### Sending Commands

Each Redis command is exposed as a json document on the `EventBus`. All commands take a field `command` and an arbitrary
amount of extra fields as described on the main redis documentation site.

An example would be:

    {
        command: "get",
        key: "mykey"
    }

When the command completes successfuly the response would be:

    {
        status: "ok",
        "value": "the value stored on redis"
    }

If an error occurs a reply is returned:

    {
        "status": "error",
        "message": <message>
    }

Where `message` is an error message.

For a list of Redis commands, see [Redis Command Reference](http://redis.io/commands)

At the moment, commands can be specified only in lowercase. Minimal parsing is done on the replies.
Commands that return a single line reply return `java.lang.String`, integer replies return `java.lang.Number`,
"bulk" replies return an array of `java.lang.String` using the specified encoding, and "multi bulk" replies return a
array of `java.lang.String` again using the specified encoding. `hgetall` is expected to return an `JsonObject`.
