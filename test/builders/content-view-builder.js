require("../html-document-api");
var contents = require("../../dist/builders/content-view-builder");
var transferring = require("@lynx-json/jsua").transferring;
var building = require("@lynx-json/jsua").building;
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / contentViewBuilder", function () {
  beforeEach(function () {
    buildStub = sinon.stub(building, "build");
    transferStub = sinon.stub(transferring, "transfer");
  });
  
  afterEach(function () {
    buildStub.restore();
    transferStub.restore();
  });
  
  var buildStub, transferStub;
  
  it("should return view for 'content'", function () {
    var node = {
      base: "http://example.com",
      spec: {
        hints: [ { name: "content" } ]
      },
      value: {
        src: "/foo",
        type: "text/plain",
        alt: "An important doc"
      }
    };
    
    transferStub.returns(Promise.resolve({}));
    
    buildStub.returns(Promise.resolve({ view: document.createElement("div"), content: { blob: {} } }));
    
    return contents.contentViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(1);
      view.children.item(0).getAttribute("alt").should.equal(node.value.alt);
      transferStub.called.should.be.true;
      transferStub.lastCall.args[0].should.deep.equal({ url: "http://example.com/foo" });
      buildStub.called.should.be.true;
    });
  });
});
