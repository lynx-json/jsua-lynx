require("../html-document-api");
var builders = require("../../dist/builders");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;

describe("builders / textViewBuilder", function () {
  it("should return view", function () {
    var node = {
      value: "Hello, World!"
    };

    var view = builders.textViewBuilder(node);

    expect(view).to.not.be.null;
    view.textContent.should.equal(node.value);
  });

  it("should maintain the text value as the layout container is modified.", function () {
    var node = {
      value: "Hello, World!"
    };

    var view = builders.textViewBuilder(node);

    var presentationView = document.createElement("div");
    presentationView.textContent = "Prefix";
    view.appendChild(presentationView);

    expect(view).to.not.be.null;
    view.lynxGetValue().should.equal(node.value);
  });
});
