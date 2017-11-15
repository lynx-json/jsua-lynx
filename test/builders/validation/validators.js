require("../../html-document-api");
var validators = require("../../../dist/builders/validation/validators");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;

describe("validators / noopValidator", function () {
  it("should return 'unknown' regardless of input params", function () {
    validators.noopValidator().should.equal("unknown");
    validators.noopValidator({ text: { maxLength: 3 } }, "sample").should.equal("unknown");
    validators.noopValidator({ number: { max: 3 } }, "sample").should.equal("unknown");
  });
});

describe("validators / requiredValidator", function () {
  it("should return 'invalid' when value is undefined", function () {
    var constraint = {};
    validators.requiredValidator(constraint).should.equal("invalid");
  });

  it("should return 'invalid' when value is null", function () {
    var constraint = {};
    validators.requiredValidator(constraint, null).should.equal("invalid");
  });

  it("should return 'invalid' when value is an empty string", function () {
    var constraint = {};
    validators.requiredValidator(constraint, "").should.equal("invalid");
  });

  it("should return 'invalid' when value is an empty array", function () {
    var constraint = {};
    validators.requiredValidator(constraint, []).should.equal("invalid");
  });

  it("should return 'valid' when value is a non-empty string", function () {
    var constraint = {};
    validators.requiredValidator(constraint, "testing").should.equal("valid");
  });
});

describe("validators / textValidator", function () {
  it("should return 'valid' when value is undefined", function () {
    var constraint = { maxLength: 2 };
    validators.textValidator(constraint).should.equal("valid");
  });

  it("should return 'valid' when value is null", function () {
    var constraint = { maxLength: 2 };
    validators.textValidator(constraint, null).should.equal("valid");
  });

  it("should return 'valid' when value is an empty string", function () {
    var constraint = { maxLength: 2 };
    validators.textValidator(constraint, "").should.equal("valid");
  });

  it("should return 'invalid' when value length is less than 'minLength'", function () {
    var constraint = { minLength: 4 };
    validators.textValidator(constraint, "Joe").should.equal("invalid");
  });

  it("should return 'valid' when value length is equal to 'minLength'", function () {
    var constraint = { minLength: 4 };
    validators.textValidator(constraint, "Joel").should.equal("valid");
  });

  it("should return 'valid' when value length is more than 'minLength'", function () {
    var constraint = { minLength: 4 };
    validators.textValidator(constraint, "Joelene").should.equal("valid");
  });

  it("should return 'valid' when value length is less than 'maxLength'", function () {
    var constraint = { maxLength: 4 };
    validators.textValidator(constraint, "Joe").should.equal("valid");
  });

  it("should return 'valid' when value length is equal to 'maxLength'", function () {
    var constraint = { maxLength: 4 };
    validators.textValidator(constraint, "Joel").should.equal("valid");
  });

  it("should return 'invalid' when value length is more than 'maxLength'", function () {
    var constraint = { maxLength: 4 };
    validators.textValidator(constraint, "Joelene").should.equal("invalid");
  });

  it("should return 'invalid' when value does not match 'pattern'", function () {
    var constraint = { pattern: "\\d*" };
    validators.textValidator(constraint, "ABCDE").should.equal("invalid");
  });

  it("should return 'valid' when value matches 'pattern'", function () {
    var constraint = { pattern: "\\d*" };
    validators.textValidator(constraint, "12345").should.equal("valid");
  });
});

