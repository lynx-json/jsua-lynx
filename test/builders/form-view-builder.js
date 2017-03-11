require("../html-document-api");
var forms = require("../../lib/builders/form-view-builder");
var containers = require("../../lib/builders/container-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / formViewBuilder", function () {
  it("should return view for 'form' with no children", function () {
    var node = {
      spec: {
        hints: [ { name: "form" } ]
      },
      value: {}
    };
    
    var buildChildViewsStub = sinon.stub(containers, "buildChildViews");
    buildChildViewsStub.returns(Promise.resolve([]));
    
    return forms.formViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(0);
      buildChildViewsStub.called.should.be.true;
      buildChildViewsStub.restore();
    });
  });
  
  it("should return view for 'form' with children", function () {
    var node = {
      spec: {
        hints: [ { name: "form" } ]
      },
      value: {}
    };
    
    var buildChildViewsStub = sinon.stub(containers, "buildChildViews");
    buildChildViewsStub.returns(Promise.resolve([document.createElement("div")]));
    
    return forms.formViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(1);
      buildChildViewsStub.called.should.be.true;
      buildChildViewsStub.restore();
    });
  });
});
