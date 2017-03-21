require("../../html-document-api");
var validation = require("../../../lib/builders/validation");
var validators = require("../../../lib/builders/validation/validators");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("validation / validateValue", function () {
  it("should call the validator and update validation states", function () {
    var normalizedValidationObj = {
      state: "unknown",
      priorState: "",
      constraints: [
        {
          name: "foo",
          state: "unknown",
          priorState: ""
        }
      ]
    };
    
    var fooValidatorStub = sinon.stub();
    fooValidatorStub.returns("valid");
    validation.validators.foo = fooValidatorStub;
    
    validation.validateValue(normalizedValidationObj, "");
    
    fooValidatorStub.calledOnce.should.be.true;
    normalizedValidationObj.state.should.equal("valid");
    normalizedValidationObj.priorState.should.equal("unknown");
    normalizedValidationObj.changes.length.should.equal(1);
    normalizedValidationObj.changes[0].should.equal(normalizedValidationObj.constraints[0]);
    normalizedValidationObj.changes[0].state.should.equal("valid");
    normalizedValidationObj.changes[0].priorState.should.equal("unknown");
  });
  
  it("should call all validators and update validation states", function () {
    var normalizedValidationObj = {
      state: "unknown",
      priorState: "",
      constraints: [
        {
          name: "foo",
          state: "unknown",
          priorState: ""
        },
        {
          name: "bar",
          state: "unknown",
          priorState: ""
        }
      ]
    };
    
    var fooValidatorStub = sinon.stub();
    fooValidatorStub.returns("valid");
    validation.validators.foo = fooValidatorStub;
    
    var barValidatorStub = sinon.stub();
    barValidatorStub.returns("invalid");
    validation.validators.bar = barValidatorStub;
    
    validation.validateValue(normalizedValidationObj, "");
    
    fooValidatorStub.calledOnce.should.be.true;
    barValidatorStub.calledOnce.should.be.true;
    normalizedValidationObj.state.should.equal("invalid");
    normalizedValidationObj.priorState.should.equal("unknown");
    normalizedValidationObj.changes.length.should.equal(2);
    normalizedValidationObj.changes[0].should.equal(normalizedValidationObj.constraints[0]);
    normalizedValidationObj.changes[0].state.should.equal("valid");
    normalizedValidationObj.changes[0].priorState.should.equal("unknown");
    normalizedValidationObj.changes[1].should.equal(normalizedValidationObj.constraints[1]);
    normalizedValidationObj.changes[1].state.should.equal("invalid");
    normalizedValidationObj.changes[1].priorState.should.equal("unknown");
  });
});

describe("validation / getValidator", function () {
  it("should return noop validator when 'constraintName' is undefined", function () {
    var validator = validation.getValidator();
    expect(validator).to.equal(validators.noopValidator);
  });
  
  it("should return noop validator when 'constraintName' is null", function () {
    var validator = validation.getValidator(null);
    expect(validator).to.equal(validators.noopValidator);
  });
});

describe("validation / resolveValidationState", function () {
  it("should return 'unknown' for non-array param", function () {
    var state = validation.resolveValidationState(null);
    expect(state).to.equal("unknown");
  });
  
  it("should return 'unknown' for empty array param", function () {
    var state = validation.resolveValidationState([]);
    expect(state).to.equal("unknown");
  });
  
  it("should return 'unknown' for ['unknown']", function () {
    var state = validation.resolveValidationState(["unknown"]);
    expect(state).to.equal("unknown");
  });
  
  it("should return 'valid' for ['valid']", function () {
    var state = validation.resolveValidationState(["valid"]);
    expect(state).to.equal("valid");
  });
  
  it("should return 'invalid' for ['invalid']", function () {
    var state = validation.resolveValidationState(["invalid"]);
    expect(state).to.equal("invalid");
  });
  
  it("should return 'invalid' for ['valid', 'invalid']", function () {
    var state = validation.resolveValidationState(["valid", "invalid"]);
    expect(state).to.equal("invalid");
  });
  
  it("should return 'unknown' for ['valid', 'unknown']", function () {
    var state = validation.resolveValidationState(["valid", "unknown"]);
    expect(state).to.equal("unknown");
  });
  
  it("should return 'invalid' for ['valid', 'invalid', 'unknown']", function () {
    var state = validation.resolveValidationState(["valid", "invalid", "unknown"]);
    expect(state).to.equal("invalid");
  });
});

describe("validation / normalizeValidationConstraintSetObject", function () {
  it("should add properties: 'state', 'priorState', and 'constraints'", function () {
    var validationObj = {};
    
    validation.normalizeValidationConstraintSetObject(validationObj);
    
    expect(validationObj).to.have.property("state");
    expect(validationObj).to.have.property("priorState");
    expect(validationObj).to.have.property("constraints");
    validationObj.state.should.equal("unknown");
    validationObj.priorState.should.equal("");
    validationObj.constraints.length.should.equal(0);
  });
  
  it("should add constraint object to 'constraints' array", function () {
    var validationObj = {
      text: {
        minLength: 2,
        maxLength: 10,
        invalid: "propertyRef"
      }
    };
    
    validation.normalizeValidationConstraintSetObject(validationObj);
    
    validationObj.constraints.length.should.equal(1);
    validationObj.constraints[0].name.should.equal("text");
    validationObj.constraints[0].state.should.equal("unknown");
    validationObj.constraints[0].priorState.should.equal("");
  });
  
  it("should add arrays of constraint objects to 'constraints' array", function () {
    var validationObj = {
      text: [
        {
          minLength: 2,
          invalid: "propertyRefForMin"
        },
        {
          maxLength: 10,
          invalid: "propertyRefForMax"
        }
      ]
    };
    
    validation.normalizeValidationConstraintSetObject(validationObj);
    
    validationObj.constraints.length.should.equal(2);
    validationObj.constraints[0].name.should.equal("text");
    validationObj.constraints[1].name.should.equal("text");
  });
  
  it("should add multiple constraint object types to 'constraints' array", function () {
    function nameMatches(name) {
      return function (constraint) {
        return constraint.name === name;
      };
    }
    
    var validationObj = {
      required: {
        invalid: "propertyRefForRequired"
      },
      text: {
        minLength: 2,
        maxLength: 10,
        invalid: "propertyRefForTextLength"
      }
    };
    
    validation.normalizeValidationConstraintSetObject(validationObj);
    
    validationObj.constraints.length.should.equal(2);
    validationObj.constraints.filter(nameMatches("required")).length.should.equal(1);
    validationObj.constraints.filter(nameMatches("text")).length.should.equal(1);
  });
});
