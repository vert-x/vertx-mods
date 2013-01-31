# Session Manager

This module allows to store data in a session. Sessions can time out after a specified amount of time. The stored information of timed out sessions will be deleted.

The latest version of this module can be found in the [campudus/vertx-session-manager repository](https://github.com/campudus/vertx-session-manager). 

## Dependencies

This module requires the scala language module (org.scala-lang.scala-library-v2.9.2) to work. It is built against Vert.x 1.3.1.

It uses SharedData maps provided by Vert.x to save its information.

## Name

The module name is `com.campudus.session-manager`.

## Configuration

The session manager module takes the following configuration:

    {
        "address": <address>,
        "timeout": <timeout>,
        "cleaner": <cleanerAddress>,
        "prefix": <prefix>,
        "map-sessions": <sharedMap>,
        "map-timeouts": <sharedMap>
    }

For example:

    {
        "address": "test.session-manager",
        "timeout": 15 * 60 * 1000,
        "cleaner": "test.session-cleanup",
        "prefix": "session-client."
    }        

A short description about each field:
* `address` The main address for the module. Every module has a main address. Defaults to `campudus.session`.
* `timeout` How long sessions should be stored. If a timeout occurs, the session will be deleted and is not available anymore. The timeout is set as a long value in milliseconds. Defaults to `30 * 60 * 1000`, i.e. 30 Minutes.
* `cleaner` As soon as a session gets destroyed, it will be sent to this address. This is useful for cleanup purposes. Since you can only store basic information in the session like a shopping-cart id, you can delete the shopping-cart in your database with the provided session, for example. If the cleaner address is null, the session won't be sent anywhere. Defaults to `null`.
* `prefix` An address prefix where clients can listen on with their session id. If their session timed out or got killed, they will receive a message on `<prefix><sessionId>`. Defaults to `campudus.sessions.`
* `map-sessions` The name of the shared map to be used for the session storage. Defaults to `com.campudus.vertx.sessionmanager.sessions`.
* `map-timeouts` The name of the shared map to be used to save timer-ids. Defaults to `com.campudus.vertx.sessionmanager.timeouts`.

## Operations

The module supports a few operations. If you want to let clients use the session manager directly, be careful which commands you let them use.

Operations are sent by specifying an `action` String and required and optional parameters. If a required parameter is missing, the server will reply with an error message in this format:

    {
        "status" : "error",
        "error" : "KIND_OF_ERROR",
        "message" : "Some kind of descriptive text, what went wrong exactly"
    }

The session manager can also _raise_ errors to the client directly, sending an error message to `campudus.session.94b1a3fe-16df-4ab2-ac10-aae67ad2c46d` for example, if the prefix is set to `campudus.sessions.`. If you provide an action which the session manager does not know, it will reply with error `UNKNOWN_COMMAND`.

### start

Starts a session and provides the caller with a session id.

To start a session, send a JSON message to the modules main address:

    {
        "action": "start"
    }     
    
The session manager will reply with a sessionId inside the data, looking like this:

    {
        "sessionId": "94b1a3fe-16df-4ab2-ac10-aae67ad2c46d"
    }
    
You now have created a session which will timeout in 30 minutes, if you didn't change the default timeout. With this id, you can store and retrieve data.

### destroy

Destroys a session immediately.

This is useful if you want to log out a client for example. All destroyed session data will be sent to the `cleaner` address, if you specified it in the configuration. The client will receive a message at `<prefix><sessionId>`, that its session was killed.

To destroy a session, send a JSON message to the modules main address:

    {
        "action": "destroy",
        "sessionId": <sessionId>
    }     
    
Where `sessionId` is the id of the session, which should be destroyed.

An example would be:

    {
        "action": "destroy",
        "sessionId": "94b1a3fe-16df-4ab2-ac10-aae67ad2c46d"
    }  

This would delete all information about session `94b1a3fe-16df-4ab2-ac10-aae67ad2c46d` from the shared data and send all the previously stored information to the `cleaner` address. If you set up `prefix` in the config to `session.`, a message in this format will be sent to that address:

    {
        "status": "SESSION_KILL"
    }

If an administrator kills the session of a client, the client can be notified via a registered handler on that address.

As soon as the session is destroyed, the server will reply with

    {
        "sessionDestroyed": true
    }

It will always reply with this message, to inform you that the work was done and the session is gone. It will do so even if the `sessionId` didn't exist before. If you did not specify a `sessionId` at all, it will reply with error `SESSIONID_MISSING`.

### clear

This command destroys all sessions immediately. Every session gets sent to the `cleaner` address and an error `SESSION_KILL` is sent to `<prefix><sessionId>`.

You should be very careful not to let everyone use this command:

    {
        "action": "clear"
    }

It works analog to the `destroy` action. As soon as the work is done, the server will reply with:

    {
        "cleared": true
    }

### heartbeat

Sends a heartbeat to the server, resetting the timeout of the session. If you don't want to loose your session information but don't use `get` or `set` commands often enough, you can send this command to prevent the automatic deletion of the session.

    {
        "action": "heartbeat",
        "sessionId": <sessionId>
    }

You have to provide a valid `sessionId`, otherwise the heartbeat will reply with error `SESSIONID_MISSING`.

### get

Gets some data from the session storage. You can get multiple fields with one command.

    {
        "action": "get",
        "sessionId": <sessionId>,
        "fields": [<field1>, <field2>, <field3>, ...]
    }

* `sessionId` is required and results in a `SESSIONID_MISSING` error, if not set. If the session is set but could not be found, a `SESSION_GONE` error is raised (i.e. sent to the session handler directly).
* `fields` is required, too, and replies with a `FIELDS_MISSING` error, when omitted. If one of the fields cannot be found, the result of that field will be null.

### put

Stores data in the session. You provide a JsonObject and it gets stored in the session.

    {
        "action": "put"
        "sessionId": <sessionId>
        "data": <JsonObject>
    }

As soon as the session manager saved the data in the session, it will reply with `"sessionDataSaved": true`. There can be three kinds of errors:
* `sessionId` was omitted: The session manager replies with error `SESSIONID_MISSING`.
* `data` was not provided: The session manager replies with error `DATA_MISSING`.
* `data` is not a JsonObject: The session manager replies with error `WRONG_DATA_TYPE`.

If you send a key in `data` which already existed in the session storage, it will be overwritten by the value provided in the `data` object.

### status (access statistics or check session matches)

The session manager can also provide you some statistics about itself. You can access these tools by sending `status` as action and provide a `report` field.

If you want to get a report, which doesn't exist the session manager will reply with a `UNKNOWN_REPORT_REQUEST` error.

#### connections

This report shows how many sessions are stored in the session storage right now.

    {
        "action": "status",
        "report": "connections"
    }

It will result in a message like this:

    {
        "openSessions": 16
    }



#### matches

This report shows the session ids, which match the specified information. This can be used in a chat-application to find out whether a specific nickname is already in use for example. This template will make use of the feature:

    {
        "action": "status",
        "report": "matches",
        "data": <JsonObject>
    }

The `match` object behaves like the matcher in the event bus bridge. You set a subset of an object and if it matches with one of the stored sessions, the matching stored sessions will be replied by the session manager.

Here is an example to look for sessions which have stored the fields `race` with value `human` and `power` set to 5:

    {
        "action": "status",
        "report": "matches",
        "data": {
            "race": "human",
            "power": 5
        }
    }

This would assemble a list of session ids and reply them back to the caller in this manner:

    {
        "matches": true,
        "sessions": ["", ""]
    }

If there were no matches, the `sessions` list is empty and `matches` is false.
