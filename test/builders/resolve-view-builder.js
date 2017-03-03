var resolveViewBuilder = require("../../lib/builders/resolve-view-builder").resolveViewBuilder;
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / resolveViewBuilder", function () {
  it("should return null when no registrations", function () {
    let registrations = [];
    let hints = ["text"];
    let input = false;
    expect(resolveViewBuilder(registrations, hints, input)).to.be.null;
  });
  
  it("should return null when no hints", function () {
    let registrations = [
      {
        hint: "text",
        builder: function () {},
        input: false
      }
    ];
    let hints = [];
    let input = false;
    expect(resolveViewBuilder(registrations, hints, input)).to.be.null;
  });
  
  it("should return null when hint doesn't match", function () {
    let registrations = [
      {
        hint: "container",
        builder: function () {},
        input: false
      }
    ];
    let hints = ["text"];
    let input = false;
    expect(resolveViewBuilder(registrations, hints, input)).to.be.null;
  });
  
  it("should return null when input doesn't match", function () {
    let registrations = [
      {
        hint: "text",
        builder: function () {},
        input: true
      }
    ];
    let hints = ["text"];
    let input = false;
    expect(resolveViewBuilder(registrations, hints, input)).to.be.null;
  });
  
  it("should return builder when matching", function () {
    let registrations = [
      {
        hint: "text",
        builder: function () {},
        input: false
      }
    ];
    let hints = ["text"];
    let input = false;
    expect(resolveViewBuilder(registrations, hints, input)).to.not.be.null;
  });
  
  it("should return builder for most specific hint", function () {
    function textBuilderFunc() {}
    function lineBuilderFunc() {}
    let registrations = [
      {
        hint: "text",
        builder: textBuilderFunc,
        input: false
      },
      {
        hint: "line",
        builder: lineBuilderFunc,
        input: false
      }
    ];
    let hints = ["line", "text"];
    let input = false;
    
    let builder = resolveViewBuilder(registrations, hints, input);
    expect(builder).to.not.be.null;
    builder.should.equal(lineBuilderFunc);
  });
});
