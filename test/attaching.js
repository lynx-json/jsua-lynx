require("./html-document-api");
var attaching = require("../dist/attaching");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("attaching / scopeRealmAttacher", function () {
  var result, getOriginStub, isOutOfContextStub, nearestContentView, findNearestScopedContentViewStub;
  
  beforeEach(function () {
    result = { 
      content: {
        blob: {}
      },
      view: document.createElement("div")
    };
    
    result.view.setAttribute("data-lynx-realm", "http://example.com/foo/");
    
    getOriginStub = sinon.stub(attaching, "getOrigin");
    getOriginStub.returns({});
    
    isOutOfContextStub = sinon.stub(attaching, "isOutOfContext");
    isOutOfContextStub.returns(false);
    
    nearestContentView = {};
    nearestContentView.lynxSetEmbeddedView = sinon.stub();
    
    findNearestScopedContentViewStub = sinon.stub(attaching, "findNearestScopedContentView");
    findNearestScopedContentViewStub.returns(nearestContentView);
  });
  
  afterEach(function () {
    getOriginStub.restore();
    isOutOfContextStub.restore();
    findNearestScopedContentViewStub.restore();
  });
  
  it("should attach to a scoped content view", function () {
    var attachment = attaching.scopeRealmAttacher(result);
    
    expect(attachment).to.not.equal(undefined);
    expect(attachment.attach).to.not.equal(undefined);
    attachment.attach();
    
    expect(nearestContentView.lynxSetEmbeddedView.calledOnce).to.equal(true);
    var args = nearestContentView.lynxSetEmbeddedView.getCall(0).args;
    expect(args[0]).to.equal(result.view);
    expect(args[1]).to.equal(result.content.blob);
  });
  
  it("should discard out of context views", function () {
    isOutOfContextStub.returns(true);
    var attachment = attaching.scopeRealmAttacher(result);
    expect(attachment).to.not.equal(null);
    expect(attachment.discard).to.equal(true);
  });
});

describe("attaching / scopeIncludesRealm", function () {
  it("should be true if scope equals realm", function () {
    var scope = "http://example.com/foo/";
    var realm = "http://example.com/foo/";
    var result = attaching.scopeIncludesRealm(scope, realm);
    expect(result).to.equal(true);
  });
  
  it("should be true if scope includes realm", function () {
    var scope = "http://example.com/foo/";
    var realm = "http://example.com/foo/bar/";
    var result = attaching.scopeIncludesRealm(scope, realm);
    expect(result).to.equal(true);
  });
  
  it("should be true if scheme or host vary by case", function () {
    var scope = "HTTP://EXAMPLE.COM/foo/";
    var realm = "http://example.com/foo/";
    var result = attaching.scopeIncludesRealm(scope, realm);
    expect(result).to.equal(true);
  });
});
