var Mother;
if (typeof(exports) !== 'undefined') {
  Mother = require('../lib/mother.js');
} else {
  Mother = this.Mother;
}

// Tests of the features used in the most simple of use cases. Specifically,
// testing as if support for "actors" and "versions" didn't exist.
describe("Mother // Basic Functionality", function() {
  beforeEach(function() {
    // Just to be sure all state is cleared...
    Mother.clear();
  });

  describe(".register(features) // ignoring +actors+ parameter and 'versions' of features", function() {

    it("permits registration of enabled features", function() {
      Mother.register({ "test": true });
      expect(Mother.allows("test")).toBeTruthy();
    });

    it("permits registration of disabled features", function() {
      Mother.register({ "test": false });
      expect(Mother.allows("test")).toBeFalsy();
    });

    it("leaves all unspecified features unregistered, which is equivalent to being disabled", function() {
      Mother.register({ "test": true });
      expect(Mother.allows("other")).toBeFalsy();
    });

    it("permits the +features+ parameter to be an empty object", function() {
      Mother.register({}); // doesn't raise error
      expect(Mother.allows("test")).toBeFalsy();
    });

    it("fails if you don't provide an object for the +features+ parameter", function() {
      var registration = function() { Mother.register("string literal that's not an object"); };
      expect(registration).toThrow();
      registration = function() { Mother.register(); };
      expect(registration).toThrow();
    });

    it("removes all previously registered features before registering new ones", function() {
      Mother.register({ "test": true });
      Mother.register({ "other": true });
      expect(Mother.allows("test")).toBeFalsy();
    });

    it("allows you to register and simultaneously enable and/or disable multiple features", function() {
      Mother.register({
        "one":   true,
        "two":   false,
        "three": true
      });
      expect(Mother.allows("one"  )).toBeTruthy();
      expect(Mother.allows("two"  )).toBeFalsy();
      expect(Mother.allows("three")).toBeTruthy();
    });

    it("enables a feature as long as the associated property is any 'truthy', non-object value", function() {
      Mother.register({ "one": true, "two": 2, "three": "enabled" });
      expect(Mother.allows("one"  )).toBeTruthy();
      expect(Mother.allows("two"  )).toBeTruthy();
      expect(Mother.allows("three")).toBeTruthy();
    });

    it("disables a feature as long as the associated property is 'falsy'", function() {
      Mother.register({ "one": false, "two": null, "three": undefined, "four": 0, "five": "" });
      expect(Mother.allows("one"  )).toBeFalsy();
      expect(Mother.allows("two"  )).toBeFalsy();
      expect(Mother.allows("three")).toBeFalsy();
      expect(Mother.allows("four" )).toBeFalsy();
      expect(Mother.allows("five" )).toBeFalsy();
    });

  }); // describe(".register(features) // ignoring +actors+ parameter and 'versions' of features",...)

  describe(".allows(feature) // ignoring +version+ parameter and the 'current actor'", function() {

    it("returns a 'truthy' value if +feature+ is enabled", function() {
      Mother.register({ "test": true });
      expect(Mother.allows("test")).toBeTruthy();
    });

    it("returns a 'falsy' value if +feature+ is disabled", function() {
      Mother.register({ "test": false });
      expect(Mother.allows("test")).toBeFalsy();
    });

    it("returns a 'falsy' value if +feature+ isn't even defined", function() {
      Mother.register({ "other": true });
      expect(Mother.allows("test")).toBeFalsy();
    });

  }); // describe(".allows(feature) // ignoring +version+ parameter and the 'current actor'",...)

  describe(".clear()", function() {
    it("clears out all feature registration state", function() {
      Mother.register({ "test": true });
      Mother.clear();
      expect(Mother.allows("test")).toBeFalsy();
    });
  }); // describe(".clear()",...)

}); // describe("Mother // Basic Functionality",...)
