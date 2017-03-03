require("../html-document-api");
var builders = require("../../lib/builders/text-input-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;

describe("textInputViewBuilder", function () {
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
    view['data-lynx-input'].should.be.true;
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
    view['data-lynx-input'].should.be.true;
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
    view["data-lynx-input"].should.be.true;
  });
  
  it("should set 'data-lynx-options' attribute", function () {
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
    view["data-lynx-options"].should.equal(node.spec.options);
  });
});