describe("validators / numberValidator", function () {
  it("should return 'valid' when value is undefined", function () {
    var constraint = { max: 2 };
    validators.numberValidator(constraint).should.equal("valid");
  });

  it("should return 'valid' when value is null", function () {
    var constraint = { max: 2 };
    validators.numberValidator(constraint, null).should.equal("valid");
  });

  it("should return 'valid' when value is an empty string", function () {
    var constraint = { max: 2 };
    validators.numberValidator(constraint, "").should.equal("valid");
  });

  it("should return 'invalid' when value is less than 'min'", function () {
    var constraint = { min: 10 };
    validators.numberValidator(constraint, "5").should.equal("invalid");
  });

  it("should return 'valid' when value is equal to 'min'", function () {
    var constraint = { min: 10 };
    validators.numberValidator(constraint, "10").should.equal("valid");
  });

  it("should return 'valid' when value is more than 'min'", function () {
    var constraint = { min: 10 };
    validators.numberValidator(constraint, "15").should.equal("valid");
  });

  it("should return 'valid' when value is less than 'max'", function () {
    var constraint = { max: 10 };
    validators.numberValidator(constraint, "5").should.equal("valid");
  });

  it("should return 'valid' when value is equal to 'max'", function () {
    var constraint = { max: 10 };
    validators.numberValidator(constraint, "10").should.equal("valid");
  });

  it("should return 'invalid' when value is more than 'max'", function () {
    var constraint = { max: 10 };
    validators.numberValidator(constraint, "15").should.equal("invalid");
  });

  it("should return 'valid' when value is divisible by 'step'", function () {
    var constraint = { step: 7 };
    validators.numberValidator(constraint, "14").should.equal("valid");
  });

  it("should return 'invalid' when value is not divisible by 'step'", function () {
    var constraint = { step: 7 };
    validators.numberValidator(constraint, "15").should.equal("invalid");
  });

  it("should return 'valid' when value is divisible by 'step' when accounting for significant digits", function () {
    var constraint = { step: 0.01 };
    var value = "0.34";
    (+value % constraint.step).should.not.equal(0);
    validators.numberValidator(constraint, value).should.equal("valid");
  });

  it("should return 'invalid' when value has more decimals than 'step' ", function () {
    var constraint = { step: 0.01 };
    var value = "0.34001";
    validators.numberValidator(constraint, value).should.equal("invalid");
  });
});

describe("validators / typeMatchesTypeRange", function () {
  it("should return true when exact match", function () {
    validators.typeMatchesTypeRange("text/plain", "text/plain").should.be.true;
  });

  it("should return true when type range contains parameters", function () {
    validators.typeMatchesTypeRange("text/plain", "text/plain;charset=utf-8").should.be.true;
  });

  it("should return true when media type matches type range", function () {
    validators.typeMatchesTypeRange("text/plain", "text/*").should.be.true;
  });

  it("should return true when media type contains parameters", function () {
    validators.typeMatchesTypeRange("text/plain;charset=utf-8", "text/*").should.be.true;
  });

  it("should return true when media type matches global type range", function () {
    validators.typeMatchesTypeRange("text/plain", "*/*").should.be.true;
  });
});

describe("validators / contentValidator", function () {
  it("should return 'valid' when value's media type matches type range", function () {
    var constraint = { type: "image/*" };
    validators.contentValidator(constraint, { type: "image/jpeg" }).should.equal("valid");
  });

  it("should return 'valid' when value's media type matches array of type range", function () {
    var constraint = { type: ["text/*", "image/*"] };
    validators.contentValidator(constraint, { type: "image/jpeg" }).should.equal("valid");
  });

  it("should return 'valid' when value's media type matches type", function () {
    var constraint = { type: "image/jpeg" };
    validators.contentValidator(constraint, { type: "image/jpeg" }).should.equal("valid");
  });

  it("should return 'valid' when value's media type matches array of types", function () {
    var constraint = { type: ["image/jpeg", "image/png"] };
    validators.contentValidator(constraint, { type: "image/jpeg" }).should.equal("valid");
  });

  it("should return 'invalid' when value's media type does not match type range", function () {
    var constraint = { type: "video/*" };
    validators.contentValidator(constraint, { type: "image/jpeg" }).should.equal("invalid");
  });

  it("should return 'invalid' when value's media type does not match array of type range", function () {
    var constraint = { type: ["text/*", "image/*"] };
    validators.contentValidator(constraint, { type: "video/ogg" }).should.equal("invalid");
  });

  it("should return 'invalid' when value's media type does not match type", function () {
    var constraint = { type: "image/jpeg" };
    validators.contentValidator(constraint, { type: "image/png" }).should.equal("invalid");
  });

  it("should return 'invalid' when value's media type does not match array of types", function () {
    var constraint = { type: ["image/jpeg", "image/png"] };
    validators.contentValidator(constraint, { type: "video/ogg" }).should.equal("invalid");
  });
});
