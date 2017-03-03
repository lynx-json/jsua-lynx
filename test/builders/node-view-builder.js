require("../html-document-api");
var builders = require("../../lib/builders");
var resolver = require("../../lib/builders/resolve-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / nodeViewBuilder", function () {
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
    var resolveViewBuilderStub = sinon.stub(resolver, "resolveViewBuilder");
    resolveViewBuilderStub.returns(null);
    
    expect(function () {
      builders.nodeViewBuilder({ spec: { hints: [ { name: "text" } ] } });
    }).to.throw(Error);
    
    resolveViewBuilderStub.called.should.be.true;
    resolveViewBuilderStub.restore();
  });
  
  it("should call the resolved builder function", function () {  
    var resolveViewBuilderStub = sinon.stub(resolver, "resolveViewBuilder");
    var builderStub = sinon.stub();
    builderStub.returns(document.createElement());
    resolveViewBuilderStub.returns(builderStub);
    
    var node = { 
      spec: { 
        name: "node1",
        visibility: "visible",
        hints: [ { name: "group" }, { name: "container" } ] 
      },
      value: {
        scope: "http://lynx-json.org/tests/"
      }
    };
    
    var view = builders.nodeViewBuilder(node);
    
    expect(view).to.not.be.null;
    view["data-lynx-hints"].should.equal(node.spec.hints.join(" "));
    view["data-lynx-visibility"].should.equal(node.spec.visibility);
    view["data-lynx-scope"].should.equal(node.value.scope);
    view["data-lynx-name"].should.equal(node.spec.name);
    builderStub.called.should.be.true;
    resolveViewBuilderStub.called.should.be.true;
    resolveViewBuilderStub.restore();
  });
});
