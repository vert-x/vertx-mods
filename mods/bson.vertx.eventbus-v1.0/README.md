bson.vertx.eventbus
===================
[![Build Status](https://travis-ci.org/pmlopes/bson.vertx.eventbus.png)](https://travis-ci.org/pmlopes/bson.vertx.eventbus)

BSON EventBus for Vert.x

Why another event bus?
----------------------
The standard EventBus from Vert.x allows Verticles to communicate with each other using JSON. JSON is a generic and fairly
simple encoding scheme, however it limits the data types to be:

* Number (normally a Double)
* String
* Boolean
* Array (Ordered List)
* Object (Map)
* null

Although for most cases these data types are enough, in some more complex cases a Verticle might need to exchange more
rich type data such as Dates, Integers, UUIDs, Regular Expressions, Binary data. This is where the BSON EventBus comes in.

Implementation details
----------------------
The module has no external dependencies, I've decided to implement the bson codec myself to optimize the usage of vert.x
buffers, and for that reason it is quite basic for the moment.

Type mapping implementation status
----------------------------------

| BSON | Java | Implemented | Comments |
|:-----|:-----|:-----------:|:---------|
| Floating Point | Double | ✔ |  |
| UTF-8 String | String | ✔ |  |
| Embedded Document | java.util.Map | ✔ |  |
| Array | java.util.List | ✔ |  |
| Binary::Generic | byte[] | ✔ |  |
| Binary::Function | | |  |
| Binary::Binary (OLD) | byte[] | ✔ | Deprecated/Only ReadOnly Support (when other sources write data to the Bus |
| Binary::UUID (OLD) | | | Deprecated |
| Binary::UUID | java.util.UUID | ✔ |  |
| Binary::MD5 | | |  |
| Binary::User Defined | bson.vertx.Binary | ✔ | This is a interface that you need to implement getBytes() : byte[] |
| Undefined | | | Deprecated |
| ObjectId | bson.vertx.ObjectId | ✔ |  |
| Boolean | Boolean | ✔ |  |
| UTC Datetime | java.util.Date | ✔ |  |
| Null | null | ✔ |  |
| Regular Expression | java.util.regex.Pattern | ✔ |  |
| DBPointer | | | Deprecated |
| JavaScript Code | | |  |
| Symbol | | | Deprecated |
| JavaScript Code w/scope | | | |
| 32bit Integer | Integer | ✔ | |
| Timestamp | | |  |
| 64bit Integer | Long | ✔ |  |
| MinKey | bson.vertx.Key.MIN | ✔ |  |
| MaxKey | bson.vertx.Key.MAX | ✔ |  |

Quickstart
----------
There are 2 examples in the code:

* https://github.com/pmlopes/bson.vertx.eventbus/tree/master/example/mods/bson.example-groovy-v1.0
* https://github.com/pmlopes/bson.vertx.eventbus/tree/master/example/mods/bson.example-java-v1.0

In a quick overview all you need is:

1. Create a new instance of the BSONEventBus by wrapping the default EventBus
2. Send and receive java.util.Map as your Objects that are internally converted to BSON

The transformation to and from BSON is totally hidden from you. If you used vert.x with JSON encoding BSON will look
exactly the same. However instead of having specific classes (like it happens for JSON) BSON works with Maps directly.