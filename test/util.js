require("./html-document-api");
var util = require("../lib/util");
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

describe("util / buildFormData", function () {
  var submitView, formView, querySelectorAllStub, inputViews, findNearestAncestorViewStub;
  
  beforeEach(function () {
    submitView = document.createElement("button");
    formView = document.createElement("form");
    inputViews = [];
    
    querySelectorAllStub = sinon.stub(formView, "querySelectorAll");
    querySelectorAllStub.returns(inputViews);
    
    findNearestAncestorViewStub = sinon.stub(util, "findNearestAncestorView");
    findNearestAncestorViewStub.returns(formView);
  });
  
  afterEach(function () {
    findNearestAncestorViewStub.restore();
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

describe("util / findNearestView", function () {
  it("should return child", function () {
    var root = document.createElement("div");
    root.innerHTML = `
      <div id="view">
        <div id="child" data-foo="true">
        </div>
      </div>
    `;
    var view = root.querySelector("#view");
    var child = root.querySelector("#child");
    
    var matching = util.findNearestView(view, "[data-foo=true]");
    
    expect(matching).to.equal(child);
  });
  
  it("should return match if predicate returns true", function () {
    var root = document.createElement("div");
    root.innerHTML = `
      <div id="view">
        <div id="child" data-foo="true">
        </div>
      </div>
    `;
    var view = root.querySelector("#view");
    var child = root.querySelector("#child");
    var predicate = function (matching) {
      return true;
    };
    
    var matching = util.findNearestView(view, "[data-foo=true]", predicate);
    expect(matching).to.equal(child);
  });
  
  it("should not return match if predicate returns false", function () {
    var root = document.createElement("div");
    root.innerHTML = `
      <div id="view">
        <div id="child" data-foo="true">
        </div>
      </div>
    `;
    var view = root.querySelector("#view");
    var predicate = function (matching) {
      return false;
    };
    
    var matching = util.findNearestView(view, "[data-foo=true]", predicate);
    expect(matching).to.equal(null);
  });
  
  it("should return sibling", function () {
    var root = document.createElement("div");
    root.innerHTML = `
      <div id="view">
      </div>
      <div id="sibling" data-foo="true">
      </div>
    `;
    var view = root.querySelector("#view");
    var sibling = root.querySelector("#sibling");
    
    var matching = util.findNearestView(view, "[data-foo=true]");
    
    expect(matching).to.equal(sibling);
  });
  
  it("should return child before sibling", function () {
    var root = document.createElement("div");
    root.innerHTML = `
      <div id="view">
        <div id="child" data-foo="true">
        </div>
      </div>
      <div id="sibling" data-foo="true">
      </div>
    `;
    var view = root.querySelector("#view");
    var child = root.querySelector("#child");
    
    var matching = util.findNearestView(view, "[data-foo=true]");
    
    expect(matching).to.equal(child);
  });
  
  it("should return grandchild before sibling", function () {
    var root = document.createElement("div");
    root.innerHTML = `
      <div id="view">
        <div id="child">
          <div id="grandchild" data-foo="true">
          </div>
        </div>
      </div>
      <div id="sibling" data-foo="true">
      </div>
    `;
    var view = root.querySelector("#view");
    var grandchild = root.querySelector("#grandchild");
    
    var matching = util.findNearestView(view, "[data-foo=true]");
    
    expect(matching).to.equal(grandchild);
  });
  
  it("should return child before grandchild", function () {
    var root = document.createElement("div");
    root.innerHTML = `
      <div id="view">
        <div id="child" data-foo="true">
          <div id="grandchild" data-foo="true">
          </div>
        </div>
      </div>
    `;
    var view = root.querySelector("#view");
    var child = root.querySelector("#child");
    
    var matching = util.findNearestView(view, "[data-foo=true]");
    
    expect(matching).to.equal(child);
  });
});
