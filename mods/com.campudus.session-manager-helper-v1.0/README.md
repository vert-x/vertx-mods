# Session Manager Helper

This module provides helper functions for the session manager module. To use these functions, you need to add the following code in your mod.json:

    "includes" : "com.campudus.session-manager-helper-v1.0"

For Java and Scala source code compilation, you need the SessionHelper classes in your classpath. Use task 'jar' to create a jar file containing everything you need ('./mk jar' in *nix or 'wmk jar' in Windows) or add the classes contained in the module directly to your classpath.

If you already have other includes, you need to separate them with commas - see the official vertx modules documentation.

The latest version of this module can be found in the [campudus/vertx-session-manager-helper repository](https://github.com/campudus/vertx-session-manager-helper).

If you want to enhance this module by providing additional wrappers for other languages, feel free to submit a pull request!

## Dependencies

This module requires the session manager module running and listening on the event bus. If you haven't installed this module before, this module won't be useful to you. You can grab the session manager module in the [campudus/vertx-session-manager repository](https://github.com/campudus/vertx-session-manager).

## Name

The module name is `com.campudus.session-manager-helper`.

## Configuration

This module does not provide any special configuration, since it only provides helper functions. If you want to change the configuration of the session manager itself, please see its own documentation.

## Operations

Please see the source code documentation, what methods are available to you in your favorite language.
