require("../html-document-api");
var submits = require("../../lib/builders/submit-view-builder");
var containers = require("../../lib/builders/container-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("linkViewBuilder", function () {
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
    
    var buildChildViewsStub = sinon.stub(containers, "buildChildViews");
    buildChildViewsStub.returns([]);
    
    var view = submits.submitViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.children.length.should.equal(0);
    view.formAction.should.equal(node.value.action);
    view.formMethod.should.equal(node.value.method);
    view.formEnctype.should.equal(node.value.enctype);
    buildChildViewsStub.called.should.be.true;
    buildChildViewsStub.restore();
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
    
    var buildChildViewsStub = sinon.stub(containers, "buildChildViews");
    buildChildViewsStub.returns([{}]);
    
    var view = submits.submitViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.children.length.should.equal(1);
    view.formAction.should.equal(node.value.action);
    view.formMethod.should.equal("");
    view.formEnctype.should.equal("");
    buildChildViewsStub.called.should.be.true;
    buildChildViewsStub.restore();
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
    
    var buildChildViewsStub = sinon.stub(containers, "buildChildViews");
    buildChildViewsStub.returns([]);
    
    var view = submits.submitViewBuilder(node);
    
    expect(view).to.not.be.null;
    view["data-lynx-send"].should.equal("change");
    buildChildViewsStub.restore();
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
    
    var buildChildViewsStub = sinon.stub(containers, "buildChildViews");
    buildChildViewsStub.returns([]);
    
    var view = submits.submitViewBuilder(node);
    
    expect(view).to.not.be.null;
    view["data-lynx-send"].should.equal("change");
    buildChildViewsStub.restore();
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
    
    var buildChildViewsStub = sinon.stub(containers, "buildChildViews");
    buildChildViewsStub.returns([]);
    
    var view = submits.submitViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.formAction.should.equal("http://example.com/foo");
    buildChildViewsStub.restore();
  });
});
