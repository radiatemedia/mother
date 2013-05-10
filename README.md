# Mother

[![Build Status](https://travis-ci.org/radiatemedia/mother.png?branch=master)](https://travis-ci.org/radiatemedia/mother)
[![Dependency Status](https://gemnasium.com/radiatemedia/mother.png)](https://gemnasium.com/radiatemedia/mother)

_Mother_ is a very small library to assist with feature flipping your
JavaScript application.

## Installation

_Mother_ is available as an `npm` package:

    $ npm install mother  

Or, you can clone the git repository:

    $ git clone http://github.com/radiatemedia.com/mother.git

Or you can manually download an archive of project:

* [Latest Stable Release](https://github.com/radiatemedia/mother/archive/master.zip)
* [Latest Unstable Development Code](https://github.com/radiatemedia/mother/archive/develop.zip)
* [Release v0.0.1](https://github.com/radiatemedia/mother/archive/v0.0.1.zip)

If you clone the repository or download an archive, _Mother_ is in the
`lib/mother.js` file.

## Setup

If using in a [Node.js](http://nodejs.org/) project:

```javascript
Mother = require("mother"); // or: var Mother = require("mother");
```

If using in a browser-based web application, just include the
`lib/mother.js` file in your application (possibly after minifying it)
along with your other JavaScript assets. Then, include it in your web
page:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- ... -->
  <script type="text/javascript" src="scripts/mother.js"></script>
  <!-- ... -->
</head>
<body> ... </body>
</html>
```

## Usage

_Mother_ is designed to work well with server-side feature flipping
software. If using it in this type of project, just have your
server-side database of features and actors be rendered into the
necessary `Mother.register(features[, actors])` call in a script block
at the top of your page.

_Mother_ can also be used directly in Node.js applications, though
there's no built-in mechanism to persist the registry of features and
actors. You'll have to code and wire this up yourself, or hard-code them
in your app.

Finally, _Mother_ can also be used in client-side only scenarios.
However, you'll have to deal with either hard-coding or persisting your
feature and actor registrations.

### Basic Usage

Register a list of _features_ in your application:

```javascript
Mother.register({
  "feature1": true, // enabled
  "feature2": false // registered, but disabled
});
```

Then, surround your feature's implementation by a conditional that
queries whether _Mother_ allows said feature:

```javascript
if (Mother.allows("feature1")) {
  // implementation for "feature1"
} else {
  // code executed when feature1 isn't available ...
}
```

You'll generally only have a single
`Mother.register(features[, actors])` call at the top or beginning of
your application, followed by several
`Mother.allows(feature[, version])`
queries throughout.

### Actors

_Mother_ allows you to enable or disallow access to specific features
based on a <em>current actor</em>. Just clarify which actor's mother
we'll be querying with `Mother.of(actor)`. This saves `actor` as the
<em>current actor</em>. Then, whenever you ask whether _Mother_ allows a
specific feature, the answer will take into account the current actor.

```javascript
if (Mother.of("john").allows("feature2")) { // "john" is now the "current actor" in your app
  // executed if the mother of "john" specifically allows "feature2"
}
```

By default, there is no <em>current actor</em>. All queries are in
<em>global scope</em> and could be said to be against the <em>Universal
Mother</em>.

------------------------------------------------------------------------

Anyhow, for this functionality to actually be usable, you need to
include actor-specific information when you register your features.
Include this information in the optional `actors` parameter:

```javascript
Mother.register({
  "feature1": true, // globally enabled
  "feature2": false // disabled in "global scope"
}, {
  "john": { "feature2": true }, // overrides global setting for "john"
  "jane": { "feature3": true }  // this feature only available to "jane"
});

// We're in the default "global scope"
if (Mother.allows("feature2")) {
  console.log("This code won't be executed! 'feature2' is disabled globally");
}

Mother.of("john");
// ... "john" is "current actor" ...
if (Mother.allows("feature2")) {
  console.log("This code WILL execute: 'john' has access to 'feature2'");
}

Mother.of("jane");
// ... "jane" is "current actor" ...
if (Mother.allows("feature3")) {
  console.log("This demonstrates that features don't have to be 'mentioned' globally to be enabled for a specific actor");
}
```

In the above example, the `features` parameter to
`Mother.register(features[, actors])` enables "feature1" in global scope
while explicitly disabling "feature2". Then, the `actors` parameter
overrides the global "feature2" status by enabling it just for actor
"john". It also registers and enables "feature3" just for "jane".

Note that explicitly disabling a feature as was done with "feature2" in
the global scope is usually unnecessary. Only when a feature is enabled
globally and you want to disable it for a specific actor will you
actually do so. This is because actors inherit the global scope:

```javascript
Mother.register({
  "feature1": true // globally enabled
}, {
  "john": { "feature2": true } // overrides for "feature2"; inherits "feature1"
});

if (Mother.of("john").allows("feature1")) {
  console.log("This executes because 'john' inherited the global 'feature1' registration");
}
```

For more details, see the **[API](#api)** section below.

### Versions

Hopefully you won't ever need this functionality. However, there may be
times where it'll come in handy.

#### Background

If you ever find that you'd like to have `N` versions of the _same_
feature active and switched at the same time, then you can provide the
`version` parameter to your `Mother.allows(feature[, version])` queries
to ask if a specific version is currently enabled.

Normally this won't happen. You'll usually roll out some new feature
"x", complete with _Mother_ queries to slowly roll it out to more and
more actors and to do `A/B` testing. Then, after it's fully rolled out
to everyone, you come back in and clean out all the conditionals with
_Mother_ queries so that the feature is always on. You also remove any
feature "x" entries in your registration call and it's as if the
functionality was just added directly to your app without any feature
switching.

However, sometimes life isn't that simple and you may have cases where
you've got some actors who don't have access to feature "x" yet, some
who do, and you are then asked to make an updated _version_ of this
feature that only another subset of actors can see. In this scenario,
you've got two versions of feature "x". _Mother_ has support for `N`
versions of any feature so you're covered.

You could just use a naming convention and give each _version_ of your
feature a different name to accomplish the same thing. For example, you
could have features "x:1" and "x:2", but the direct support for
versioning by _Mother_ is even easier.

#### Details

Calling `Mother.allows(feature[, version])` with no `version` parameter
is the same as passing `1`. In other words, all calls implicitly
assume version `1` unless otherwise specified:

```javascript
Mother.register({
  "x": true,        // equivalent to: "x": { 1: true },
  "y": { 1: true }, // equivalent to: "y": true,
  "z": true         // implicit version 1
}, {
  "john": { "z": { 1: false, 2: true }},
  "jane": { "z": { 2: true,  3: true }} // odd, but legal
});

// explicitly query for version 1 of "x" though v1 registered implicitly
console.log("Version 1 of feature 'x' allowed globally? " + Mother.allows("x", 1));

// implicitly query for version 1 of "y" though v1 registered explicitly
console.log("Version 1 of feature 'y' allowed globally? " + Mother.allows("y"));

var actor, actors = [null, "john", "jane"];
for (var i = 0; i < actors.length; i++) {
  actor = actors[i] ? actors[i] : "global scope" // for display
  Mother.of(actors[i]); // select "global scope", then "john" and "jane" respectively

  if (Mother.allows("z", 3)) {
    console.log(actor + " has access to version 3 of z");
  }
  if (Mother.allows("z", 2)) {
    console.log(actor + " has access to version 2 of z");
  }
  if (Mother.allows("z", 1)) {
    console.log(actor + " has access to version 1 of z");
  }
}
```

Outputs:

    Version 1 of feature 'x' allowed globally? true
    Version 1 of feature 'y' allowed globally? true
    global scope has access to version 1 of z
    john has access to version 2 of z
    jane has access to version 3 of z
    jane has access to version 2 of z
    jane has access to version 1 of z

You'll usually only enable one version of a given feature for any actor
at a time. But, as the code above shows, it's possible to have multiple
versions enabled at a time. It's up to you to write correct conditional
logic to do the right thing for your app. For multiple version support
this'll usually be something like:

```javascript
if (Mother.allows("z", 3)) {
  console.log("Version 3 of 'z' code...");
} else if (Mother.allows("z", 2)) {
  console.log("Version 2 of 'z' code...");
} else if (Mother.allows("z")) { // implicitly queries for version 1
  console.log("Version 1 of 'z' code...");
} else {
  console.log("Alternative code for when feature 'z' is completely disabled (all versions)");
}
```

The `if/else-if/.../else` construct, starting with higher version
numbers first, will run the highest version of the feature that's
enabled.

### API

Mother has very few methods. They are:

*   `.register(features[, actors])`

    While `features` is always required, `actors` is optional. Both
    parameters (if provided) must be plain old JavaScript objects
    (POJOs). The return value is the _Mother_ object, allowing you to
    chain other calls. If there is a problem, such as invalid values in
    the parameters, then an `Error` is raised.

    Any and all previously registered features and/or actor data is
    cleared whenever this call is made. New registrations completely
    replace old ones.

    The structure or hierarchy of object for the parameters must follow
    some basic rules to define the globally-scoped features and actor-
    specific features.

    The `actors` POJO should have one property corresponding to each
    actor that you wish to provide actor-specific feature registration
    information for. The property name should correspond to the actor.
    Actors can be whatever you want them to be, semantically speaking,
    meaning they can be _users_, _accounts_, _businesses_, _groups_,
    _roles_, and/or anything else that makes sense for you application.

    You must come up with some way of mapping your actor entities to
    some value that, once _stringified_, uniquely identifies your actor.
    If you'll be supporting different _types_ of actors simultaneously
    (users and roles for example) then it's up to you to map your
    individual actors to values that will be unique globally, not just
    across the various types. For example:

    ```javascript
    // used to construct actor names for use by Mother
    function entityToActor(entity) {
      return entity.type + ":" + entity.id;
    }
    var actors = {};
    //
    // ... using entityToActor(), you manually construct/update actors
    // object for use in Mother.register() below ...
    //
    Mother.register({ "purchase": true }, actors);
    ```

    The values of the various properties in the `actors` object must
    follow the same structure and rules as the `features`
    parameter. So, for simplicity, only the structure of the `features`
    object will be described.

    The name of each property of the `features` object corresponds to
    the name of a feature to be registered. The value may be a simple,
    _truthy_ or _falsy_ literal value which will enable or disable the
    named feature respectively.

    The value may also be a POJO in which case the object will register
    and enable or disable specific versions. In this case, the _nested_
    object's property names must correspond to version identifiers while
    the property values indicate whether the associated version is
    enabled or not. The values of the version properties may be of any
    type except a `Function` and will be interpreted as _truthy_ or
    _falsy_ to enable or disable, respectively, the specific version.

*   `.allows(feature[, version])`

    This queries whether the named `feature` is currently allowed, based
    on the currently registered features and actors as well as the
    current actor (if set). While `feature` is required, `version` is
    optional but may be provided to specify whether a specific version
    of a feature is currently allowed. Omitting `version` is equivalent
    to providing `1` as the value for the parameter.

    The return value will be a _truthy_ or _falsy_ value that can be
    used as the condition for a conditional statement. The value is
    _truthy_ if the feature is currently allowed (enabled) and _falsy_
    if it's currently disallowed (disabled).

    For now there's no guarantee about the exacty type of the return
    value, other than its _truthiness_. This is because the plan is to
    allow _truthy_ results to optionally be meta-data POJO objects
    containing info provided during the feature registration process.

*   `.of([actor])`

    This sets the current actor to the value provided in the optional
    `actor` parameter. This state, much like feature and actor
    registrations is stored and used by _Mother_ for subsequent
    `.allows()` queries.

    The return value is the _Mother_ object, allowing you to chain other
    method calls. A common case for this is:

    ```javascript
    if (Mother.of("john").allows("snacking")) { ... }
    ```

    You may omit the `actor` parameter, or pass `null`, `false`, or
    `undefined` in order to clear the current actor so that subsequent
    queries will operate against the global scope instead of a specific
    actor.

    You may provide an `actor` that is not currently registered. This
    allows you to select your current actor prior to the `.register()`
    call if you so desired. If you make a query using `.allows()` while
    the current actor is an actor for which there's no registered
    information, then the query will effectively work as if no current
    actor was set. This is because the unknown actor effectively
    inherits the entire global feature registry since there's no actor-
    specific registration data for the actor.

*   `.clear()`

    This clears the current actor as set by `.of()` and all features
    and actors registered by `.register()`, leaving you with a clean,
    blank state. Primarily useful for testing. This is equivalent to
    calling:

    ```javascript
    Mother.register({}); // clears existing registrations
    Mother.of(); // clears existing "current actor"
    ```

    The return value is the _Mother_ object, allowing you to chain other
    method calls. While not terribly useful, it does make the following
    possible:

    ```javascript
    if (Mother.clear().register({}, { "john": { "snacking": true }}).of("john").allows("snacking")) { ... }
    ```

## Contributing

_Mother_ is open source and would love your help!

1. Fork the repository.
2. Create your own feature branch: `git checkout -b my-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push your branch to Github: `git push origin my-feature`
5. Create new pull request on Github.

By contributing changes, you agree to the terms of the Dojo Foundation's
Contributor License Agreement
([CLA](http://dojofoundation.org/about/cla)), Individual or Corporate as
appropriate, with Radiate Media as "the Foundation" in place of The Dojo
Foundation.

Also, when contributing changes:

* Please include tests with any changes and ensure the entire test suite passes.
* Don't modify the CHANGELOG or library version number.

## Contributors and Maintainers

_Mother_ is developed and maintained by
[Radiate Media](http://www.radiatemedia.com/).

The following individuals have written or in some way contributed to
_Mother_:

* Kendall Gifford ([zettabyte](https://github.com/zettabyte)), Radiate Media

## Support

Being such a small library and project, there's no mailing list for
_Mother_. If you have any problems or questions, please just submit an
issue to the issue tracker on Github:
https://github.com/radiatemedia/mother/issues

## License

_Mother_ is available under the terms of the MIT License. For more
information regarding license details, the full terms are available
in the [LICENSE](LICENSE) file located in the root of the project
folder.

A copy of the [Jasmine](http://pivotal.github.com/jasmine/) testing
framework is vendored and distributed with _Mother_ inside the
`test/vendor/jasmine-1.3.1` directory. Jasmine is also available under
the MIT License which is available in the
[test/vendor/jasmine-1.3.1/MIT.LICENSE](test/vendor/jasmine-1.3.1/MIT.LICENSE)
file.

Jasmine is Copyright © by [Pivotal Labs](http://pivotallabs.com/).

All other content is part of _Mother_ and is Copyright © 2013 by
[Radiate Media](http://www.radiatemedia.com/)

All rights reserved.

