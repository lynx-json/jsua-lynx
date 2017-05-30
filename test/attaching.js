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

describe("attaching / createRootAttacher", function () {
  it("should throw when 'rootView' param is not set", function () {
    expect(function () {
      attaching.createRootAttacher();
    }).to.throw;
  });

  it("should return attacher when 'rootView' param is not set", function () {
    var rootView = document.createElement("div");
    var attacher = attaching.createRootAttacher(rootView);
    expect(attacher).to.be.ok;
  });

  it("should attach to rootView", function () {
    var rootView = document.createElement("div");
    var attacher = attaching.createRootAttacher(rootView);
    var result = {
      view: document.createElement("div")
    };
    var attachment = attacher(result);
    var detachedViews = attachment.attach();
    expect(result.view.parentElement).to.equal(rootView);
  });
});

describe("attaching / setFocusedView", function () {
  it("should choose a focus view based on url hash if it exists");
  it("should choose a focus view based on the lynx `focus` document property if it exists");
  it("should set focus to the result of `lynxGetFocusableView` if the function exists and returns a view");
  it("should set focus to the view itself otherwise");
});
