Redis busmod for Vert.x
=============================

This module allows data to be saved, retrieved, searched for, and deleted in a Redis. Redis is an open source, BSD
licensed, advanced key-value store. It is often referred to as a data structure server since keys can contain strings,
hashes, lists, sets and sorted sets. To use this module you must have a Redis server instance running on your network.

[![Build Status](https://travis-ci.org/pmlopes/mod-redis-io.png?branch=master)](https://travis-ci.org/pmlopes/mod-redis-io)

## Dependencies

This module requires a Redis server to be available on the network.

## Name

The module name is `com.jetdrone.mod-redis-io`.

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
* `binary` To be implemented. In this case messages are expected to be in binary format.

## Usage

Simple example:

```groovy
    def eb = vertx.eventBus()
    def config = new JsonObject()

    config.putString("address", address)
    config.putString("host", "localhost")
    config.putNumber("port", 6379)

    container.deployModule("com.jetdrone.mod-redis-io", config, 1)

    eb.send(address, [command: 'get', key: 'mykey']) { reply ->
        if (reply.body.status.equals('ok') {
            // do something with reply.body.value
        } else {
            println('Error #{reply.body.message}')
        }
    }
```

Simple example with pub/sub mode:

```groovy
    def eb = vertx.eventBus()
    def pubConfig = new JsonObject()
    pubConfig.putString("address", 'redis.pub')
    def subConfig = new JsonObject()
    subConfig.putString("address", 'redis.sub')

    container.deployModule("com.jetdrone.mod-redis-io", pubConfig, 1)
    container.deployModule("com.jetdrone.mod-redis-io", subConfig, 1)

    // register a handler for the incoming message the naming the Redis module will use is base address + '.' + redis channel
    eb.registerHandler("redis.sub.ch1", new Handler<Message<JsonObject>>() {
        @Override
        void handle(Message<JsonObject> received) {
            // do whatever you need to do with your message
            def value = received.body.getField('value')
            // the value is a JSON doc with the following properties
            // channel - The channel to which this message was sent
            // pattern - Pattern is present if you use psubscribe command and is the pattern that matched this message channel
            // message - The message payload
        }
    });

    // on sub address subscribe to channel ch1
    eb.send('redis.sub', [command: 'subscribe', channel: 'ch1']) { subscribe ->
    }

    // on pub address publish a message
    eb.send('redis.pub', [command: 'publish', channel: 'ch1', message: 'Hello World!']) { publish ->
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
array of `java.lang.String` again using the specified encoding. `hgetall` is returns a `JsonObject`.

## Friendlier hash commands

Most Redis commands take a single String or an Array of Strings as arguments, and replies are sent back as a single
String or an Array of Strings. When dealing with hash values, there are a couple of useful exceptions to this.

### command hgetall

The reply from an `hgetall` command will be converted into a JSON Object.  That way you can interact with the responses
using JSON syntax which is handy for the EventBus communication.

### command hmset

Multiple values in a hash can be set by supplying an object.Note however that key and value will be coerced to strings.
NOTE: Not implemented yet!!!

## Pub/Sub

As demonstrated with the source code example above, the module can work in pub/sub mode too. The basic idea behind it is
that you need to register a new handler for the address: `mod-redis-io-address.your_real_redis_address` At this moment
all commands to `subscribe`, `psubscribe`, `unsubscribe` and `pusubscribe` will send the received messages to the right
address.