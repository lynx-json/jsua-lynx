require("../html-document-api");
var links = require("../../lib/builders/link-view-builder");
var containers = require("../../lib/builders/container-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / linkViewBuilder", function () {
  it("should return view for 'link' with no children", function () {
    var node = {
      spec: {
        hints: [ { name: "link" } ]
      },
      value: {
        href: "/foo",
        type: "text/plain"
      }
    };
    
    var buildChildViewsStub = sinon.stub(containers, "buildChildViews");
    buildChildViewsStub.returns(Promise.resolve([]));
    
    return links.linkViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(0);
      view.href.should.equal(node.value.href);
      view.href.should.equal(view.textContent);
      view.type.should.equal(node.value.type);
      buildChildViewsStub.called.should.be.true;
      buildChildViewsStub.restore();
    });
  });
  
  it("should return view for 'link' with children", function () {
    var node = {
      spec: {
        hints: [ { name: "link" } ]
      },
      value: {
        href: "/foo",
        type: "text/plain"
      }
    };
    
    var buildChildViewsStub = sinon.stub(containers, "buildChildViews");
    buildChildViewsStub.returns(Promise.resolve([document.createElement("div")]));
    
    return links.linkViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(1);
      view.href.should.equal(node.value.href);
      view.type.should.equal(node.value.type);
      buildChildViewsStub.called.should.be.true;
      buildChildViewsStub.restore();
    });
  });
  
  it("should set attribute 'follow' when on value", function () {
    var node = {
      spec: {
        hints: [ { name: "link" } ]
      },
      value: {
        href: "/foo",
        type: "text/plain",
        follow: 0
      }
    };
    
    var buildChildViewsStub = sinon.stub(containers, "buildChildViews");
    buildChildViewsStub.returns(Promise.resolve([]));
    
    return links.linkViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.getAttribute("data-lynx-follow").should.equal("0");
      buildChildViewsStub.restore();
    });
  });
  
  it("should set attribute 'follow' when on spec", function () {
    var node = {
      spec: {
        hints: [ { name: "link" } ],
        follow: 0
      },
      value: {
        href: "/foo",
        type: "text/plain"
      }
    };
    
    var buildChildViewsStub = sinon.stub(containers, "buildChildViews");
    buildChildViewsStub.returns(Promise.resolve([]));
    
    return links.linkViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.getAttribute("data-lynx-follow").should.equal("0");
      buildChildViewsStub.restore();
    });
  });
  
  it("should resolve the 'href' if a 'base' URI is present", function () {
    var node = {
      base: "http://example.com",
      spec: {
        hints: [ { name: "link" } ]
      },
      value: {
        href: "/foo",
        type: "text/plain"
      }
    };
    
    var buildChildViewsStub = sinon.stub(containers, "buildChildViews");
    buildChildViewsStub.returns(Promise.resolve([]));
    
    return links.linkViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.href.should.equal("http://example.com/foo");
      buildChildViewsStub.restore();
    });
  });
});
