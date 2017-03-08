require("../html-document-api");
var builders = require("../../lib/builders/content-input-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;

function File(data, name, options) {
  this.data = data[0];
  this.name = name;
  this.type = options.type;
}

global.File = File;

describe("builders / contentInputViewBuilder", function () {
  it("should return view for 'content' input", function() {
    var node = {
      spec: {
        hints: [ "content" ],
        input: {
          name: "fileUpload"
        }
      },
      value: null
    };
    
    var view = builders.contentInputViewBuilder(node);
    
    expect(view).to.not.be.null;
    view.type.should.equal("file");
    view.name.should.equal(node.spec.input.name);
    expect(view.getValue()).to.be.null;
    expect(view.setValue).to.not.be.undefined;
  });
  
  it("should set initial UTF-8 encoded value", function() {
    var node = {
      spec: {
        hints: [ "content" ],
        input: {
          name: "fileUpload"
        }
      },
      value: {
        data: "Hi",
        type: "text/plain"
      }
    };
    
    var view = builders.contentInputViewBuilder(node);
    var value = view.getValue();
    
    expect(value).to.not.be.null;
    value.data.toString().should.equal("Hi");
    value.type.should.equal("text/plain");
    value.name.should.equal("");
  });
  
  it("should set initial base64 encoded value", function() {
    var node = {
      spec: {
        hints: [ "content" ],
        input: {
          name: "fileUpload"
        }
      },
      value: {
        data: "SGk=",
        type: "text/plain",
        encoding: "base64"
      }
    };
    
    var view = builders.contentInputViewBuilder(node);
    var value = view.getValue();
    
    expect(value).to.not.be.null;
    value.data.toString().should.equal("Hi");
    value.type.should.equal("text/plain");
    value.name.should.equal("");
  });
  
  it("setValue() should set the value", function() {
    var node = {
      spec: {
        hints: [ "content" ],
        input: {
          name: "fileUpload"
        }
      },
      value: null
    };
    
    var view = builders.contentInputViewBuilder(node);
    
    var file = new File(["Hi"], "", { type: "text/plain" });
    view.setValue(file);
    
    var value = view.getValue();
    
    expect(value).to.not.be.null;
    value.data.toString().should.equal("Hi");
    value.type.should.equal("text/plain");
    value.name.should.equal("");
  });
});
