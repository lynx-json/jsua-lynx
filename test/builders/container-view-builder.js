require("../html-document-api");
var containers = require("../../dist/builders/container-view-builder");
var nodes = require("../../dist/builders/node-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / containerViewBuilder", function () {
  beforeEach(function () {
    nodeViewBuilderStub = sinon.stub(nodes, "nodeViewBuilder");
  });
  
  afterEach(function () {
    nodeViewBuilderStub.restore();
  });
  
  var nodeViewBuilderStub;
  
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
    
    
    nodeViewBuilderStub.onCall(0).returns(Promise.resolve(document.createElement("div")));
    nodeViewBuilderStub.onCall(1).returns(Promise.resolve(document.createElement("div")));
    nodeViewBuilderStub.onCall(2).returns(Promise.resolve(document.createElement("div")));
    
    return containers.containerViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      nodeViewBuilderStub.calledThrice.should.be.true;
      view.childElementCount.should.equal(3);
    });
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
    
    nodeViewBuilderStub.onCall(0).returns(Promise.resolve(document.createElement("div")));
    nodeViewBuilderStub.onCall(1).returns(Promise.resolve(document.createElement("div")));
    nodeViewBuilderStub.onCall(2).returns(Promise.resolve(document.createElement("div")));
    
    return containers.containerViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(3);
      nodeViewBuilderStub.calledThrice.should.be.true;
    });
  });
});
