require("../html-document-api");
var links = require("../../dist/builders/link-view-builder");
var containers = require("../../dist/builders/container-view-builder");
var jsua = require("@lynx-json/jsua");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / linkViewBuilder / createDataUri", function () {
  it("should create data URI for link with utf-8 'data'");
  it("should create data URI for link with base64 'data'");
  it("should create data URI for link with JSON object 'data'");
  it("should create data URI for link with JSON array 'data'");
});

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
  
  it("should resolve the 'href' if a 'base' URI is present", function () {
    node.base = "http://example.com";
    
    return links.linkViewBuilder(node).then(function (view) {
      expect(view).to.not.equal(null);
      view.href.should.equal("http://example.com/foo");
    });
  });
  
  it("should call createDataUri when 'data' property present");
  
  describe("when clicked", function () {
    var fetchStub;
    
    beforeEach(function () {
      fetchStub = sinon.stub(jsua, "fetch");
    });
    
    afterEach(function () {
      fetchStub.restore();
    });
    
    it("should fetch when value has 'follow' property", function () {
      node.value.follow = 0;
      
      return new Promise(function (resolve) {
        links.linkViewBuilder(node).then(function (view) {          
          view.dispatchEvent(new CustomEvent("jsua-attach"));
          
          setTimeout(function () {
            if (fetchStub.calledOnce) {
              resolve();
            } else {
              reject(new Error("fetch was not called"));
            }
          }, 20);
        });
      });
    });
    
    it("should not fetch when value has null 'follow' property", function () {
      node.value.follow = null;
      
      return new Promise(function (resolve, reject) {
        links.linkViewBuilder(node).then(function (view) {          
          view.dispatchEvent(new CustomEvent("jsua-attach"));
          
          setTimeout(function () {
            if (fetchStub.calledOnce) {
              reject(new Error("fetch was called"));
            } else {
              resolve();
            }
          }, 20);
        });
      });
    });
    
    it("should fetch when spec has 'follow' property", function () {
      node.spec.follow = 0;
      
      return new Promise(function (resolve, reject) {
        links.linkViewBuilder(node).then(function (view) {
          view.dispatchEvent(new CustomEvent("jsua-attach"));
          
          setTimeout(function () {
            if (fetchStub.calledOnce) {
              resolve();
            } else {
              reject(new Error("fetch was not called"));
            }
          }, 20);
        });
      });
    });
    
    it("should not fetch when spec has null 'follow' property", function () {
      node.spec.follow = null;
      
      return new Promise(function (resolve, reject) {
        links.linkViewBuilder(node).then(function (view) {
          view.dispatchEvent(new CustomEvent("jsua-attach"));
          
          setTimeout(function () {
            if (fetchStub.calledOnce) {
              reject(new Error("fetch was called"));
            } else {
              resolve();
            }
          }, 20);
        });
      });
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
