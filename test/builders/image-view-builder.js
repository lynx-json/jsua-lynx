require("../html-document-api");
var contents = require("../../dist/builders/image-view-builder");
var transferring = require("@lynx-json/jsua").transferring;
var building = require("@lynx-json/jsua").building;
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / imageViewBuilder", function () {
  beforeEach(function () {
    buildStub = sinon.stub(building, "build");
    transferStub = sinon.stub(transferring, "transfer");
  });

  afterEach(function () {
    buildStub.restore();
    transferStub.restore();
  });

  var buildStub, transferStub;

  it("should return view for 'image' with 'data'", function () {
    var node = {
      base: "http://example.com",
      spec: {
        hints: [{ name: "image" }, { name: "content" }]
      },
      value: {
        data: "R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
        encoding: "base64",
        type: "image/jpeg",
        alt: "A pastoral view",
        height: 100,
        width: 100
      }
    };

    buildStub.returns(Promise.resolve({ view: document.createElement("div"), content: { blob: {} } }));

    return contents.imageViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(1);
      view.children.item(0).getAttribute("alt").should.equal(node.value.alt);
      view.children.item(0).getAttribute("data-lynx-height").should.equal(node.value.height.toString());
      view.children.item(0).getAttribute("data-lynx-width").should.equal(node.value.width.toString());
      expect(buildStub.called).to.equal(true);
    });
  });

  it("should return view for 'image' with 'src'", function () {
    var node = {
      base: "http://example.com",
      spec: {
        hints: [{ name: "image" }, { name: "content" }]
      },
      value: {
        src: "/foo",
        type: "image/jpeg",
        alt: "A pastoral view",
        height: 100,
        width: 100
      }
    };

    transferStub.returns(Promise.resolve({}));

    buildStub.returns(Promise.resolve({ view: document.createElement("div"), content: { blob: {} } }));

    return contents.imageViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(1);
      view.children.item(0).tagName.toLowerCase().should.equal("img");
      view.children.item(0).getAttribute("src").should.equal("http://example.com/foo");
      view.children.item(0).getAttribute("alt").should.equal(node.value.alt);
      view.children.item(0).getAttribute("data-lynx-height").should.equal(node.value.height.toString());
      view.children.item(0).getAttribute("data-lynx-width").should.equal(node.value.width.toString());
      transferStub.called.should.be.false;
      buildStub.called.should.be.false;
    });
  });
});
