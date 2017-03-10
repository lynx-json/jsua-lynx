require("../html-document-api");
var contents = require("../../lib/builders/image-view-builder");
var transferring = require("jsua/lib/transferring");
var building = require("jsua/lib/views/building");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / imageViewBuilder", function () {
  it("should return view for 'image'", function () {
    var node = {
      base: "http://example.com",
      spec: {
        hints: [ { name: "image" }, { name: "content" } ]
      },
      value: {
        src: "/foo",
        type: "image/jpeg",
        alt: "A pastoral view",
        height: 100,
        width: 100
      }
    };
    
    var transferStub = sinon.stub(transferring, "transfer");
    transferStub.returns(Promise.resolve({}));
    
    var buildStub = sinon.stub(building, "build");
    buildStub.returns(Promise.resolve({ view: document.createElement() }));
    
    contents.imageViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(1);
      view.children[0].title.should.equal(node.value.alt);
      view.children[0]["data-lynx-height"].should.equal(node.value.height);
      view.children[0]["data-lynx-width"].should.equal(node.value.width);
      transferStub.called.should.be.true;
      transferStub.lastCall.args[0].should.deep.equal({ url: "http://example.com/foo" });
      buildStub.called.should.be.true;
      transferStub.restore();
      buildStub.restore();
    }).should.not.be.rejectedWith(Error);
  });
});
