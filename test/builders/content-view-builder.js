require("../html-document-api");
var contents = require("../../lib/builders/content-view-builder");
var transferring = require("jsua/lib/transferring");
var building = require("jsua/lib/views/building");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / contentViewBuilder", function () {
  it("should return view for 'content'", function () {
    var node = {
      spec: {
        hints: [ { name: "content" } ]
      },
      value: {
        src: "/foo",
        type: "text/plain",
        alt: "An important doc"
      }
    };
    
    var transferStub = sinon.stub(transferring, "transfer");
    transferStub.returns(Promise.resolve({}));
    
    var buildStub = sinon.stub(building, "build");
    buildStub.returns(Promise.resolve(document.createElement()));
    
    contents.contentViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.alt.should.equal(node.value.alt);
      transferStub.called.should.be.true;
      buildStub.called.should.be.true;
      transferStub.restore();
      buildStub.restore();
    }).should.not.be.rejectedWith(Error);
  });
});
