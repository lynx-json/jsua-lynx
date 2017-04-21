require("../html-document-api");
var options = require("../../lib/builders/options");
var util = require("../../lib/builders/util");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("options / addOptionsExtensionsToView", function () {
  var inputView, spec, findNearestElementStub;
  
  function stubInputView(inputView) {
    var value;
    inputView.lynxGetValue = function () { return value; };
    inputView.lynxSetValue = function (nv) { value = nv; };
    inputView.lynxHasValue = function (v) { return v === value; };
    inputView.lynxClearValue = function () { value = ""; };
  }
  
  beforeEach(function () {
    inputView = document.createElement("div");
    stubInputView(inputView);
    
    spec = {
      hints: [ "http://example.com/foo", "text" ],
      options: "optionsTarget",
      input: "inputName"
    };
    
    findNearestElementStub = sinon.stub(util, "findNearestElement");
    
    options.addOptionsExtensionsToView(inputView, spec);
  });
  
  afterEach(function () {
    findNearestElementStub.restore();
  });
  
  
  it("should add `lynxConnectOptions` function to the input view", function () {
    expect("lynxConnectOptions" in inputView).to.equal(true);
  });
  
  describe("when `lynxConnectOptions` is called on the input view and an options view is not found", function () {
    beforeEach(function () {
      findNearestElementStub.returns(null);
      inputView.lynxConnectOptions();
    });
    
    it("should not add `lynxDisconnectOptions` function to input view", function () {
      expect("lynxDisconnectOptions" in inputView).to.equal(false);
    });
  });
  
  
  describe("when `lynxConnectOptions` is called on the input view and an options view is found", function () {
    var nearestOptionsView;
    
    beforeEach(function () {
      nearestOptionsView = document.createElement("div");
      findNearestElementStub.returns(nearestOptionsView);
    });
    
    it("should add `lynxDisconnectOptions` function to input view", function () {
      inputView.lynxConnectOptions();
      expect("lynxDisconnectOptions" in inputView).to.equal(true);
    });
    
    it("should raise `lynx-options-connected` event on options view", function () {
      return new Promise(function (resolve) {
        nearestOptionsView.addEventListener("lynx-options-connected", function () {
          resolve();
        });
        
        inputView.lynxConnectOptions();
      });
    });
  });
  
  
  describe("when an options view is connected", function () {
    var nearestOptionsView, 
        querySelectorAllStub, 
        querySelectorStub,
        firstOptionValueView, 
        firstOptionView,
        secondOptionValueView,
        secondOptionView,
        findOptionViewStub;
    
    function createOptionValueView(value) {
      var optionValueView = document.createElement("pre");
      optionValueView.lynxGetValue = sinon.stub();
      optionValueView.lynxGetValue.returns(value);
      return optionValueView;
    }
    
    beforeEach(function () {
      nearestOptionsView = document.createElement("div");
      findNearestElementStub.returns(nearestOptionsView);
      
      firstOptionValueView = createOptionValueView("one");
      firstOptionView = document.createElement("div");
      
      secondOptionValueView = createOptionValueView("two");
      secondOptionView = document.createElement("div");
      
      querySelectorAllStub = sinon.stub(nearestOptionsView, "querySelectorAll");
      querySelectorAllStub.withArgs("[data-lynx-hints~='" + spec.hints[0] + "']").returns([firstOptionValueView, secondOptionValueView]);
      querySelectorStub = sinon.stub(nearestOptionsView, "querySelector");
      
      findOptionViewStub = sinon.stub(options, "findOptionView");
      findOptionViewStub.withArgs(nearestOptionsView, firstOptionValueView).returns(firstOptionView);
      findOptionViewStub.withArgs(nearestOptionsView, secondOptionValueView).returns(secondOptionView);
    });
    
    afterEach(function () {
      querySelectorAllStub.restore();
      querySelectorStub.restore();
      findOptionViewStub.restore();
    });
    
    it("should set initial `data-lynx-option-selected` state of option view", function () {
      inputView.lynxSetValue("one");
      inputView.lynxConnectOptions();
      
      expect(firstOptionView.lynxGetSelected()).to.equal(true);
      expect(firstOptionView.getAttribute("data-lynx-option-selected")).to.equal("true");
      expect(secondOptionView.lynxGetSelected()).to.equal(false);
      expect(secondOptionView.getAttribute("data-lynx-option-selected")).to.equal("false");
    });
    
    it("should raise `lynx-option-selected` event on deselected option view when clicked", function () {
      return new Promise(function (resolve) {
        firstOptionView.addEventListener("lynx-option-selected", function () {
          expect(firstOptionView.lynxGetSelected()).to.equal(true);
          resolve();
        });
        
        inputView.lynxConnectOptions();
        
        expect(firstOptionView.lynxGetSelected()).to.equal(false);
        firstOptionView.click();
      });
    });
    
    it("should raise `lynx-option-deselected` event on selected option view when clicked", function () {
      return new Promise(function (resolve) {
        firstOptionView.addEventListener("lynx-option-deselected", function () {
          expect(firstOptionView.lynxGetSelected()).to.equal(false);
          resolve();
        });
        
        inputView.lynxSetValue("one");
        inputView.lynxConnectOptions();
        
        expect(firstOptionView.lynxGetSelected()).to.equal(true);
        firstOptionView.click();
      });
    });
    
    it("should raise `lynx-option-deselected` event on selected option view when another option view is clicked", function () {
      return new Promise(function (resolve) {
        firstOptionView.addEventListener("lynx-option-deselected", function () {
          expect(firstOptionView.lynxGetSelected()).to.equal(false);
          resolve();
        });
        
        querySelectorStub.withArgs("[data-lynx-option-selected=true]").returns(firstOptionView);
        inputView.lynxSetValue("one");
        inputView.lynxConnectOptions();
        
        expect(firstOptionView.lynxGetSelected()).to.equal(true);
        expect(secondOptionView.lynxGetSelected()).to.equal(false);
        secondOptionView.click();
      });
    });
    
    it("should raise selected/deselected events when the input view's value changes", function () {
      return new Promise(function (resolve) {
        var deselectedCalled = false;
        var selectedCalled = false;
        
        function tryToResolve() {
          if (deselectedCalled && selectedCalled) {
            resolve();
          } else {
            setTimeout(tryToResolve, 10);    
          }
        }
        
        setTimeout(tryToResolve, 10);
        
        firstOptionView.addEventListener("lynx-option-deselected", function () {
          expect(firstOptionView.lynxGetSelected()).to.equal(false);
          deselectedCalled = true;
        });
        
        secondOptionView.addEventListener("lynx-option-selected", function () {
          expect(secondOptionView.lynxGetSelected()).to.equal(true);
          selectedCalled = true;
        });
        
        querySelectorStub.withArgs("[data-lynx-option-selected=true]").returns(firstOptionView);
        inputView.lynxSetValue("one");
        inputView.lynxConnectOptions();
        
        expect(firstOptionView.lynxGetSelected()).to.equal(true);
        expect(secondOptionView.lynxGetSelected()).to.equal(false);
        
        inputView.lynxSetValue("two");
        var changeEvent = document.createEvent("Event");
        changeEvent.initEvent("change", true, false);
        inputView.dispatchEvent(changeEvent);
      });
    });
    
    it("should raise `lynx-options-disconnected` event on options view when disconnected", function () {
      return new Promise(function (resolve) {
        nearestOptionsView.addEventListener("lynx-options-disconnected", function () {
          resolve();
        });
        
        inputView.lynxConnectOptions();
        inputView.lynxDisconnectOptions();
      });
    });
  });
});
