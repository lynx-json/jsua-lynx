require("../html-document-api");
var builders = require("../../lib/builders");
var resolver = require("../../lib/builders/resolve-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

function runTest(node, assert) {
  var builderStub = sinon.stub();
  builderStub.returns(document.createElement("div"));
  
  var resolveViewBuilderStub = sinon.stub(resolver, "resolveViewBuilder");
  resolveViewBuilderStub.returns(builderStub);
  
  return builders.nodeViewBuilder(node).then(assert).then(function () {
    builderStub.called.should.be.true;
    resolveViewBuilderStub.called.should.be.true;
    resolveViewBuilderStub.restore();
  });
}

describe("builders / nodeViewBuilder", function () {
  it("should reject when no params", function () {
    return builders.nodeViewBuilder().catch(function (err) {
      expect(err).to.be.an("error");
    });
  });
  
  it("should reject when param doesn't have 'spec' property", function () {
    return builders.nodeViewBuilder({}).catch(function (err) {
      expect(err).to.be.an("error");
    });
  });
  
  it("should reject when param doesn't have 'spec.hints' property", function () {
    return builders.nodeViewBuilder({ spec: {} }).catch(function (err) {
      expect(err).to.be.an("error");
    });
  });
  
  it("should reject when 'spec.hints' property is empty", function () {
    return builders.nodeViewBuilder({ spec: { hints: [] } }).catch(function (err) {
      expect(err).to.be.an("error");
    });
  });
  
  it("should reject when a view builder is not be resolved", function () {  
    var resolveViewBuilderStub = sinon.stub(resolver, "resolveViewBuilder");
    resolveViewBuilderStub.returns(null);
    
    return builders.nodeViewBuilder({ spec: { hints: [ { name: "text" } ] } }).catch(function (err) {
      resolveViewBuilderStub.called.should.be.true;
      resolveViewBuilderStub.restore();
      throw err;
    }).catch(function (err) {
      expect(err).to.be.an("error");
    });
  });
  
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
    
    return runTest(node, function (view) {
      expect(view).to.not.be.null;
      view.getAttribute("data-lynx-hints").should.equal(node.spec.hints.map(hint => hint.name).join(" "));
      view.getAttribute("data-lynx-visibility").should.equal(node.spec.visibility);
      view.getAttribute("data-lynx-scope").should.equal(node.value.scope);
      view.getAttribute("data-lynx-name").should.equal(node.spec.name);
      view.getAttribute("data-lynx-labeled-by").should.equal(node.spec.labeledBy);
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
    
    return runTest(node, function (view) {
      expect(view).to.not.be.null;
      view.getAttribute("data-lynx-option").should.equal("true");
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
    
    return runTest(node, function (view) {
      expect(view).to.not.be.null;
      view.getAttribute("data-lynx-input").should.equal("true");
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
    
    return runTest(node, function (view) {
      expect(view).to.not.be.null;
      view.getAttribute("data-lynx-options").should.equal(node.spec.options);
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
    
    return runTest(node, function (view) {
      expect(view).to.not.be.null;
      view.getAttribute("data-lynx-submitter").should.equal(node.spec.submitter);
    });
  });
});
