require("../html-document-api");
var images = require("../../lib/builders/image-view-builder");
var contents = require("../../lib/builders/content-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / imageViewBuilder", function () {
  it("should return view for 'image'", function () {
    var node = {
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
    
    var contentViewBuilderStub = sinon.stub(contents, "contentViewBuilder");
    contentViewBuilderStub.returns(Promise.resolve(document.createElement()));
    
    images.imageViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.title.should.equal(node.value.alt);
      view["data-lynx-height"].should.equal(node.value.height);
      view["data-lynx-width"].should.equal(node.value.width);
      contentViewBuilderStub.called.should.be.true;
      contentViewBuilderStub.restore();
    }).should.not.be.rejectedWith(Error);
  });
});
