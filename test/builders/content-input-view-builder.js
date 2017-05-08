require("../html-document-api");
var builders = require("../../dist/builders/content-input-view-builder");
var building = require("@lynx-json/jsua").building;
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

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
  beforeEach(function () {
    buildStub = sinon.stub(building, "build");
  });

  afterEach(function () {
    buildStub.restore();
  });

  var buildStub;

  it("should return view for 'content' input", function () {
    var node = {
      spec: {
        hints: ["content"],
        input: "fileUpload"
      },
      value: null
    };

    buildStub.returns(Promise.resolve({ view: document.createElement("div") }));

    return builders.contentInputViewBuilder(node).then(function (view) {
      var inputView = view.querySelector("input");
      var contentView = view.querySelector("[data-lynx-embedded-view]");

      expect(view).to.not.be.null;
      expect(inputView).to.not.be.null;
      expect(contentView).to.be.null;
      inputView.type.should.equal("file");
      inputView.name.should.equal(node.spec.input);
      expect(view.lynxGetValue()).to.not.be.ok;
      expect(view.lynxSetValue).to.not.be.undefined;
    });
  });

  it("should set initial UTF-8 encoded value", function () {
    var node = {
      spec: {
        hints: ["content"],
        input: "fileUpload"
      },
      value: {
        data: "Hi",
        type: "text/plain"
      }
    };

    buildStub.returns(Promise.resolve({ view: document.createElement("div") }));

    return builders.contentInputViewBuilder(node).then(function (view) {
      var contentView = view.querySelector("[data-lynx-embedded-view]");
      var value = view.lynxGetValue();

      expect(contentView).to.not.be.null;
      expect(value).to.not.be.null;
      value.type.should.equal("text/plain");
      return getBlobValue(value);
    }).then(function (blobValue) {
      blobValue.should.equal("Hi");
    });
  });

  it("should set initial base64 encoded value", function () {
    var node = {
      spec: {
        hints: ["content"],
        input: "fileUpload"
      },
      value: {
        data: "SGk=",
        type: "text/plain",
        encoding: "base64"
      }
    };

    buildStub.returns(Promise.resolve({ view: document.createElement("div") }));

    return builders.contentInputViewBuilder(node).then(function (view) {
      var contentView = view.querySelector("[data-lynx-embedded-view]");
      var value = view.lynxGetValue();

      expect(contentView).to.not.be.null;
      expect(value).to.not.be.null;
      value.type.should.equal("text/plain");
      return getBlobValue(value);
    }).then(function (blobValue) {
      blobValue.should.equal("Hi");
    });
  });

  it("lynxSetValue() should set the value", function () {
    var node = {
      spec: {
        hints: ["content"],
        input: "fileUpload"
      },
      value: null
    };

    buildStub.returns(Promise.resolve({ view: document.createElement("div") }));

    return builders.contentInputViewBuilder(node).then(function (view) {
      var file = new Blob(["Hi"], { type: "text/plain" });
      return view.lynxSetValue(file);
    }).then(function (view) {
      var contentView = view.querySelector("[data-lynx-embedded-view]");
      var value = view.lynxGetValue();

      expect(contentView).to.not.be.null;
      expect(value).to.not.be.null;
      value.type.should.equal("text/plain");
      return getBlobValue(value);
    }).then(function (blobValue) {
      blobValue.should.equal("Hi");
    });
  });

  it("lynxSetValue() should publish change event", function () {
    var node = {
      spec: {
        hints: ["content"],
        input: "fileUpload"
      },
      value: null
    };

    buildStub.returns(Promise.resolve({ view: document.createElement("div") }));

    return builders.contentInputViewBuilder(node).then(function (view) {
      var file = new Blob(["Hi"], { type: "text/plain" });

      return new Promise(function (resolve) {
        view.addEventListener("change", function () {
          resolve();
        });
        view.lynxSetValue(file);
      });
    });
  });
});
