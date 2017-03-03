require("../html-document-api");
var builders = require("../../lib/builders");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;

describe("textViewBuilder", function () {
  it("should return view", function () {
    var node = {
      value: "Hello, World!"
    };
    
    var view = builders.textViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.textContent.should.equal(node.value);
  });
});
