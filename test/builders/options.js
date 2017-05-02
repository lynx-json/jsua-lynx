require("../html-document-api");
var options = require("../../dist/builders/options");
var util = require("../../dist/util");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

function createOptionValueView(value) {
  var optionValueView = document.createElement("pre");
  optionValueView.lynxGetValue = sinon.stub();
  optionValueView.lynxGetValue.returns(value);
  return optionValueView;
}

describe("options / addOptionsExtensionsToView / input", function () {
  var inputView, spec, findNearestViewStub;
  
  function stubInputView(inputView) {
    var value = "";
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
    
    findNearestViewStub = sinon.stub(util, "findNearestView");
    
    options.addOptionsExtensionsToView(inputView, spec);
  });
  
  afterEach(function () {
    findNearestViewStub.restore();
  });
  
  
  it("should add `lynxConnectOptions` function to the input view", function () {
    expect("lynxConnectOptions" in inputView).to.equal(true);
  });
  
  describe("when `lynxConnectOptions` is called on the input view and an options view is not found", function () {
    beforeEach(function () {
      findNearestViewStub.returns(null);
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
      findNearestViewStub.returns(nearestOptionsView);
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
    
    beforeEach(function () {
      nearestOptionsView = document.createElement("div");
      findNearestViewStub.returns(nearestOptionsView);
      
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
    
    it("should set the value of input view when an option view is clicked", function () {
      return new Promise(function (resolve) {
        function checkInputForValue() {
          if (inputView.lynxGetValue() === firstOptionView.lynxGetValue()) {
            return resolve();
          }
          
          setTimeout(checkInputForValue, 10);
        }
        
        inputView.lynxConnectOptions();
        
        firstOptionView.click();
        setTimeout(checkInputForValue, 10);
      });
    });
    
    it("should change the value of input view when another option view is clicked", function () {
      return new Promise(function (resolve) {
        function checkInputForValue() {
          if (inputView.lynxGetValue() === secondOptionView.lynxGetValue()) {
            return resolve();
          }
          
          setTimeout(checkInputForValue, 10);
        }
        
        inputView.lynxSetValue("one");
        querySelectorStub.withArgs("[data-lynx-option-selected=true]").returns(firstOptionView);
        inputView.lynxConnectOptions();
        
        secondOptionView.click();
        setTimeout(checkInputForValue, 10);
      });
    });
    
    it("should clear the value of input view when a selected option view is clicked", function () {
      return new Promise(function (resolve) {
        function checkInputForValue() {
          if (inputView.lynxGetValue() === "") {
            return resolve();
          }
          
          setTimeout(checkInputForValue, 10);
        }
        
        inputView.lynxSetValue("one");
        querySelectorStub.withArgs("[data-lynx-option-selected=true]").returns(firstOptionView);
        inputView.lynxConnectOptions();
        
        firstOptionView.click();
        setTimeout(checkInputForValue, 10);
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


describe("options / addOptionsExtensionsToView / container input", function () {
  var inputView, 
      spec, 
      findNearestViewStub,
      nearestOptionsView, 
      querySelectorAllStub, 
      querySelectorStub,
      firstOptionValueView, 
      firstOptionView,
      secondOptionValueView,
      secondOptionView,
      findOptionViewStub;
  
  function stubInputView(inputView) {
    var value = [];
    inputView.lynxGetValue = function () { return value; };
    inputView.lynxSetValue = function (nv) { value = nv; };
    inputView.lynxHasValue = function (v) { return value.indexOf(v) > -1; };
    inputView.lynxClearValue = function () { value = []; };
    inputView.lynxAddValue = function (v) { value.push(v); };
    inputView.lynxRemoveValue = function (v) {
      var idx = value.indexOf(v);
      if (idx === -1) return;
      value.splice(idx, 1);
    };
  }
  
  beforeEach(function () {
    inputView = document.createElement("div");
    inputView.setAttribute("data-lynx-hints", "container");
    stubInputView(inputView);
    
    spec = {
      hints: [ "container" ],
      options: "optionsTarget",
      input: "inputName",
      children: {
        hints: [ "http://example.com/foo", "text" ],
        input: true
      }
    };
    
    findNearestViewStub = sinon.stub(util, "findNearestView");
    
    nearestOptionsView = document.createElement("div");
    findNearestViewStub.returns(nearestOptionsView);
    
    firstOptionValueView = createOptionValueView("one");
    firstOptionView = document.createElement("div");
    
    secondOptionValueView = createOptionValueView("two");
    secondOptionView = document.createElement("div");
    
    querySelectorAllStub = sinon.stub(nearestOptionsView, "querySelectorAll");
    querySelectorAllStub.withArgs("[data-lynx-hints~='" + spec.children.hints[0] + "']").returns([firstOptionValueView, secondOptionValueView]);
    querySelectorStub = sinon.stub(nearestOptionsView, "querySelector");
    
    findOptionViewStub = sinon.stub(options, "findOptionView");
    findOptionViewStub.withArgs(nearestOptionsView, firstOptionValueView).returns(firstOptionView);
    findOptionViewStub.withArgs(nearestOptionsView, secondOptionValueView).returns(secondOptionView);
    
    options.addOptionsExtensionsToView(inputView, spec);
  });
  
  afterEach(function () {
    findNearestViewStub.restore();
    querySelectorAllStub.restore();
    querySelectorStub.restore();
    findOptionViewStub.restore();
  });
  
  it("should set initial `data-lynx-option-selected` state of option view - none", function () {
    inputView.lynxConnectOptions();
    
    expect(firstOptionView.lynxGetSelected()).to.equal(false);
    expect(firstOptionView.getAttribute("data-lynx-option-selected")).to.equal("false");
    expect(secondOptionView.lynxGetSelected()).to.equal(false);
    expect(secondOptionView.getAttribute("data-lynx-option-selected")).to.equal("false");
  });
  
  it("should set initial `data-lynx-option-selected` state of option view - one", function () {
    inputView.lynxAddValue("one");
    inputView.lynxConnectOptions();
    
    expect(firstOptionView.lynxGetSelected()).to.equal(true);
    expect(firstOptionView.getAttribute("data-lynx-option-selected")).to.equal("true");
    expect(secondOptionView.lynxGetSelected()).to.equal(false);
    expect(secondOptionView.getAttribute("data-lynx-option-selected")).to.equal("false");
  });
  
  it("should set initial `data-lynx-option-selected` state of option view - many", function () {
    inputView.lynxAddValue("one");
    inputView.lynxAddValue("two");
    inputView.lynxConnectOptions();
    
    expect(firstOptionView.lynxGetSelected()).to.equal(true);
    expect(firstOptionView.getAttribute("data-lynx-option-selected")).to.equal("true");
    expect(secondOptionView.lynxGetSelected()).to.equal(true);
    expect(secondOptionView.getAttribute("data-lynx-option-selected")).to.equal("true");
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
  
  it("should add a value to the input view when an option view is clicked", function () {
    return new Promise(function (resolve) {
      function checkInputForValue() {
        if (inputView.lynxHasValue("one")) {
          return resolve();
        }
        
        setTimeout(checkInputForValue, 10);
      }
      
      inputView.lynxConnectOptions();
      
      expect(inputView.lynxHasValue("one")).to.equal(false);
      firstOptionView.click();
      setTimeout(checkInputForValue, 10);
    });
  });
  
  it("should remove a value from the input view when an option view is clicked", function () {
    return new Promise(function (resolve) {
      function checkInputForValue() {
        if (!inputView.lynxHasValue("one")) {
          return resolve();
        }
        
        setTimeout(checkInputForValue, 10);
      }
      
      inputView.lynxAddValue("one");
      inputView.lynxConnectOptions();
      
      expect(inputView.lynxHasValue("one")).to.equal(true);
      firstOptionView.click();
      setTimeout(checkInputForValue, 10);
    });
  });
  
  it("should set selected states on the option views when the input view's value changes", function () {
    return new Promise(function (resolve) {
      function checkOptionViewsForSelected() {
        if (firstOptionView.lynxGetSelected() && secondOptionView.lynxGetSelected()) {
          return resolve();
        }
        
        setTimeout(checkInputForValue, 10);
      }
      
      inputView.lynxConnectOptions();
      
      expect(firstOptionView.lynxGetSelected()).to.equal(false);
      expect(secondOptionView.lynxGetSelected()).to.equal(false);
      
      inputView.lynxAddValue("one");
      inputView.lynxAddValue("two");
      
      var changeEvent = document.createEvent("Event");
      changeEvent.initEvent("change", true, false);
      inputView.dispatchEvent(changeEvent);
      
      setTimeout(checkOptionViewsForSelected, 10);
    });
  });
});
