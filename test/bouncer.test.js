describe("Bouncer", function() {
  describe(".register(features, actors)", function() {

    it("raises an 'invalid argument' exception if +features+ isn't a POJO (Plain Old JavaScript Object)", function() {
      expect(Bouncer.register(            )).toThrow('invalid argument');
      expect(Bouncer.register(null        )).toThrow('invalid argument');
      expect(Bouncer.register(true        )).toThrow('invalid argument');
      expect(Bouncer.register(false       )).toThrow('invalid argument');
      expect(Bouncer.register([          ])).toThrow('invalid argument');
      expect(Bouncer.register("not a POJO")).toThrow('invalid argument');
      expect(Bouncer.register(3.1415926535)).toThrow('invalid argument');
    });

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

    it("allows +actors+ to be +null+ or undefined", function() {
    });
  });
});
