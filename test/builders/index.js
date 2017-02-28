var building = require("../../lib/building");
var builders = require("../../lib/builders");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

global.document = {
  createElement: function (tagName) {
    return {};
  }
};

describe("builders", function () {
  describe("resolveViewBuilder", function () {
    it("should return null when no registrations", function () {
      let registrations = [];
      let hints = ["text"];
      let input = false;
      expect(builders.resolveViewBuilder(registrations, hints, input)).to.be.null;
    });
    
    it("should return null when no hints", function () {
      let registrations = [
        {
          hint: "text",
          builder: function () {},
          input: false
        }
      ];
      let hints = [];
      let input = false;
      expect(builders.resolveViewBuilder(registrations, hints, input)).to.be.null;
    });
    
    it("should return null when hint doesn't match", function () {
      let registrations = [
        {
          hint: "container",
          builder: function () {},
          input: false
        }
      ];
      let hints = ["text"];
      let input = false;
      expect(builders.resolveViewBuilder(registrations, hints, input)).to.be.null;
    });
    
    it("should return null when input doesn't match", function () {
      let registrations = [
        {
          hint: "text",
          builder: function () {},
          input: true
        }
      ];
      let hints = ["text"];
      let input = false;
      expect(builders.resolveViewBuilder(registrations, hints, input)).to.be.null;
    });
    
    it("should return builder when matching", function () {
      let registrations = [
        {
          hint: "text",
          builder: function () {},
          input: false
        }
      ];
      let hints = ["text"];
      let input = false;
      expect(builders.resolveViewBuilder(registrations, hints, input)).to.not.be.null;
    });
    
    it("should return builder for most specific hint", function () {
      function textBuilderFunc() {}
      function lineBuilderFunc() {}
      let registrations = [
        {
          hint: "text",
          builder: textBuilderFunc,
          input: false
        },
        {
          hint: "line",
          builder: lineBuilderFunc,
          input: false
        }
      ];
      let hints = ["line", "text"];
      let input = false;
      
      let builder = builders.resolveViewBuilder(registrations, hints, input);
      expect(builder).to.not.be.null;
      builder.should.equal(lineBuilderFunc);
    });
  });
  
  describe("nodeViewBuilder", function () {
    it("should throw when no params", function () {
      expect(function () {
        builders.nodeViewBuilder();
      }).to.throw;
    });
    
    it("should throw when param doesn't have 'spec' property", function () {
      expect(function () {
        builders.nodeViewBuilder({});
      }).to.throw;
    });
    
    it("should throw when param doesn't have 'spec.hints' property", function () {
      expect(function () {
        builders.nodeViewBuilder({ spec: {} });
      }).to.throw;
    });
    
    it("should throw when 'spec.hints' property is empty", function () {
      expect(function () {
        builders.nodeViewBuilder({ spec: { hints: [] } });
      }).to.throw;
    });
    
    it("should throw when a view builder is not be resolved", function () {  
      let resolveViewBuilderStub = sinon.stub(builders, "resolveViewBuilder");
      resolveViewBuilderStub.returns(null);
      
      expect(function () {
        builders.nodeViewBuilder({ spec: { hints: [ { name: "text" } ] } });
      }).to.throw(Error);
      
      resolveViewBuilderStub.called.should.be.true;
      resolveViewBuilderStub.restore();
    });
    
    it("should call the resolved builder function", function () {  
      let resolveViewBuilderStub = sinon.stub(builders, "resolveViewBuilder");
      let builderStub = sinon.stub();
      builderStub.returns({});
      resolveViewBuilderStub.returns(builderStub);
      
      let view = builders.nodeViewBuilder({ spec: { hints: [ { name: "text" } ] } });
      
      expect(view).to.not.be.null;
      builderStub.called.should.be.true;
      resolveViewBuilderStub.called.should.be.true;
      resolveViewBuilderStub.restore();
    });
  });
  
  describe("textViewBuilder", function () {
    it("should return view", function () {
      let node = {
        value: "Hello, World!"
      };
      
      let view = builders.textViewBuilder(node);
      
      expect(view).to.not.be.null;
      view.textContent.should.equal(node.value);
    });
  });
});
