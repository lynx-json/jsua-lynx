require("../html-document-api");
var submits = require("../../lib/builders/submit-view-builder");
var containers = require("../../lib/builders/container-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / submitViewBuilder", function () {
  beforeEach(function () {
    buildChildViewsStub = sinon.stub(containers, "buildChildViews");
  });
  
  afterEach(function () {
    buildChildViewsStub.restore();
  });
  
  var buildChildViewsStub;
  
  it("should return view for 'submit' with no children", function () {
    var node = {
      spec: {
        hints: [ { name: "submit" } ]
      },
      value: {
        action: "/foo",
        method: "GET",
        enctype: "application/x-www-form-urlencoded"
      }
    };
    
    buildChildViewsStub.returns(Promise.resolve([]));
    
    return submits.submitViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(0);
      view.formAction.should.equal(node.value.action);
      view.formMethod.should.equal(node.value.method);
      view.formEnctype.should.equal(node.value.enctype);
      buildChildViewsStub.called.should.be.true;
    });
  });
  
  it("should return view for 'submit' with children", function () {
    var node = {
      spec: {
        hints: [ { name: "submit" } ]
      },
      value: {
        action: "/foo"
      }
    };
    
    buildChildViewsStub.returns(Promise.resolve([document.createElement("div")]));
    
    return submits.submitViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(1);
      view.formAction.should.equal(node.value.action);
      expect(view.formMethod).to.be.undefined;
      expect(view.formEnctype).to.be.undefined;
      buildChildViewsStub.called.should.be.true;
    });
  });
  
  it("should set attribute 'send' when on value", function () {
    var node = {
      spec: {
        hints: [ { name: "submit" } ]
      },
      value: {
        action: "/foo",
        send: "change"
      }
    };
    
    buildChildViewsStub.returns(Promise.resolve([]));
    
    return submits.submitViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.getAttribute("data-lynx-send").should.equal("change");
    });
  });
  
  it("should set attribute 'send' when on spec", function () {
    var node = {
      spec: {
        hints: [ { name: "submit" } ],
        send: "change"
      },
      value: {
        action: "/foo"
      }
    };
    
    buildChildViewsStub.returns(Promise.resolve([]));
    
    return submits.submitViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.getAttribute("data-lynx-send").should.equal("change");
    });
  });
  
  it("should resolve the 'action' if a 'base' URI is present", function () {
    var node = {
      base: "http://example.com",
      spec: {
        hints: [ { name: "submit" } ]
      },
      value: {
        action: "/foo"
      }
    };
    
    buildChildViewsStub.returns(Promise.resolve([]));
    
    return submits.submitViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.formAction.should.equal("http://example.com/foo");
    });
  });
});
