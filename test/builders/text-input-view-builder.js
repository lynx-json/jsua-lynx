require("../html-document-api");
var builders = require("../../lib/builders/text-input-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;

describe("builders / textInputViewBuilder", function () {
  it("should return view for 'text' input", function () {
    var node = {
      spec: {
        hints: [ { name: "text" } ],
        input: {
          name: "test"
        }
      },
      value: null
    };
    
    var view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.value.should.equal("");
    view.name.should.equal(node.spec.input.name);
  });
  
  it("should add value accessors and publish change events", function () {
    var node = {
      spec: {
        hints: [ { name: "text" } ],
        input: {
          name: "test"
        }
      },
      value: null
    };
    
    var view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.value.should.equal("");
    expect(view.lynxGetValue).to.not.be.null;
    expect(view.lynxSetValue).to.not.be.null;
    view.lynxGetValue().should.equal("");
    return new Promise(function (resolve) {
      view.addEventListener("change", function () {
        view.value.should.equal("testing setter and change event");
        view.lynxGetValue().should.equal("testing setter and change event");
        resolve();
      });
      
      view.lynxSetValue("testing setter and change event");
    });
  });
  
  it("should return view with value", function () {
    var node = {
      spec: {
        hints: [ { name: "text" } ],
        input: {
          name: "test"
        }
      },
      value: "Hello, World!"
    };
    
    var view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.value.should.equal(node.value);
  });
  
  it("should return view for 'line' input", function () {
    var node = {
      spec: {
        hints: [ { name: "line" }, { name: "text" } ],
        input: {
          name: "test"
        }
      },
      value: "Hello, World!"
    };
    
    var view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.value.should.equal(node.value);
    view.name.should.equal(node.spec.input.name);
    view.type.should.equal("text");
  });
  
  it("should return view for concealed 'line' input", function () {
    var node = {
      spec: {
        visibility: "concealed",
        hints: [ { name: "line" }, { name: "text" } ],
        input: {
          name: "test"
        }
      },
      value: "Hello, World!"
    };
    
    var view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.value.should.equal(node.value);
    view.name.should.equal(node.spec.input.name);
    view.type.should.equal("password");
  });
  
  it("should set attribute 'data-lynx-options'", function () {
    var node = {
      spec: {
        hints: [ { name: "http://iso.org/8601/date" }, { name: "text" } ],
        input: {
          name: "test"
        },
        options: "other"
      },
      value: "2017-03-02"
    };
    
    var view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
  });
});
