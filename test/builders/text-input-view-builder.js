require("./html-document-api");
var builders = require("../../lib/builders");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;

describe("textInputViewBuilder", function () {
  it("should return view for 'text' input", function () {
    let node = {
      spec: {
        hints: [ { name: "text" } ],
        input: {
          name: "test"
        }
      },
      value: null
    };
    
    let view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.value.should.equal("");
    view.name.should.equal(node.spec.input.name);
    view['data-lynx-input'].should.be.true;
  });
  
  it("should return view with value", function () {
    let node = {
      spec: {
        hints: [ { name: "text" } ],
        input: {
          name: "test"
        }
      },
      value: "Hello, World!"
    };
    
    let view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.value.should.equal(node.value);
  });
  
  it("should return view for 'line' input", function () {
    let node = {
      spec: {
        hints: [ { name: "line" }, { name: "text" } ],
        input: {
          name: "test"
        }
      },
      value: "Hello, World!"
    };
    
    let view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.value.should.equal(node.value);
    view.name.should.equal(node.spec.input.name);
    view.type.should.equal("text");
    view['data-lynx-input'].should.be.true;
  });
  
  it("should return view for concealed 'line' input", function () {
    let node = {
      spec: {
        visibility: "concealed",
        hints: [ { name: "line" }, { name: "text" } ],
        input: {
          name: "test"
        }
      },
      value: "Hello, World!"
    };
    
    let view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.value.should.equal(node.value);
    view.name.should.equal(node.spec.input.name);
    view.type.should.equal("password");
    view["data-lynx-input"].should.be.true;
  });
  
  it("should set 'data-lynx-options-value-hint' attribute with most specific hint", function () {
    let node = {
      spec: {
        hints: [ { name: "http://iso.org/8601/date" }, { name: "text" } ],
        input: {
          name: "test"
        },
        options: "other"
      },
      value: "2017-03-02"
    };
    
    let view = builders.textInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    view["data-lynx-options-value-hint"].should.equal("http://iso.org/8601/date");
  });
});
