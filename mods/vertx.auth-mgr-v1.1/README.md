# Authentication/Authorisation Manager

This is a basic auth manager that verifies usernames and passwords in a MongoDB database and generates time-limited session ids. These session ids can be passed around the event bus.

The auth manager can also authorise a session id. This allows session ids to be passed around the event bus and validated if particular busmods want to find out if the user is authorised.

Sessions time out after a certain amount of time. After that time, they will not verify as ok.

This busmod, is used in the web application tutorial to handle simple user/password authorisation for the application.

## Dependencies

This busmod requires a MongoDB persistor busmod to be running to allow searching for usernames and passwords.

## Name

The module name is `auth-mgr`.

## Configuration

This busmod takes the following configuration:

    {
        "address": <address>,
        "user_collection": <user_collection>,
        "persistor_address": <persistor_address>,
        "session_timeout": <session_timeout>   
    }
    
For example:

    {
        "address": "test.my_authmgr",
        "user_collection": "users",
        "persistor_address": "test.my_persistor",
        "session_timeout": 900000
    }        
    
Let's take a look at each field in turn:

* `address` The main address for the busmod. Optional field. Default value is `vertx.basicauthmanager`
* `user_collection` The MongoDB collection in which to search for usernames and passwords. Optional field. Default value is `users`.
* `persistor_address` Address of the persistor busmod to use for usernames and passwords. This field is optional. Default value is `vertx.mongopersistor`.
* `session_timeout` Timeout of a session, in milliseconds. This field is optional. Default value is `1800000` (30 minutes).

## Operations

### Login

Login with a username and password and obtain a session id if successful.

To login, send a JSON message to the address given by the main address of the busmod + `.login`. For example if the main address is `test.authManager`, you send the message to `test.authManager.login`.

The JSON message should have the following structure:

    {
        "username": <username>,
        "password": <password>
    }
    
If login is successful a reply will be returned:

    {
        "status": "ok",
        "sessionID": <sesson_id>    
    }
    
Where `session_id` is a unique session id.

If login is unsuccessful the following reply will be returned:

    {
        "status": "denied"    
    }
    
### Logout

Logout and close a session. Any subsequent attempts to validate the session id will fail.

To login, send a JSON message to the address given by the main address of the busmod + `.logout`. For example if the main address is `test.authManager`, you send the message to `test.authManager.logout`.

The JSON message should have the following structure:

    {
        "sessionID": <session_id>
    }   
    
Where `session_id` is a unique session id. 
 
If logout is successful the following reply will be returned:

    {
        "status": "ok"    
    } 
    
Otherwise, if the session id is not known about:

    {
        "status": "error"    
    }   
    
### Authorise

Authorise a session id.

To authorise, send a JSON message to the address given by the main address of the busmod + `.authorise`. For example if the main address is `test.authManager`, you send the message to `test.authManager.authorise`.

The JSON message should have the following structure:

    {
        "sessionID": <session_id>
    }   
    
Where `session_id` is a unique session id. 
 
If the session is valid the following reply will be returned:

    {
        "status": "ok",
        "username": <username>    
    } 
    
Where `username` is the username of the user.    
    
Otherwise, if the session is not valid. I.e. it has expired or never existed in the first place.

    {
        "status": "denied"    
    }

With this basic auth manager, the user is always authorised if they are logged in, i.e. there is no fine grained authorisation of resources.