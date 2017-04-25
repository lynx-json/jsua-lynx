require("../html-document-api");
var util = require("../../lib/builders/util");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

function createInputViewStub(inputName, inputValue) {
  var inputView = document.createElement("div");
  
  inputView.setAttribute("data-lynx-input", inputName);
  inputView.lynxGetValue = function () {
    return inputValue;
  };
  
  return inputView;
}

describe("builders / util / buildFormData", function () {
  var submitView, formView, querySelectorAllStub, inputViews, findNearestAncestorStub;
  
  beforeEach(function () {
    submitView = document.createElement("button");
    formView = document.createElement("form");
    inputViews = [];
    
    querySelectorAllStub = sinon.stub(formView, "querySelectorAll");
    querySelectorAllStub.returns(inputViews);
    
    findNearestAncestorStub = sinon.stub(util, "findNearestAncestor");
    findNearestAncestorStub.returns(formView);
  });
  
  afterEach(function () {
    findNearestAncestorStub.restore();
  });
  
  it("should return URLSearchParams instance for URL encoding", function () {
    submitView.formEnctype = "application/x-www-form-urlencoded";
    var formData = util.buildFormData(submitView);
    expect(formData instanceof URLSearchParams).to.equal(true);
  });
  
  it("should return FormData instance for multipart encoding", function () {
    submitView.formEnctype = "multipart/form-data";
    var formData = util.buildFormData(submitView);
    expect(formData instanceof FormData).to.equal(true);
  });
  
  it("should append input name/value pairs to form data", function () {
    inputViews.push(createInputViewStub("name", "Lynx"));
    inputViews.push(createInputViewStub("content-type", "application/lynx+json"));
    var formData = util.buildFormData(submitView);
    expect(formData.get("name")).to.equal("Lynx");
    expect(formData.get("content-type")).to.equal("application/lynx+json");
  });
});
