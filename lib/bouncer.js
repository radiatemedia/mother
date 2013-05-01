(function() {

  // Save reference to global object (window in browsers)...
  var root = this;

  // Support CommonJS-style module use as well as simple web project use.
  // Technique inspired by Backbone (http://backbonejs.org/)...
  var Bouncer;
  if (typeof exports !== 'undefined') {
    Bouncer = exports;
  } else {
    Bouncer = root.Bouncer = {};
  }

  // Call this to set/reset the feature registry database.
  Bouncer.register = function(features, actors) {
    Bouncer.features = features;
  }

  // Call this to query whether a specific feature is enabled.
  Bouncer.allows = function(feature) {
    if (Bouncer.features[feature]) {
      return true;
    }
    return false;
  }

})();
