require("../html-document-api");
var builders = require("../../dist/builders/text-input-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;

describe("builders / textInputViewBuilder", function () {
  it("should return view for 'text' input", function () {
    var node = {
      spec: {
        hints: [ "text" ],
        input: {
          name: "test"
        }
      },
      value: null
    };
    
    var view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    
    var valueView = view.querySelector("textarea");
    expect(valueView).to.not.be.null;
    valueView.value.should.equal("");
    valueView.name.should.equal(node.spec.input.name);
  });
  
  it("should add value accessors and publish change events", function () {
    var node = {
      spec: {
        hints: [ "text" ],
        input: {
          name: "test"
        }
      },
      value: null
    };
    
    var view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    
    var valueView = view.querySelector("textarea");
    valueView.value.should.equal("");
    expect(view.lynxGetValue).to.not.be.null;
    expect(view.lynxGetValue()).to.equal("");
    expect(view.lynxSetValue).to.not.be.null;
    
    return new Promise(function (resolve) {
      view.addEventListener("change", function () {
        valueView.value.should.equal("testing setter and change event");
        view.lynxGetValue().should.equal("testing setter and change event");
        resolve();
      });
      
      view.lynxSetValue("testing setter and change event");
    });
  });
  
  it("should return view with value", function () {
    var node = {
      spec: {
        hints: [ "text" ],
        input: {
          name: "test"
        }
      },
      value: "Hello, World!"
    };
    
    var view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    
    var valueView = view.querySelector("textarea");
    expect(valueView).to.not.be.null;
    valueView.value.should.equal(node.value);
  });
  
  it("should return view for 'line' input", function () {
    var node = {
      spec: {
        hints: [ "line", "text" ],
        input: {
          name: "test"
        }
      },
      value: "Hello, World!"
    };
    
    var view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    
    var valueView = view.querySelector("input");
    expect(valueView).to.not.be.null;
    valueView.value.should.equal(node.value);
    valueView.name.should.equal(node.spec.input.name);
    valueView.type.should.equal("text");
  });
});
