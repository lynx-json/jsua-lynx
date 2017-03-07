require("../html-document-api");
var builders = require("../../lib/builders");
var resolver = require("../../lib/builders/resolve-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / nodeViewBuilder", function () {
  it("should reject when no params", function () {
    builders.nodeViewBuilder().should.be.rejectedWith(Error);
  });
  
  it("should reject when param doesn't have 'spec' property", function () {
    builders.nodeViewBuilder({}).should.be.rejectedWith(Error);
  });
  
  it("should reject when param doesn't have 'spec.hints' property", function () {
    builders.nodeViewBuilder({ spec: {} }).should.be.rejectedWith(Error);
  });
  
  it("should reject when 'spec.hints' property is empty", function () {
    builders.nodeViewBuilder({ spec: { hints: [] } }).should.be.rejectedWith(Error);
  });
  
  it("should reject when a view builder is not be resolved", function () {  
    var resolveViewBuilderStub = sinon.stub(resolver, "resolveViewBuilder");
    resolveViewBuilderStub.returns(null);
    
    builders.nodeViewBuilder({ spec: { hints: [ { name: "text" } ] } }).should.be.rejectedWith(Error);
        
    resolveViewBuilderStub.called.should.be.true;
    resolveViewBuilderStub.restore();
  });
  
  function runTest(node, assert) {
    var resolveViewBuilderStub = sinon.stub(resolver, "resolveViewBuilder");
    var builderStub = sinon.stub();
    builderStub.returns(document.createElement());
    resolveViewBuilderStub.returns(builderStub);
    
    builders.nodeViewBuilder(node).then(assert).then(function () {
      builderStub.called.should.be.true;
      resolveViewBuilderStub.called.should.be.true;
      resolveViewBuilderStub.restore();
    });
  }
  
  it("should call the resolved builder function", function () {  
    var node = { 
      spec: { 
        name: "node1",
        visibility: "visible",
        hints: [ { name: "group" }, { name: "container" } ],
        labeledBy: "node2"
      },
      value: {
        scope: "http://lynx-json.org/tests/"
      }
    };
    
    runTest(node, function (view) {
      expect(view).to.not.be.null;
      view["data-lynx-hints"].should.equal(node.spec.hints.map(hint => hint.name).join(" "));
      view["data-lynx-visibility"].should.equal(node.spec.visibility);
      view["data-lynx-scope"].should.equal(node.value.scope);
      view["data-lynx-name"].should.equal(node.spec.name);
      view["data-lynx-labeled-by"].should.equal(node.spec.labeledBy);
    });
  });
  
  it("should set attribute 'data-lynx-option'", function () {  
    var node = { 
      spec: { 
        hints: [ { name: "group" }, { name: "container" } ],
        option: true
      },
      value: {}
    };
    
    runTest(node, function (view) {
      expect(view).to.not.be.null;
      view["data-lynx-option"].should.equal("true");
    });
  });
  
  it("should set attribute 'data-lynx-input'", function () {  
    var node = { 
      spec: { 
        name: "node1",
        hints: [ { name: "text" } ],
        input: true
      },
      value: {}
    };
    
    runTest(node, function (view) {
      expect(view).to.not.be.null;
      view["data-lynx-input"].should.equal("true");
    });
  });
  
  it("should set attribute 'data-lynx-options'", function () {  
    var node = { 
      spec: { 
        name: "node1",
        hints: [ { name: "text" } ],
        options: "node2"
      },
      value: {}
    };
    
    runTest(node, function (view) {
      expect(view).to.not.be.null;
      view["data-lynx-options"].should.equal(node.spec.options);
    });
  });
  
  it("should set attribute 'data-lynx-submitter'", function () {  
    var node = { 
      spec: { 
        name: "node1",
        hints: [ { name: "text" } ],
        submitter: "node2"
      },
      value: {}
    };
    
    runTest(node, function (view) {
      expect(view).to.not.be.null;
      view["data-lynx-submitter"].should.equal(node.spec.submitter);
    });
  });
});
