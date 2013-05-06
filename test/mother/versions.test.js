var Mother;
if (typeof(exports) !== 'undefined') {
  Mother = require('../../lib/mother.js');
} else {
  Mother = this.Mother;
}

// Tests specific to the functionality supporting multiple versions of a given
// feature.
describe("Mother // Versioning Features", function() {
  beforeEach(function() {
    // Just to be sure all state is cleared...
    Mother.clear();
  });

  describe(".register(features) // ignoring +actors+ parameter", function() {

    it("allows you to register and simultaneously enable and/or disable multiple versions of multiple features", function() {
      Mother.register({
        "one":   true,
        "two":   { 1: false, 3: true },
        "three": { 2: true }
      });
      expect(Mother.allows("one",   1)).toBeTruthy();
      expect(Mother.allows("two",   1)).toBeFalsy();
      expect(Mother.allows("two",   3)).toBeTruthy();
      expect(Mother.allows("three", 1)).toBeFalsy();
      expect(Mother.allows("three", 2)).toBeTruthy();
    });

    describe("without explicit version specification(s)", function() {

      it("registers and enables version '1' of a feature when the 'feature definition' property is 'truthy', but not an object", function() {
        Mother.register({ "test": true });
        expect(Mother.allows("test", 1)).toBeTruthy();
      });

      it("registers but disables version '1' of a feature when the 'feature definition' property is 'falsy'", function() {
        Mother.register({ "test": false });
        expect(Mother.allows("test", 1)).toBeFalsy();
      });

      it("leaves all feature versions other than '1' unregistered, which is equivalent to being disabled", function() {
        Mother.register({ "test": true });
        expect(Mother.allows("test", 2)).toBeFalsy();
      });

      it("clears out any pre-existing registration, of all versions of the feature, before re-registering a version '1' of the feature", function() {
        Mother.register({ "test": { 1: false, 2: true }});
        Mother.register({ "test": true });            // clears old "test" feature, all versions
        expect(Mother.allows("test")).toBeTruthy();   // old v1 registration replaced w/enabled one
        expect(Mother.allows("test", 2)).toBeFalsy(); // old v2 registration just flat-out gone
      });

      it("fails if a 'feature definition' property's value is a Function", function() {
        // TODO: future versions may allow a function which dynamically determines
        // whether a feature is enabled or not
        registration = function() {
          callback   = function() { return true; };
          Mother.register({ "test": callback });
        };
        expect(registration).toThrow();
      });

    }); // describe("without explicit version specification(s)",...)

    describe("with explicit version speficiation(s)", function() {

      it("registers a version of a feature for each 'version definition' property in the 'feature definition' object", function() {
        Mother.register({ "test": { 2: true, 3: true }});
        expect(Mother.allows("test", 2)).toBeTruthy();
        expect(Mother.allows("test", 3)).toBeTruthy();
      });

      it("registers no versions of a feature when the 'feature definition' property is an empty object", function() {
        Mother.register({ "test": {}});
        expect(Mother.allows("test", 1)).toBeFalsy();
      });

      it("enables specified versions of a feature for which the 'version definition' property's value is 'truthy'", function() {
        Mother.register({ "test": { 0: true, 1: 1, 2: "enabled", 3: { "meta": "enabled" }}});
        expect(Mother.allows("test", 0)).toBeTruthy();
        expect(Mother.allows("test", 1)).toBeTruthy();
        expect(Mother.allows("test", 2)).toBeTruthy();
        expect(Mother.allows("test", 3)).toBeTruthy();
      });

      it("disables specified versions of a feature for which the 'version definition' property's value is 'falsy'", function() {
        Mother.register({ "test": { 0: false, 1: null, 2: undefined, 3: 0, 4: "" }});
        expect(Mother.allows("test", 0)).toBeFalsy();
        expect(Mother.allows("test", 1)).toBeFalsy();
        expect(Mother.allows("test", 2)).toBeFalsy();
        expect(Mother.allows("test", 3)).toBeFalsy();
        expect(Mother.allows("test", 4)).toBeFalsy();
      });

      it("does NOT register a default version '1' for the feature if no explicit 'version definition' for it is provided", function() {
        Mother.register({ "test": { 2: true }});
        expect(Mother.allows("test", 1)).toBeFalsy();
      });

      it("leaves all unspecified versions of a feature unregistered, which is equivalent to being disabled", function() {
        Mother.register({ "test": { 2: true }});
        expect(Mother.allows("test", 3)).toBeFalsy();
      });

      it("permits the value of a 'feature definition' property to be an empty object, registering no versions (including '1')", function() {
        Mother.register({ "test": {}});
        expect(Mother.allows("test", 1)).toBeFalsy();
      });

      it("fails if a 'feature definition' has a 'version definition' who's property's value is a Function", function() {
        // TODO: future versions may allow a function which dynamically determines
        // whether a specific version of a feature is enabled or not
        registration = function() {
          callback   = function() { return true; };
          Mother.register({ "test": { 1: callback }});
        };
        expect(registration).toThrow();
      });

      it("clears out any pre-existing registration, of all versions of the feature, before re-registring new versions", function() {
        Mother.register({ "test": { 1: false, 2: true, 3: true }});
        Mother.register({ "test": { 1: true, 2: false, 4: true }}); // clears old "test" feature, all versions
        expect(Mother.allows("test", 1)).toBeTruthy(); // old v1 registration replaced w/enabled one
        expect(Mother.allows("test", 2)).toBeFalsy();  // old v2 registration replaced w/disabled one
        expect(Mother.allows("test", 3)).toBeFalsy();  // old v3 registration just flat-out gone
        expect(Mother.allows("test", 4)).toBeTruthy(); // new v4 enabled registration created
      });

    }); // describe("with explicit version speficiation(s)",...)

  }); // describe(".register(features) // ignoring +actors+ parameter",...)

  describe(".allows(feature, version) // ignoring the 'current actor'", function() {

    describe("relying on +version+ parameter's default value", function() {

      it("returns a 'truthy' value if version '1' of +feature+ is enabled", function() {
        Mother.register({ "test": { 1: true }});
        expect(Mother.allows("test")).toBeTruthy();
      });

      it("returns a 'falsy' value if version '1' of +feature+ is disabled", function() {
        Mother.register({ "test": { 1: false }});
        expect(Mother.allows("test")).toBeFalsy();
      });

      it("returns a 'falsy' value if version '1' of +feature+ isn't even defined", function() {
        Mother.register({ "test": { 2: false }});
        expect(Mother.allows("test")).toBeFalsy();
      });

    }); // describe("relying on +version+ parameter's default value",...)

    it("returns a 'truthy' value if specified +version+ of +feature+ is enabled", function() {
      Mother.register({ "test": { 1: false, 2: true }});
      expect(Mother.allows("test", 2)).toBeTruthy();
    });

    it("returns a 'falsy' value if specified +version+ of +feature+ is disabled", function() {
      Mother.register({ "test": { 1: true, 2: false }});
      expect(Mother.allows("test", 2)).toBeFalsy();
    });

    it("returns a 'falsy' value if specified +version+ of +feature+ isn't even defined", function() {
      Mother.register({ "test": { 1: true }});
      expect(Mother.allows("test", 2)).toBeFalsy();
    });

    it("returns a 'falsy' value if +feature+ isn't even defined (for any version)", function() {
      Mother.register({ "other": true });
      expect(Mother.allows("test", 2)).toBeFalsy();
    });

  }); // describe(".allows(feature, version) // ignoring the 'current actor'",...)

  describe(".clear()", function() {
    it("clears out all feature registration state, including versions", function() {
      Mother.register({ "test": { 2: true }});
      Mother.clear();
      expect(Mother.allows("test", 2)).toBeFalsy();
    });
  }); // describe(".clear()",...)

}); // describe("Mother",...)
