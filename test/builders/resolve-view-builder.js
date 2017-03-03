var resolveViewBuilder = require("../../lib/builders/resolve-view-builder").resolveViewBuilder;
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / resolveViewBuilder", function () {
  it("should return null when no registrations", function () {
    var registrations = [];
    var hints = ["text"];
    var input = false;
    expect(resolveViewBuilder(registrations, hints, input)).to.be.null;
  });
  
  it("should return null when no hints", function () {
    var registrations = [
      {
        hint: "text",
        builder: function () {},
        input: false
      }
    ];
    var hints = [];
    var input = false;
    expect(resolveViewBuilder(registrations, hints, input)).to.be.null;
  });
  
  it("should return null when hint doesn't match", function () {
    var registrations = [
      {
        hint: "container",
        builder: function () {},
        input: false
      }
    ];
    var hints = ["text"];
    var input = false;
    expect(resolveViewBuilder(registrations, hints, input)).to.be.null;
  });
  
  it("should return null when input doesn't match", function () {
    var registrations = [
      {
        hint: "text",
        builder: function () {},
        input: true
      }
    ];
    var hints = ["text"];
    var input = false;
    expect(resolveViewBuilder(registrations, hints, input)).to.be.null;
  });
  
  it("should return builder when matching", function () {
    var registrations = [
      {
        hint: "text",
        builder: function () {},
        input: false
      }
    ];
    var hints = ["text"];
    var input = false;
    expect(resolveViewBuilder(registrations, hints, input)).to.not.be.null;
  });
  
  it("should return builder for most specific hint", function () {
    function textBuilderFunc() {}
    function lineBuilderFunc() {}
    var registrations = [
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
    var hints = ["line", "text"];
    var input = false;
    
    var builder = resolveViewBuilder(registrations, hints, input);
    expect(builder).to.not.be.null;
    builder.should.equal(lineBuilderFunc);
  });
});
