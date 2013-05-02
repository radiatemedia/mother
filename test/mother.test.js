var Mother;
if (typeof(exports) !== 'undefined') {
  Mother = require('../lib/mother.js');
} else {
  Mother = this.Mother;
}

describe("Mother", function() {

  describe(".register(features)", function() {
    it("permits simple, global, un-versioned registration of enabled features", function() {
      Mother.register({ 'test': true });
      expect(Mother.allows('test')).toBeTruthy();
    });

    it("permits simple, global, un-versioned registration of disabled features", function() {
      Mother.register({ 'test': false });
      expect(Mother.allows('test')).toBeFalsy();
    });

    it("leaves all unspecified features unregistered, which is equivalent to being disabled", function() {
      Mother.register({ 'test': true });
      expect(Mother.allows('other')).toBeFalsy();
    });

    it("allows me to register no features by passing an empty object for +features+", function() {
      registration = function() { Mother.register({}); };
      expect(registration).not.toThrow();
    });

    it("removes all previously registered features when called", function() {
      Mother.register({ 'test': true });
      Mother.register({});
      expect(Mother.allows('test')).toBeFalsy();
    });

    it("fails if you don't provide an object for the +features+ parameter", function() {
      registration = function() { Mother.register("string literal that's not an object"); };
      expect(registration).toThrow();
    });

    describe("with no explicit version specifiation(s)", function() {
      it("registers and enables version '1' of a feature for which there's a 'truthy' property in +features+ with a non-object value", function() {
        Mother.register({ 'test': true });
        expect(Mother.allows('test', 1)).toBeTruthy();
      });

      it("registers but disables version '1' of a feature for which there's a 'falsy' property in +features+", function() {
        Mother.register({ 'test': false });
        expect(Mother.allows('test', 1)).toBeFalsy();
      });

      it("leaves all feature versions other than '1' unregistered, which is equivalent to being disabled", function() {
        Mother.register({ 'test': true });
        expect(Mother.allows('test', 2)).toBeFalsy();
      });

      it("fails if a feature-definition property's value is a Function", function() {
        // TODO: future versions may allow a function which dynamically determines
        // whether a feature is enabled or not
        registration = function() { Mother.register({ 'test': function() {}}); };
        expect(registration).toThrow();
      });

      it("replaces any pre-existing registration, of any/all versions of the feature with version '1' of a feature", function() {
        Mother.register({ 'test': { 1: false, 2: true }});
        Mother.register({ 'test': true });
        expect(Mother.allows('test')).toBeTruthy();   // old v1 registration replaced w/enabled one
        expect(Mother.allows('test', 2)).toBeFalsy(); // old v2 registration just flat-out gone
      });
    }); // describe("no version(s) specified",...)

    describe("with explicit version speficiation(s)", function() {
      it("registers a specific version of a feature when +features+ property's value is an object, called the 'versions' definition", function() {
        Mother.register({ 'test': { 2: true }});
        expect(Mother.allows('test', 2)).toBeTruthy();
      });

      it("registers and enables specified version of a feature for which there's a 'truthy' entry in associated 'versions' definition", function() {
        Mother.register({ 'test': { 0: true }});
        expect(Mother.allows('test', 0)).toBeTruthy();
      });

      it("registers but disables specified version of a feature for which there's a 'falsy' entry in associated 'versions' definition", function() {
        Mother.register({ 'test': { 2: false }});
        expect(Mother.allows('test', 2)).toBeFalsy();
      });

      it("does NOT register a default version '1' for the feature if a 'versions' definition is provided (that itself doesn't define it)", function() {
        Mother.register({ 'test': { 2: true }});
        expect(Mother.allows('test', 1)).toBeFalsy();
      });

      it("leaves all unspecified versions of a feature unregistered, which is equivalent to being disabled", function() {
        Mother.register({ 'test': { 2: true }});
        expect(Mother.allows('test', 3)).toBeFalsy();
      });

      it("allows me to register no versions of a feature by passing an empty object for as the associated 'versions' definition", function() {
        registration = function() { Mother.register({ 'test': {}}); };
        expect(registration).not.toThrow();
        expect(Mother.allows('test', 1)).toBeFalsy();
      });

      it("registers and enables a version for each 'truthy' entry in associated 'versions' definition", function() {
        Mother.register({ 'test': { 1: true, 2: true, 3: true }});
        expect(Mother.allows('test', 1)).toBeTruthy();
        expect(Mother.allows('test', 2)).toBeTruthy();
        expect(Mother.allows('test', 3)).toBeTruthy();
      });

      it("registers but disables a version for each 'falsy' entry in associated 'versions' definition", function() {
        Mother.register({ 'test': { 1: false, 2: false, 3: false }});
        expect(Mother.allows('test', 1)).toBeFalsy();
        expect(Mother.allows('test', 2)).toBeFalsy();
        expect(Mother.allows('test', 3)).toBeFalsy();
      });

      it("registers and either enables or disables multiple versions for a feature based on 'versions' definition entries and their 'truthiness'", function() {
        Mother.register({ 'test': { 0: true, 1: false, 2: true, 3: false }});
        expect(Mother.allows('test', 0)).toBeTruthy();
        expect(Mother.allows('test', 1)).toBeFalsy();
        expect(Mother.allows('test', 2)).toBeTruthy();
        expect(Mother.allows('test', 3)).toBeFalsy();
      });

      it("fails if an associated 'versions' definition has a property value that's a Function", function() {
        // TODO: future versions may allow a function which dynamically determines
        // whether a specific version of a feature is enabled or not
        registration = function() { Mother.register({ 'test': { 1: function() {} }}); };
        expect(registration).toThrow();
      });

      it("replaces any pre-existing registration, of any/all versions of the feature with new registration", function() {
        Mother.register({ 'test': { 1: false, 2: true, 3: true }});
        Mother.register({ 'test': { 1: true, 2: false, 4: true }});
        expect(Mother.allows('test', 1)).toBeTruthy();
        expect(Mother.allows('test', 2)).toBeFalsy();
        expect(Mother.allows('test', 3)).toBeFalsy();
        expect(Mother.allows('test', 4)).toBeTruthy();
      });
    }); // describe("with explicit version speficiation(s)",...)

    it("registers and either enables or disables multiple features, each possibly w/multiple versions in one shot", function() {
      Mother.register({
        'test': true,
        'other': { 1: false, 3: true },
        'last': { 2: true }
      });
      expect(Mother.allows('test',  1)).toBeTruthy();
      expect(Mother.allows('other', 1)).toBeFalsy();
      expect(Mother.allows('other', 2)).toBeFalsy();
      expect(Mother.allows('other', 3)).toBeTruthy();
      expect(Mother.allows('last',  1)).toBeFalsy();
      expect(Mother.allows('last',  2)).toBeTruthy();
    });
  }); // describe(".register(features)",...)

  describe(".register(features, actors)", function() {
    // TODO: implement actors support
  }); // describe(".register(features, actors)",...)

  describe(".allows(feature)", function() {
    it("returns a 'truthy' value if version '1' of the named +feature+ is enabled", function() {
      Mother.register({ 'test': { 1: true }});
      expect(Mother.allows('test')).toBeTruthy();
    });

    it("returns a 'falsy' value if version '1' of the named +feature+ is disabled", function() {
      Mother.register({ 'test': { 1: false }});
      expect(Mother.allows('test')).toBeFalsy();
    });

    it("returns a 'falsy' value if version '1' of the named +feature+ isn't even defined", function() {
      Mother.register({ 'test': { 2: false }});
      expect(Mother.allows('test')).toBeFalsy();
    });

    it("returns a 'falsy' value if the named +feature+ isn't even defined (for any version)", function() {
      Mother.register({});
      expect(Mother.allows('test')).toBeFalsy();
    });
  }); // describe(".allows(feature)",...)

  describe(".allows(feature, version)", function() {
    it("returns a 'truthy' value if specified +version+ of named +feature+ is enabled", function() {
      Mother.register({ 'test': { 1: false, 2: true }});
      expect(Mother.allows('test', 2)).toBeTruthy();
    });

    it("returns a 'falsy' value if specified +version+ of named +feature+ is disabled", function() {
      Mother.register({ 'test': { 1: true, 2: false }});
      expect(Mother.allows('test', 2)).toBeFalsy();
    });

    it("returns a 'falsy' value if specified +version+ of named +feature+ isn't even defined", function() {
      Mother.register({ 'test': { 1: true }});
      expect(Mother.allows('test', 2)).toBeFalsy();
    });

    it("returns a 'falsy' value if named +feature+ isn't even defined (for any version)", function() {
      Mother.register({});
      expect(Mother.allows('test', 2)).toBeFalsy();
    });
  }); // describe(".allows(feature, version)",...)

}); // describe("Mother",...)