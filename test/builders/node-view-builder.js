require("../html-document-api");
var builders = require("../../lib/builders");
var options = require("../../lib/builders/options");
var validation = require("../../lib/builders/validation");
var resolver = require("../../lib/builders/resolve-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / nodeViewBuilder", function () {
  beforeEach(function () {
    resolveViewBuilderStub = sinon.stub(resolver, "resolveViewBuilder");
  });
  
  afterEach(function () {
    resolveViewBuilderStub.restore();
  });
  
  function runTest(node, assert) {
    var builderStub = sinon.stub();
    builderStub.returns(document.createElement("div"));
    
    resolveViewBuilderStub.returns(builderStub);
    
    return builders.nodeViewBuilder(node).then(assert).then(function () {
      builderStub.called.should.be.true;
      resolveViewBuilderStub.called.should.be.true;
    });
  }
  
  var resolveViewBuilderStub;
  
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
    
    resolveViewBuilderStub.returns(null);
    
    return builders.nodeViewBuilder({ spec: { hints: [ "text" ] } }).catch(function (err) {
      resolveViewBuilderStub.called.should.be.true;
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
        hints: [ "group", "container" ],
        labeledBy: "node2"
      },
      value: {
        scope: "http://lynx-json.org/tests/"
      }
    };
    
    return runTest(node, function (view) {
      expect(view).to.not.be.null;
      view.getAttribute("data-lynx-hints").should.equal(node.spec.hints.join(" "));
      view.getAttribute("data-lynx-scope").should.equal(node.value.scope);
      view.getAttribute("data-lynx-name").should.equal(node.spec.name);
      view.getAttribute("data-lynx-labeled-by").should.equal(node.spec.labeledBy);
    });
  });
  
  it("should add visibility accessors and publish change events", function () {  
    var node = { 
      spec: {
        visibility: "visible",
        hints: [ "container" ]
      },
      value: {
        scope: "http://lynx-json.org/tests/"
      }
    };
    
    return runTest(node, function (view) {
      expect(view).to.not.be.null;
      expect(view.lynxGetVisibility).to.not.be.null;
      expect(view.lynxSetVisibility).to.not.be.null;
      view.getAttribute("data-lynx-visibility").should.equal("visible");
      view.lynxGetVisibility().should.equal("visible");
      
      return new Promise(function (resolve) {
        view.addEventListener("lynx-visibility-change", function () {
          view.lynxGetVisibility().should.equal("hidden");
          resolve();
        });
        
        view.lynxSetVisibility("hidden");
      });
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
      value: ""
    };
    
    return runTest(node, function (view) {
      expect(view).to.not.be.null;
      view.getAttribute("data-lynx-input").should.equal("true");
    });
  });
  
  it("should add options extensions to view", function () {  
    var node = { 
      spec: { 
        name: "node1",
        hints: [ { name: "text" } ],
        input: true,
        options: "node2"
      },
      value: ""
    };
    
    sinon.stub(options, "addOptionsExtensionsToView");
    
    return runTest(node, function (view) {
      expect(view).to.not.be.null;
      options.addOptionsExtensionsToView.calledOnce.should.equal(true);
      options.addOptionsExtensionsToView.restore();
    });
  });
  
  it("should add validation extensions to view", function () {  
    var node = { 
      spec: { 
        name: "node1",
        hints: [ { name: "text" } ],
        input: true,
        validation: {
          required: {
            invalid: "propertyRef"
          }
        }
      },
      value: ""
    };
    
    sinon.stub(validation, "addValidationExtensionsToView");
    
    return runTest(node, function (view) {
      expect(view).to.not.be.null;
      validation.addValidationExtensionsToView.calledOnce.should.equal(true);
      validation.addValidationExtensionsToView.restore();
    });
  });
  
  it("should set attribute 'data-lynx-submitter'", function () {  
    var node = { 
      spec: { 
        name: "node1",
        hints: [ "text" ],
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
