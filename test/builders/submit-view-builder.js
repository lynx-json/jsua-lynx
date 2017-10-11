require("../html-document-api");
var submits = require("../../dist/builders/submit-view-builder");
var containers = require("../../dist/builders/container-view-builder");
var util = require("../../dist/util");
var jsua = require("@lynx-json/jsua");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / submitViewBuilder", function () {
  var node, buildChildViewsStub;
  
  beforeEach(function () {
    node = {
      spec: {
        hints: [ { name: "submit" } ]
      },
      value: {
        action: "/foo"
      }
    };
    
    buildChildViewsStub = sinon.stub(containers, "buildChildViews");
    buildChildViewsStub.returns(Promise.resolve([]));
  });
  
  afterEach(function () {
    buildChildViewsStub.restore();
  });
  
  it("should return view for 'submit' with no children", function () {
    node.value.method = "GET";
    node.value.enctype = "application/x-www-form-urlencoded";
    
    return submits.submitViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(0);
      view.formAction.should.equal(node.value.action);
      view.formMethod.should.equal(node.value.method);
      view.formEnctype.should.equal(node.value.enctype);
      buildChildViewsStub.called.should.be.true;
    });
  });
  
  it("should return view for 'submit' with children", function () {    
    buildChildViewsStub.returns(Promise.resolve([document.createElement("div")]));
    
    return submits.submitViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(1);
      view.formAction.should.equal(node.value.action);
      expect(view.formMethod).to.be.undefined;
      expect(view.formEnctype).to.be.undefined;
      buildChildViewsStub.called.should.be.true;
    });
  });
  
  it("should resolve the 'action' if a 'base' URI is present", function () {
    node.base = "http://example.com";
    
    return submits.submitViewBuilder(node).then(function (view) {
      view.formAction.should.equal("http://example.com/foo");
    });
  });
  
  describe("when clicked", function () {
    var fetchStub, buildFormDataStub, findNearestAncestorViewStub;
    
    beforeEach(function () {
      node.base = "http://example.com";
      fetchStub = sinon.stub(jsua, "fetch");
      buildFormDataStub = sinon.stub(util, "buildFormData");
      findNearestAncestorViewStub = sinon.stub(util, "findNearestAncestorView");
    });
    
    afterEach(function () {
      fetchStub.restore();
      buildFormDataStub.restore();
      findNearestAncestorViewStub.restore();
    });
    
    it("should fetch", function () {
      return submits.submitViewBuilder(node).then(function (view) {
        view.click();
        
        expect(fetchStub.calledOnce).to.equal(true);
        var args = fetchStub.getCall(0).args;
        expect(args[0]).to.equal("http://example.com/foo");
      });
    });
    
    it("should build form data", function () {
      return submits.submitViewBuilder(node).then(function (view) {
        view.click();
        
        expect(buildFormDataStub.calledOnce).to.equal(true);
        var args = buildFormDataStub.getCall(0).args;
        expect(args[0]).to.equal(view);
      }); 
    });
    
    it("should assign form data to options.body for POST", function () {
      node.value.method = "POST";
      var formData = new FormData();
      formData.append("name", "bar");
      buildFormDataStub.returns(formData);
      
      return submits.submitViewBuilder(node).then(function (view) {
        view.click();
        
        expect(buildFormDataStub.calledOnce).to.equal(true);
        expect(fetchStub.calledOnce).to.equal(true);
        var args = fetchStub.getCall(0).args;
        expect(args[0]).to.equal("http://example.com/foo");
        expect(args[1]).to.not.equal(null);
        expect(args[1].body).to.equal(formData);
      });
    });
    
    it("should assign form data to query component for GET", function () {
      node.value.method = "GET";
      var formData = new URLSearchParams();
      formData.append("name", "bar");
      buildFormDataStub.returns(formData);
      
      return submits.submitViewBuilder(node).then(function (view) {
        view.click();
        
        expect(buildFormDataStub.calledOnce).to.equal(true);
        expect(fetchStub.calledOnce).to.equal(true);
        var args = fetchStub.getCall(0).args;
        expect(args[0]).to.equal("http://example.com/foo?name=bar");
      });
    });
    
    it("should click submit when value has 'send' property", function () {
      node.value.send = "change";
      var formView = document.createElement("form");
      formView.lynxGetValidationState = function () { 
        return "valid"; 
      };
      findNearestAncestorViewStub.returns(formView);
      
      return new Promise(function (resolve) {
        submits.submitViewBuilder(node).then(function (view) {
          view.addEventListener("click", function () {
            expect(findNearestAncestorViewStub.calledOnce).to.equal(true);
            expect(buildFormDataStub.calledOnce).to.equal(true);
            expect(fetchStub.calledOnce).to.equal(true);
            resolve();
          });
          
          view.dispatchEvent(new CustomEvent("jsua-attach"));
          formView.dispatchEvent(new CustomEvent("lynx-validated"));
        });
      });
    });
    
    it("should click submit when node spec has 'send=change' property", function () {
      node.spec.send = "change";
      var formView = document.createElement("form");
      formView.lynxGetValidationState = function () { 
        return "valid"; 
      };
      findNearestAncestorViewStub.returns(formView);
      
      return new Promise(function (resolve) {
        submits.submitViewBuilder(node).then(function (view) {
          view.addEventListener("click", function () {
            expect(findNearestAncestorViewStub.calledOnce).to.equal(true);
            expect(buildFormDataStub.calledOnce).to.equal(true);
            expect(fetchStub.calledOnce).to.equal(true);
            resolve();
          });
          
          view.dispatchEvent(new CustomEvent("jsua-attach"));
          formView.dispatchEvent(new CustomEvent("lynx-validated"));
        });
      });
    });
    
    it("should click submit when node value has 'send=change' property");
    it("should click submit when node value has 'send=ready' property");
  });
});
