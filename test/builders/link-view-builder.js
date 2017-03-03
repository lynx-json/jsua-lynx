require("./html-document-api");
var links = require("../../lib/builders/link-view-builder");
var containers = require("../../lib/builders/container-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("linkViewBuilder", function () {
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
    buildChildViewsStub.returns([]);
    
    var view = links.linkViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.children.length.should.equal(0);
    view.href.should.equal(node.value.href);
    view.href.should.equal(view.textContent);
    view.type.should.equal(node.value.type);
    buildChildViewsStub.called.should.be.true;
    buildChildViewsStub.restore();
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
    buildChildViewsStub.returns([{}]);
    
    var view = links.linkViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.children.length.should.equal(1);
    view.href.should.equal(node.value.href);
    view.href.should.not.equal(view.textContent);
    view.type.should.equal(node.value.type);
    buildChildViewsStub.called.should.be.true;
    buildChildViewsStub.restore();
  });
});
