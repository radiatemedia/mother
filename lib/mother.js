(function() {

  // Save reference to global object (window in browsers)...
  var root = this;

  // Support CommonJS-style module use as well as simple web project use.
  // Technique inspired by Backbone (http://backbonejs.org/)...
  var Mother;
  if (typeof exports !== 'undefined') {
    Mother = exports;
  } else {
    Mother = root.Mother = {};
  }

  // Call this to set/reset the feature registry database.
  Mother.register = function(features, actors) {
    var registry = {};
    if (typeof(features) !== 'object') {
      throw new Error("invalid type for +features+ parameter: " + typeof(features) + " (should be a plain JavaScript object)");
    }

    for (feature in features) {
      definition = features[feature];
      if (typeof(definition) === 'function') {
        throw new Error("invalid definition for feature: " + feature + " (Functions not yet allowed for feature definitions)");
      }
      if (definition) {
        // See if we're just registering a default version '1' or whether caller
        // has specified specific versions to register...
        if (typeof(definition) === 'object') {
          // List of versions provided...
          registry[feature] = {};
          for (version in definition) {
            enabled = definition[version];
            if (typeof(enabled) === 'function') {
              throw new Error("invalid definition for feature's version: " + feature + " version " + version + " (Functions not yet allowed for feature definitions)");
            }
            registry[feature][version] = enabled; // allow implicit truthiness to propagate
          }
        } else {
          // Register a default version '1' (enabled)...
          registry[feature] = { 1: true };
        }
      } else {
        // In theory, we still define the feature as "disabled" but this is, for
        // our implementation, effectively the same as simply not defining it.
        // If this fact ever changes, then register disabled feature (v1) here.
      }
    }
    // Update registry, replacing the old with the new...
    Mother.features = registry;
  }

  // Call this to query whether a specific feature is enabled.
  Mother.allows = function(feature, version) {
    var registry = Mother.features[feature];
    if (!registry) {
      return false;
    }
    if (typeof(version) === 'undefined' && version !== null) {
      version = 1;
    }
    return registry[version];
  }

})();
