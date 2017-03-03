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
    let resolveViewBuilderStub = sinon.stub(resolver, "resolveViewBuilder");
    resolveViewBuilderStub.returns(null);
    
    expect(function () {
      builders.nodeViewBuilder({ spec: { hints: [ { name: "text" } ] } });
    }).to.throw(Error);
    
    resolveViewBuilderStub.called.should.be.true;
    resolveViewBuilderStub.restore();
  });
  
  it("should call the resolved builder function", function () {  
    let resolveViewBuilderStub = sinon.stub(resolver, "resolveViewBuilder");
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
