require("../html-document-api");
var links = require("../../lib/builders/link-view-builder");
var containers = require("../../lib/builders/container-view-builder");
var jsua = require("jsua");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / linkViewBuilder", function () {
  var node, buildChildViewsStub;
  
  beforeEach(function () {
    node = {
      spec: {
        hints: [ { name: "link" } ]
      },
      value: {
        href: "/foo",
        type: "text/plain"
      }
    };
    
    buildChildViewsStub = sinon.stub(containers, "buildChildViews");
    buildChildViewsStub.returns(Promise.resolve([]));
  });
  
  afterEach(function () {
    buildChildViewsStub.restore();
  });
  
  it("should return view for 'link' with no children", function () {
    return links.linkViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(0);
      view.href.should.equal(node.value.href);
      view.href.should.equal(view.textContent);
      view.type.should.equal(node.value.type);
      expect(buildChildViewsStub.called).to.equal(true);
    });
  });
  
  it("should return view for 'link' with children", function () {
    buildChildViewsStub.returns(Promise.resolve([document.createElement("div")]));
    
    return links.linkViewBuilder(node).then(function (view) {
      expect(view).to.not.equal(null);
      view.children.length.should.equal(1);
      view.href.should.equal(node.value.href);
      view.type.should.equal(node.value.type);
      expect(buildChildViewsStub.called).to.equal(true);
    });
  });
  
  it("should set attribute 'follow' when on value", function () {
    node.value.follow = 0;
    
    return links.linkViewBuilder(node).then(function (view) {
      expect(view).to.not.equal(null);
      view.getAttribute("data-lynx-follow").should.equal("0");
    });
  });
  
  it("should set attribute 'follow' when on spec", function () {
    node.spec.follow = 0;
    
    return links.linkViewBuilder(node).then(function (view) {
      expect(view).to.not.equal(null);
      view.getAttribute("data-lynx-follow").should.equal("0");
    });
  });
  
  it("should resolve the 'href' if a 'base' URI is present", function () {
    node.base = "http://example.com";
    
    return links.linkViewBuilder(node).then(function (view) {
      expect(view).to.not.equal(null);
      view.href.should.equal("http://example.com/foo");
    });
  });
  
  describe("when clicked", function () {
    var fetchStub;
    
    beforeEach(function () {
      fetchStub = sinon.stub(jsua, "fetch");
    });
    
    afterEach(function () {
      fetchStub.restore();
    });
    
    it("should fetch", function () {
      node.base = "http://example.com";
      
      return links.linkViewBuilder(node).then(function (view) {
        view.click();
        
        expect(fetchStub.calledOnce).to.equal(true);
        var args = fetchStub.getCall(0).args;
        expect(args[0]).to.equal("http://example.com/foo");
        expect(args[1]).to.not.equal(null);
        expect(args[1].origin).to.equal(view);
      });
    });
  });
});
