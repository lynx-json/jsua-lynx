require("../html-document-api");
var builders = require("../../lib/builders/content-input-view-builder");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var should = chai.should();
var expect = chai.expect;

function getBlobValue(blob) {
  return new Promise(function (resolve, reject) {
    if (!blob) reject(new Error("'blob' param is required."));
    
    var reader = new FileReader();
    
    reader.onloadend = function () {
      if (!reader.result) reject(new Error("Failed to read Blob."));
      resolve(reader.result);
    };
    
    reader.onerror = function (err) {
      reject(err);
    };
    
    reader.readAsText(blob);
  });
}

describe("builders / contentInputViewBuilder", function () {
  it("should return view for 'content' input", function(done) {
    var node = {
      spec: {
        hints: [ "content" ],
        input: {
          name: "fileUpload"
        }
      },
      value: null
    };
    
    builders.contentInputViewBuilder(node).then(function (view) {
      var inputView = view.querySelector("input");
      
      expect(view).to.not.be.null;
      expect(inputView).to.not.be.null;
      inputView.type.should.equal("file");
      inputView.name.should.equal(node.spec.input.name);
      expect(view.getValue()).to.be.null;
      expect(view.setValue).to.not.be.undefined;
    }).then(done, done);
  });
  
  it("should set initial UTF-8 encoded value", function(done) {
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
    
    builders.contentInputViewBuilder(node).then(function (view) {
      var value = view.getValue();
      expect(value).to.not.be.null;
      value.type.should.equal("text/plain");
      return getBlobValue(value);
    }).then(function (blobValue) {
      blobValue.should.equal("Hi");
    }).then(done, done);
  });
  
  it("should set initial base64 encoded value", function(done) {
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
    
    builders.contentInputViewBuilder(node).then(function (view) {
      var value = view.getValue();
      expect(value).to.not.be.null;
      value.type.should.equal("text/plain");
      return getBlobValue(value);
    }).then(function (blobValue) {
      blobValue.should.equal("Hi");
    }).then(done, done);
  });
  
  it("setValue() should set the value", function(done) {
    var node = {
      spec: {
        hints: [ "content" ],
        input: {
          name: "fileUpload"
        }
      },
      value: null
    };
    
    builders.contentInputViewBuilder(node).then(function (view) {
      var file = new Blob(["Hi"], { type: "text/plain" });
      return view.setValue(file);
    }).then(function (view) {
      var value = view.getValue();
      expect(value).to.not.be.null;
      value.type.should.equal("text/plain");
      return getBlobValue(value);
    }).then(function (blobValue) {
      blobValue.should.equal("Hi");
    }).then(done, done);
  });
});
