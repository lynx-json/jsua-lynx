var building = require("../../lib/building");
var builders = require("../../lib/builders");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

// FileReader mock
global.FileReader = function () {
  return {
    onloadend: null,
    readAsText: function (blob) {
      if (this.onloadend) this.onloadend(FileReader.eventParam);
    }
  };
};

describe("building", function () {
  beforeEach(function () {
    FileReader.eventParam = null;
    building.registrations.splice(0);
  });
  
  describe("register", function () {
    it("should throw when no params", function () {
      expect(function () {
        building.register();
      }).to.throw(Error);
    });
    
    it("should throw with empty 'hint' param", function () {
      expect(function () {
        building.register("");
      }).to.throw(Error);
    });
    
    it("should throw without 'builder' param", function () {
      expect(function () {
        building.register("text");
      }).to.throw(Error);
    });
    
    it("should throw with null 'builder' param", function () {
      expect(function () {
        building.register("text", null);
      }).to.throw(Error);
    });
    
    it("should not throw with valid params", function () {
      expect(function () {
        building.register("text", function () {});
      }, true).to.not.throw(Error);
    });
    
    it("should not throw without optional params", function () {
      expect(function () {
        building.register("text", function () {});
      }).to.not.throw(Error);
    });
  });
  
  describe("registrations", function () {
    it("should record registrations", function () {
      let hint = "text";
      let builder = function () {};
      let input = true;
      
      building.register(hint, builder, input);
      
      building.registrations.length.should.equal(1);
      building.registrations[0].hint.should.equal(hint);
      building.registrations[0].builder.should.equal(builder);
      building.registrations[0].input.should.equal(input);
    });
  });
  
  describe("build", function () {
    it("should reject when no params", function () {
      building.build().should.be.rejected;
    });
    
    it("should reject when param doesn't have 'blob' property", function () {
      building.build({}).should.be.rejected;
    });
    
    it("should reject when no params to FileReader onloadend event", function () {
      FileReader.eventParam = null;
      building.build({ blob: {} }).should.be.rejected;
    });
    
    it("should reject when param to FileReader onloadend event doesn't have 'target' property", function () {
      FileReader.eventParam = {};
      building.build({ blob: {} }).should.be.rejected;
    });
    
    it("should reject when param to FileReader onloadend event doesn't have 'target.result' property", function () {
      FileReader.eventParam = { target: {} };
      building.build({ blob: {} }).should.be.rejected;
    });
    
    it("should reject when invalid Lynx content is present", function () {
      let node = {};
      let content = JSON.stringify(node);
      let eventParam = { target: { result: content } };
      FileReader.eventParam = eventParam;
      
      var nodeViewBuilderStub = sinon.stub(builders, "nodeViewBuilder");
      let view = {};
      nodeViewBuilderStub.returns(view);
      
      let promiseForView = building.build({ blob: {}});
      nodeViewBuilderStub.restore();
      
      promiseForView.should.be.rejected;
    });
    
    it("should resolve when valid Lynx content is present", function (done) {
      let node = {
        spec: {
          hints: [ "text" ]
        },
        value: "Hello"
      };
      let content = JSON.stringify(node);
      let eventParam = { target: { result: content } };
      FileReader.eventParam = eventParam;
      
      var nodeViewBuilderStub = sinon.stub(builders, "nodeViewBuilder");
      let view = {};
      nodeViewBuilderStub.returns(view);
      
      let promiseForView = building.build({ url: "http://example.com/", blob: {}});
      nodeViewBuilderStub.restore();
      
      promiseForView.then(function (result) {
        nodeViewBuilderStub.called.should.be.true;
        result.should.equal(view);
      }).then(done, done);
    });
  });
});
