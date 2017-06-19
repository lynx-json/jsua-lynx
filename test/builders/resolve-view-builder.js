var resolveViewBuilder = require("../../dist/builders/resolve-view-builder").resolveViewBuilder;
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / resolveViewBuilder", function () {
  var node, registrations;
  
  beforeEach(function () {
    node = {
      spec: {
        hints: []
      }
    };
    
    registrations = [];
  });
  
  it("should return null when no registrations", function () {
    node.spec.hints.push("text");
    expect(resolveViewBuilder(registrations, node)).to.be.null;
  });
  
  it("should return null when no hints", function () {
    registrations.push({
      hint: "text",
      builder: function () {}
    });
    expect(resolveViewBuilder(registrations, node)).to.be.null;
  });
  
  it("should return null when hint doesn't match", function () {
    registrations.push({
      hint: "container",
      builder: function () {}
    });
    node.spec.hints.push("text");
    expect(resolveViewBuilder(registrations, node)).to.be.null;
  });
  
  it("should return null when condition returns false", function () {
    registrations.push({
      hint: "container",
      builder: function () {},
      condition: function () { return false; }
    });
    node.spec.hints.push("text");
    expect(resolveViewBuilder(registrations, node)).to.be.null;
  });
  
  it("should return builder when matching unconditionally", function () {
    registrations.push({
      hint: "container",
      builder: function () {}
    });
    node.spec.hints.push("container");
    expect(resolveViewBuilder(registrations, node)).to.not.be.null;
  });
  
  it("should return builder when matching conditionally", function () {
    function expectedBuilder() {}
    
    registrations.push({
      hint: "container",
      builder: function () {},
      condition: function () { return false; }
    });
    registrations.push({
      hint: "container",
      builder: expectedBuilder,
      condition: function () { return true; }
    });
    node.spec.hints.push("container");
    
    var builder = resolveViewBuilder(registrations, node);
    expect(builder).to.not.be.null;
    builder.should.equal(expectedBuilder);
  });
  
  it("should return builder for most specific hint", function () {
    function textBuilderFunc() {}
    function lineBuilderFunc() {}
    
    registrations.push({
      hint: "text",
      builder: textBuilderFunc
    });
    registrations.push({
      hint: "line",
      builder: lineBuilderFunc
    });
    node.spec.hints.push("line");
    node.spec.hints.push("text");
    
    var builder = resolveViewBuilder(registrations, node);
    expect(builder).to.not.be.null;
    builder.should.equal(lineBuilderFunc);
  });
});
