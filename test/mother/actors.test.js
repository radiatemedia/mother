var Mother;
if (typeof(exports) !== 'undefined') {
  Mother = require('../../lib/mother.js');
} else {
  Mother = this.Mother;
}

// Tests specific to the functionality supporting feature switching based on a
// currently-set 'actor' (user, company, group, role, account, whatever).
describe("Mother // of Current Actor", function() {
  beforeEach(function() {
    // Just to be sure all state is cleared...
    Mother.clear();
  });

  describe(".of(actor)", function() {

    it("sets the current actor to +actor+ for future Mother.allows() calls", function() {
      Mother.register({}, { "john": { "test": true }});
      Mother.of("john");
      expect(Mother.allows("test")).toBeTruthy();
    });

    it("fails if +actor+ isn't specified", function() {
      var call = function() { Mother.as(); };
      expect(call).toThrow();
    });

    it("allows +actor+ to be a 'falsy' value, enabling 'global' (non-actor) mode", function() {
      Mother.of("john");
      Mother.register({ "test": true }, { "john": { "test": false }});
      Mother.of(null); // we're in 'global' mode now, now longer 'john'
      expect(Mother.allows("test")).toBeTruthy();
    });

  }); // describe(".of(actor)",...)

  describe(".register(features, actors)", function() {
    var actor = 'john';

    var forActor = function(features, result) {
      if (typeof(result) === 'undefined' && result !== null) {
        result = {};
      }
      result[actor] = features;
      return result;
    };

    beforeEach(function() {
      Mother.of(actor);
    });

    describe("ignoring 'versions' of features", function() {

      it("permits you to omit the +actors+ option", function() {
        var registration = function() { Mother.register({}); };
        expect(registration).not.toThrow();
      });

      it("fails if +actors+ is provided as a 'truthy' value but isn't an object", function() {
        var registration = function() { Mother.register({}, "not a POJO"); };
        expect(registration).toThrow();
      });

      it("permits me to register no actor-specific features explicitely by passing an empty object for +actors+", function() {
        Mother.register({}, {});
        expect(Mother.allows("test")).toBeFalsy();
      });

      it("registers actor-specific features if they're not specified globally in +features+", function() {
        Mother.register({}, forActor({ "test": true }));
        expect(Mother.allows("test")).toBeTruthy();
      });

      it("enables the actor-specific feature, overriding a global 'disabled' state", function() {
        Mother.register({ "test": false }, forActor({ "test": true }));
        expect(Mother.allows("test")).toBeTruthy();
      });

      it("disables the actor-specific feature, overriding a global 'enabled' state", function() {
        Mother.register({ "test": true }, forActor({ "test": false }));
        expect(Mother.allows("test")).toBeFalsy();
      });

      it("leaves all unspecified actor-specific features at the global state", function() {
        Mother.register({ "one": true, "two": false }, forActor({ "three": true }));
        expect(Mother.allows("one")).toBeTruthy(); // inherited from global
        expect(Mother.allows("two")).toBeFalsy();  // inherited from global
      });

      it("allows you to register and simultaneously enable and/or disabled multiple features for a specific actor", function() {
        Mother.register({ "one": false, "two": true }, forActor({ "one": true, "two": false, "three": true }));
        expect(Mother.allows("one")).toBeTruthy();
        expect(Mother.allows("two")).toBeFalsy();
        expect(Mother.allows("three")).toBeTruthy();
      });

      it("registers and enables version '1' of a feature when the 'feature definition' property for the actor is 'truthy', but not an object", function() {
        Mother.register({}, forActor({ "test": true }));
        expect(Mother.allows("test", 1)).toBeTruthy();
      });

      it("registers and disables version '1' of a feature when the 'feature definition' property for the actor is 'falsy'", function() {
        Mother.register({}, forActor({ "test": false }));
        expect(Mother.allows("test", 1)).toBeFalsy();
      });

      it("leaves all feature versions other than '1' alone, defaulting to their global state", function() {
        Mother.register({ "test": { 1: false, 2: true }}, forActor({ "test": true }));
        expect(Mother.allows("test", 1)).toBeTruthy();
        expect(Mother.allows("test", 2)).toBeTruthy();
        expect(Mother.allows("test", 3)).toBeFalsy();
      });

      it("clears out all pre-existing actor-specific registration, before re-registering a version '1' of the feature", function() {
        Mother.register({}, forActor({ "test": { 1: false, 2: true }}));
        Mother.register({}, forActor({ "test": true })); // clears old "test" feature, all versions
        expect(Mother.allows("test")).toBeTruthy();      // old v1 registration replaced w/enabled one
        expect(Mother.allows("test", 2)).toBeFalsy();    // old v2 registration just flat-out gone
      });

      it("fails if an actor-specific 'feature definition' property's value is a Function", function() {
        // TODO: future versions may allow a function which dynamically
        // determines whether a feature is enabled for the user or not
        var registration = function() {
          var callback = function() { return true };
          Mother.register({}, forActor({ "test": callback }));
        };
        expect(registration).toThrow();
      });

    }); // describe("ignoring 'versions' of features",...)

    describe("with explicit version specification(s)", function() {

      it("registers a version of an actor-specific feature for each 'version definition' property in the actor's 'feature definition' object", function() {
        Mother.register({}, forActor({ "test": { 2: true, 3: true }}));
        expect(Mother.allows("test", 2)).toBeTruthy();
        expect(Mother.allows("test", 3)).toBeTruthy();
      });

      it("registers no versions of an actor-specific feature when the actor's 'feature definition' property is an empty object", function() {
        Mother.register({}, forActor({ "test": {}}));
        expect(Mother.allows("test", 1)).toBeFalsy();
      });

      it("enables specified versions of an actor-specifc feature for which the actor's 'version definition' property's value is 'truthy'", function() {
        Mother.register({}, forActor({ "test": { 0: true, 1: 1, 2: "enabled", 3: { "meta": "enabled" }}}));
        expect(Mother.allows("test", 0)).toBeTruthy();
        expect(Mother.allows("test", 1)).toBeTruthy();
        expect(Mother.allows("test", 2)).toBeTruthy();
        expect(Mother.allows("test", 3)).toBeTruthy();
      });

      it("disables specified versions of an actor-specific feature for which the actor's 'version definition' property's value is 'falsy'", function() {
        Mother.register({}, forActor({ "test": { 0: false, 1: null, 2: undefined, 3: 0, 4: "" }}));
        expect(Mother.allows("test", 0)).toBeFalsy();
        expect(Mother.allows("test", 1)).toBeFalsy();
        expect(Mother.allows("test", 2)).toBeFalsy();
        expect(Mother.allows("test", 3)).toBeFalsy();
        expect(Mother.allows("test", 4)).toBeFalsy();
      });

      it("does NOT register a default version '1' for the actor-specific feature if no explicit 'version definition' for it is provided", function() {
        Mother.register({}, forActor({ "test": { 2: true }}));
        expect(Mother.allows("test", 1)).toBeFalsy();
      });

      it("leaves all unspecified versions of an actor-specific feature unregistered, causing them to inherit any global registrations", function() {
        Mother.register({ "test": { 1: true, 3: false }}, forActor({ "test": { 2: true }}));
        expect(Mother.allows("test", 1)).toBeTruthy(); // inherited explicitely enabled version
        expect(Mother.allows("test", 2)).toBeTruthy(); // enabled version (actor-scope)
        expect(Mother.allows("test", 3)).toBeFalsy();  // inherited explicitely disabled version
        expect(Mother.allows("test", 4)).toBeFalsy();  // inherited implicitly disabled version
      });

      it("permits the value of an actor's 'feature definition' property to be an empty object, registering no versions (including '1')", function() {
        Mother.register({}, forActor({ "test": {}}));
        expect(Mother.allows("test", 1)).toBeFalsy();
      });

      it("fails if an actor's 'feature definition' has a 'version definition' who's property's value is a Function", function() {
        // TODO: future versions may allow a function which dynamically
        // determines whether a specific version of an actor-specific feature is
        // enabled or not
        var registration = function() {
          var callback = function() { return true; };
          Mother.register({}, forActor({ "test": { 1: callback }}));
        };
        expect(registration).toThrow();
      });

      it("clears out any pre-existing actor-specific registration, of all versions of the feature, before re-registring new versions", function() {
        Mother.register({}, forActor({ "test": { 1: false, 2: true, 3: true }}));
        Mother.register({}, forActor({ "test": { 1: true, 2: false, 4: true }})); // clears old "test" feature, all versions
        expect(Mother.allows("test", 1)).toBeTruthy(); // old v1 registration replaced w/enabled one
        expect(Mother.allows("test", 2)).toBeFalsy();  // old v2 registration replaced w/disabled one
        expect(Mother.allows("test", 3)).toBeFalsy();  // old v3 registration just flat-out gone
        expect(Mother.allows("test", 4)).toBeTruthy(); // new v4 enabled registration created
      });

    }); // describe("with explicit version specification(s)",...)

  }); // describe(".register(features, actors)",...)

  describe(".allows(feature) // with a 'current actor'", function() {
    var actor = 'john';

    var forActor = function(features, result) {
      if (typeof(result) === 'undefined' && result !== null) {
        result = {};
      }
      result[actor] = features;
      return result;
    };

    beforeEach(function() {
      Mother.of(actor);
    });

    describe("relying on +version+ parameter's default value", function() {

      it("returns a 'truthy' value if version '1' of the named +feature+ is enabled for current actor", function() {
        Mother.register({}, forActor({ "test": { 1: true }}));
        expect(Mother.allows("test")).toBeTruthy();
      });

      it("returns a 'falsy' value if version '1' of the named +feature+ is disabled for current actor", function() {
        Mother.register({}, forActor({ "test": { 1: false }}));
        expect(Mother.allows("test")).toBeFalsy();
      });

      it("returns a 'falsy' value if version '1' of the named +feature+ isn't even defined for current actor or globally", function() {
        Mother.register({}, forActor({ "test": { 2: false }}));
        expect(Mother.allows("test")).toBeFalsy();
      });

      it("returns a 'truthy' value if version '1' of the named +feature+ isn't even defined for current actor, but is enabled globally", function() {
        Mother.register({ "test": { 1: true }}, forActor({ "test": { 2: false }}));
        expect(Mother.allows("test")).toBeTruthy();
      });

    }); // describe("relying on +version+ parameter's default value",...)

    it("returns a 'truthy' value if specified +version+ of +feature+ is enabled for current actor", function() {
      Mother.register({}, forActor({ "test": { 1: false, 2: true }}));
      expect(Mother.allows("test", 2)).toBeTruthy();
    });

    it("returns a 'falsy' value if specified +version+ of +feature+ is disabled for current actor", function() {
      Mother.register({}, forActor({ "test": { 1: true, 2: false }}));
      expect(Mother.allows("test", 2)).toBeFalsy();
    });

    it("returns a 'falsy' value if specified +version+ of +feature+ isn't even defined for current actor or globally", function() {
      Mother.register({}, forActor({ "test": { 1: true }}));
      expect(Mother.allows("test", 2)).toBeFalsy();
    });

    it("returns a 'falsy' value if +feature+ isn't even defined (for any version) for current actor or globally", function() {
      Mother.register({}, forActor({ "other": true }));
      expect(Mother.allows("test", 2)).toBeFalsy();
    });

    it("returns a 'truthy' value if specified +version+ of +feature+ isn't even defined for current actor, but is enabled globally", function() {
      Mother.register({ "test": { 2: true }}, forActor({ "test": { 1: false }}));
      expect(Mother.allows("test", 2)).toBeTruthy();
    });

    it("returns a 'truthy' value if +feature+ isn't even defined (for any version) for current actor, but +version+ is enabled globally", function() {
      Mother.register({ "test": { 2: true }}, forActor({ "other": true }));
      expect(Mother.allows("test", 2)).toBeTruthy();
    });

  }); // describe(".allows(feature) // with a 'current actor'",...)

  describe(".clear()", function() {
    it("clears out the current actor", function() {
      Mother.of("john");
      Mother.clear();
      Mother.register({}, { "john": { "test": true }});
      expect(Mother.allows("test")).toBeFalsy();
    });
  }); // describe(".clear()",...)

}); // describe("Mother // of Current Actor",...)
