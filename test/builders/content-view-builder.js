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
        hints: [{ name: "content" }]
      },
      value: {
        media: "screen",
        src: "/foo",
        type: "text/plain",
        alt: "An important doc"
      }
    };

    transferStub.returns(Promise.resolve({ blob: {} }));

    buildStub.returns(Promise.resolve({ view: document.createElement("div"), content: { blob: {} } }));

    return contents.contentViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(1);
      view.children.item(0).getAttribute("alt").should.equal(node.value.alt);
      transferStub.called.should.be.true;
      transferStub.lastCall.args[0].should.deep.equal({
        url: "http://example.com/foo",
        options: {
          type: "text/plain",
          media: "screen"
        }
      });
      buildStub.called.should.be.true;
    });
  });

  it("should set resolved scope attribute for objects with relative scope", function () {
    var node = {
      base: "http://example.com",
      spec: {
        hints: [{ name: "content" }]
      },
      value: {
        scope: "/foo",
        src: "/foo/doc",
        type: "text/plain",
        alt: "An important doc"
      }
    };

    transferStub.returns(Promise.resolve({ blob: {} }));

    buildStub.returns(Promise.resolve({ view: document.createElement("div"), content: { blob: {} } }));

    return contents.contentViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      expect(view.getAttribute("data-lynx-scope")).to.eq("http://example.com/foo");
    });
  });

  it("should set resolved scope attribute for objects with absolute scope", function () {
    var node = {
      base: "http://example.com",
      spec: {
        hints: [{ name: "content" }]
      },
      value: {
        scope: "http://another.domain.com/foo",
        src: "/foo/doc",
        type: "text/plain",
        alt: "An important doc"
      }
    };

    transferStub.returns(Promise.resolve({ blob: {} }));

    buildStub.returns(Promise.resolve({ view: document.createElement("div"), content: { blob: {} } }));

    return contents.contentViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      expect(view.getAttribute("data-lynx-scope")).to.eq("http://another.domain.com/foo");
    });
  });

  describe("replacing the embedded view", function () {
    it("should replace the embedded view with the new embedded view");
    it("should respect presentation-specific restructuring");
  });
});
