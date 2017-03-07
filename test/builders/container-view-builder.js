require("../html-document-api");
var containers = require("../../lib/builders/container-view-builder");
var nodes = require("../../lib/builders/node-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / containerViewBuilder", function () {
  it("should return view for 'container' with array value", function () {
    var node = {
      spec: {
        hints: [ { name: "container" } ]
      },
      value: [
        {},
        {},
        {}
      ]
    };
    
    var nodeViewBuilderStub = sinon.stub(nodes, "nodeViewBuilder");
    nodeViewBuilderStub.returns(Promise.resolve({}));
    
    containers.containerViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(3);
      nodeViewBuilderStub.calledThrice.should.be.true;
      nodeViewBuilderStub.restore();
    }).should.not.be.rejectedWith(Error);
  });
  
  it("should return view for 'container' with object value", function () {
    var node = {
      spec: {
        hints: [ { name: "container" } ],
        children: [
          { name: "first" },
          { name: "second" },
          { name: "third" }
        ]
      },
      value: {
        first: {},
        second: {},
        third: {}
      }
    };
    
    var nodeViewBuilderStub = sinon.stub(nodes, "nodeViewBuilder");
    nodeViewBuilderStub.returns(Promise.resolve({}));
    
    containers.containerViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(3);
      nodeViewBuilderStub.calledThrice.should.be.true;
      nodeViewBuilderStub.restore();
    }).should.not.be.rejectedWith(Error);
  });
});
