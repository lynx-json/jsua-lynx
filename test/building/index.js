require("../html-document-api");
var building = require("../../lib/building");
var builders = require("../../lib/builders");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("building", function () {
  beforeEach(function () {
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
      var hint = "text";
      var builder = function () {};
      var input = true;
      
      building.register(hint, builder, input);
      
      building.registrations.length.should.equal(1);
      building.registrations[0].hint.should.equal(hint);
      building.registrations[0].builder.should.equal(builder);
      building.registrations[0].input.should.equal(input);
    });
  });
  
  describe("build", function () {
    it("should reject when no params", function () {
      building.build()
        .should.be.rejectedWith(Error);
    });
    
    it("should reject when param doesn't have 'blob' property", function () {
      building.build({})
        .should.be.rejectedWith(Error);
    });
    
    it("should reject when no params to FileReader onloadend event", function () {
      building.build({ blob: {} })
        .should.be.rejectedWith(Error);
    });
    
    it("should reject when param to FileReader onloadend event doesn't have 'target' property", function () {
      building.build({ blob: {} })
        .should.be.rejectedWith(Error);
    });
    
    it("should reject when param to FileReader onloadend event doesn't have 'target.result' property", function () {
      building.build({ blob: {} })
        .should.be.rejectedWith(Error);
    });
    
    it("should reject when invalid Lynx content is present", function () {
      var eventParam = { target: { result: "" } };
      
      var nodeViewBuilderStub = sinon.stub(builders, "nodeViewBuilder");
      var view = {};
      nodeViewBuilderStub.returns(Promise.resolve(view));
      
      function restore(param) {
        nodeViewBuilderStub.restore();
        if (param instanceof Error) throw param;
        return param;
      }
      
      building.build({ blob: {}})
        .then(restore, restore)
        .should.be.rejectedWith(Error);
    });
    
    it("should resolve when valid Lynx content is present", function () {
      var nodeViewBuilderStub = sinon.stub(builders, "nodeViewBuilder");
      var view = document.createElement("div");
      nodeViewBuilderStub.returns(Promise.resolve(view));
      
      var node = {
        spec: {
          hints: [ "text" ]
        },
        value: "Hello"
      };
      var blob = new Blob([JSON.stringify(node)], { type: "application/lynx+json" });
      var content = { url: "http://example.com/", blob: blob };
      
      building.build(content).then(function (view) {
        nodeViewBuilderStub.restore();
        return view;
      }).then(function (view) {
        nodeViewBuilderStub.called.should.be.true;
        expect(view).to.not.be.null;
        view.getAttribute("data-content-url").should.equal(content.url);
        view.getAttribute("data-content-type").should.equal(content.blob.type);
      }).should.not.be.rejectedWith(Error);
    });
    
    it("should set attribute 'realm'", function () {
      var nodeViewBuilderStub = sinon.stub(builders, "nodeViewBuilder");
      var view = document.createElement("div");
      nodeViewBuilderStub.returns(Promise.resolve(view));
      
      var node = {
        realm: "http://lynx-json.org/tests/",
        spec: {
          hints: [ "text" ]
        },
        value: "Hello"
      };
      var blob = new Blob([JSON.stringify(node)], { type: "application/lynx+json" });
      var content = { url: "http://example.com/", blob: blob };
      
      building.build(content)
      .then(function (view) {
        nodeViewBuilderStub.restore();
        return view;
      })
      .then(function (view) {
        nodeViewBuilderStub.called.should.be.true;
        expect(view).to.not.be.null;
        view.getAttribute("data-lynx-realm").should.equal(node.realm);
      }).should.not.be.rejectedWith(Error);
    });
  });
});
