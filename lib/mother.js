/*
 * Mother - a very small library to assist with feature flipping!
 *
 * See the README.md file included in the distribution of the library
 * for details on how to work with Mother.
 *
 * Mother is Copyright (C) 2013 by Radiate Media
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

(function() {

  // Save reference to global object (window in browsers)...
  var root = this;

  // Support CommonJS-style module use as well as simple web project use.
  // Technique inspired by Backbone (http://backbonejs.org/)...
  var Mother;
  if (typeof(exports) !== 'undefined') {
    Mother = exports;
  } else {
    Mother = root.Mother = {};
  }

  // Current version of the library
  Mother.VERSION = "0.0.1";

  // Storage of all of Mother's state (grouped in one object to make resetting
  // simpler...
  var state = { "features": {}, "actors": {}, "actor": null };

  // Call to clear out and reset all of Mother's state to her initial values
  Mother.clear = function() {
    state.features = {};
    state.actors   = {};
    state.actor    = null;
  };

  // Call this to set the current actor.
  Mother.of = function(actor) {
    state.actor = actor;
  };

  // Utility function used to construct an entry object in a feature registry,
  // either the global registry or actor-specific registry. Validates the
  // feature definition and returns the value, if no error raised, that should
  // be stored for the named feature, as the value in the registry.
  function registryEntry(feature, definition) {
    var entry, versions = {};

    // See if definition is a function (invalid for now)
    if (typeof(definition) === 'function') {
      throw new Error("invalid definition for feature: " + feature + " (Functions not yet allowed for feature definitions)");
    }

    // See if feature is explicitly disabled
    if (!definition) {
      return { 1: false };
    }

    // See if we're just registering a default version '1'
    if (typeof(definition) !== 'object') {
      return { 1: true };
    }

    // Caller has specified specific versions to register...
    for (version in definition) {
      entry = definition[version];
      if (typeof(entry) === 'function') {
        throw new Error("invalid definition for feature's version: " + feature + " version " + version + " (Functions not yet allowed for feature definitions)");
      }
      versions[version] = entry; // allow implicit truthiness to propagate
    }
    return versions;
  }

  // Call this to set/reset the feature registry database.
  Mother.register = function(features, actors) {
    var scoped = {}, global = {};
    var entry;

    if (typeof(features) !== 'object') {
      throw new Error("invalid type for +features+ parameter: " + typeof(features) + " (should be a plain JavaScript object)");
    }

    // Create global feature registry...
    for (feature in features) {
      global[feature] = registryEntry(feature, features[feature]);
    }

    // Create scope (actor-specific) feature registries...
    if (actors) {
      if (typeof(actors) !== 'object') {
        throw new Error("invalid type for +actors+ parameter: " + typeof(actors) + " (should be a plain JavaScript object)");
      }
      for (actor in actors) {
        entry = actors[actor];
        if (typeof(entry) !== 'object') {
          throw new Error("invalid feature-definition object for actor '" + actor + "'; invalid type: " + typeof(entry) + " (should be a plain JavaScript object)");
        }
        scoped[actor] = {};
        for (feature in entry) {
          scoped[actor][feature] = registryEntry(feature, entry[feature]);
        }
      }
    }

    // Update registry, replacing the old with the new...
    state.features = global;
    state.actors   = scoped;
  };

  // Call this to query whether a specific feature is enabled.
  Mother.allows = function(feature, version) {
    var entry;
    var global = state.features[feature];
    var scoped = state.actors[state.actor];

    if (typeof(version) === 'undefined' && version !== null) {
      version = 1; // check for version '1' of feature by default
    }

    // See if we have an scoped (actor-specific) value first
    if (typeof(scoped) === 'object' && typeof(scoped[feature]) === 'object') {
      entry = scoped[feature][version];
      if (typeof(entry) !== 'undefined') {
        return entry;
      }
    }

    // Use global feature registry
    if (!global) {
      return false;
    }
    return global[version];
  };

})();

