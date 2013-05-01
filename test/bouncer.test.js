describe("Bouncer", function() {
  describe(".register(features, actors)", function() {

    it("defines and enables features for which there's a property in +features+ with a truthy value", function() {
      Bouncer.register({ 'test': true });
      expect(Bouncer.allows('test')).toBeTruthy();
    });
/*
    it("enables every feature specified in +features+ (each property name defines a feature) globally", function() {
    });

    it("allows you to enable a specific version of a global feature provided in +features+", function() {
    });

    it("allows you to enable multiple versions of a global feature provided in +features+", function() {
    });

    it("leaves all unspecified versions of a global feature disabled when enabling specific versions", function() {
    });

    it("enables version _1_, by default, of any global feature in +features+ where no version number is specified", function() {
    });

    it("only enables version _1_ when enabling a global feature in +features+ without specifying any specific versions", function() {
    });
*/

  }); // describe(".register(features, actors)",...)

  describe(".allows(feature)", function() {
    beforeEach(function() {
      Bouncer.register({
        'test': true
      });
    });

    it("returns a 'truthy' value if the named +feature+ is enabled", function() {
      expect(Bouncer.allows('test')).toBeTruthy();
    });

  }); // describe(".allows(feature)",...)
});   // describe("Bouncer",...)
