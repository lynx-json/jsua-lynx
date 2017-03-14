require("../html-document-api");
var builders = require("../../lib/builders/container-input-view-builder");
var nodes = require("../../lib/builders/node-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe.only("builders / containerInputViewBuilder", function () {
  beforeEach(function () {
    nodeViewBuilderStub = sinon.stub(nodes, "nodeViewBuilder");
    
    node = {
      base: "http://example.com",
      spec: {
        hints: [ "container" ],
        input: true,
        children: childSpec
      },
      value: []
    };
  });
  
  afterEach(function () {
    nodeViewBuilderStub.restore();
  });
  
  var node, nodeViewBuilderStub;
  var childSpec = {
    hints: [ "text" ],
    input: true
  };
  
  it("should return a view for an empty node", function () {
    return builders.containerInputViewBuilder(node).then(function (view) {
      expect(view).to.not.be.null;
      view.children.length.should.equal(1);
      
      var addViews = view.querySelectorAll("[data-lynx-container-input-add]");
      addViews.length.should.equal(1);
      
      ["[data-lynx-container-input-item]", 
        "[data-lynx-container-input-remove]", 
        "[data-lynx-container-input-value]"]
        .map(selector => view.querySelectorAll(selector))
        .forEach(views => views.length.should.equal(0));
    });
  });
  
  it("should return a view for a node with values", function () {
    node.value.push({
      spec: childSpec,
      value: "Item One"
    });
    
    node.value.push({
      spec: childSpec,
      value: "Item Two"
    });
    
    nodeViewBuilderStub.onCall(0).returns(Promise.resolve(document.createElement("textarea")));
    nodeViewBuilderStub.onCall(1).returns(Promise.resolve(document.createElement("textarea")));
    
    return builders.containerInputViewBuilder(node).then(function (view) {
      view.children.length.should.equal(3);
      
      ["[data-lynx-container-input-item]", 
        "[data-lynx-container-input-remove]", 
        "[data-lynx-container-input-value]"]
        .map(selector => view.querySelectorAll(selector))
        .forEach(views => views.length.should.equal(2));
    });
  });
  
  it("should add a new view when add button is clicked", function () {
    nodeViewBuilderStub.onCall(0).returns(Promise.resolve(document.createElement("textarea")));
    
    return builders.containerInputViewBuilder(node).then(function (view) {
      var addView = view.querySelector("[data-lynx-container-input-add]");
      expect(addView).to.not.be.null;
      addView.click();
      
      return new Promise(function (resolve, reject) {
        function finishTestAssertions() {
          var itemView = view.querySelector("[data-lynx-container-input-item]");
          
          if (itemView) {
            resolve(itemView);
          } else if (retries-- > 0) {
            window.setTimeout(finishTestAssertions, 200);
          } else {
            reject("Unable to find added view after addView.click().");
          }
        }
        
        var retries = 3;
        window.setTimeout(finishTestAssertions);
      });
    });
  });
  
  it("should add a new view when addValue is called", function () {
    nodeViewBuilderStub.onCall(0).returns(Promise.resolve(document.createElement("textarea")));
    
    var containerInputView;
    
    return builders.containerInputViewBuilder(node)
      .then(function (view) {
        containerInputView = view;
        return view.addValue("A New Value");
      })
      .then(function (itemView) {
        var actual = containerInputView.querySelector("[data-lynx-container-input-item]");
        expect(actual).to.not.be.null;
        actual.should.equal(itemView);
        
        ["[data-lynx-container-input-item]", 
          "[data-lynx-container-input-remove]", 
          "[data-lynx-container-input-value]"]
          .map(selector => containerInputView.querySelectorAll(selector))
          .forEach(views => views.length.should.equal(1));
      });
  });
  
  it("should remove a view when remove button is clicked", function () {
    node.value.push({
      spec: childSpec,
      value: "Item One"
    });
    
    nodeViewBuilderStub.onCall(0).returns(Promise.resolve(document.createElement("textarea")));
    
    return builders.containerInputViewBuilder(node).then(function (view) {
      var itemViews = view.querySelectorAll("[data-lynx-container-input-item]");
      itemViews.length.should.equal(1);
      
      var removeView = view.querySelector("[data-lynx-container-input-remove]");
      expect(removeView).to.not.be.null;
      removeView.click();
      
      itemViews = view.querySelectorAll("[data-lynx-container-input-item]");
      itemViews.length.should.equal(0);
    });
  });
  
  it("should remove a view when removeValue is called", function () {
    var textInputValue = "Item One";
    
    node.value.push({
      spec: childSpec,
      value: textInputValue
    });
    
    nodeViewBuilderStub.onCall(0).returns(new Promise(function (resolve) {
      var view = document.createElement("textarea");
      view.value = textInputValue;
      resolve(view);
    }));
    
    return builders.containerInputViewBuilder(node).then(function (view) {
      ["[data-lynx-container-input-item]", 
        "[data-lynx-container-input-remove]", 
        "[data-lynx-container-input-value]"]
        .map(selector => view.querySelectorAll(selector))
        .forEach(views => views.length.should.equal(1));
      
      view.removeValue(textInputValue);
      
      ["[data-lynx-container-input-item]", 
        "[data-lynx-container-input-remove]", 
        "[data-lynx-container-input-value]"]
        .map(selector => view.querySelectorAll(selector))
        .forEach(views => views.length.should.equal(0));
    });
  });
});
