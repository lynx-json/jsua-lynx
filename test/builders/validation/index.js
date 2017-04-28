require("../../html-document-api");
var util = require("../../../lib/util");
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
    var getValidatorStub = sinon.stub(validation, "getValidator");
    getValidatorStub.returns(fooValidatorStub);
    
    validation.validateValue(normalizedValidationObj, "");
    getValidatorStub.restore();
    
    fooValidatorStub.calledOnce.should.be.true;
    getValidatorStub.calledOnce.should.be.true;
    normalizedValidationObj.state.should.equal("valid");
    normalizedValidationObj.priorState.should.equal("unknown");
    normalizedValidationObj.changes.length.should.equal(2);
    normalizedValidationObj.changes[0].should.equal(normalizedValidationObj.constraints[0]);
    normalizedValidationObj.changes[0].state.should.equal("valid");
    normalizedValidationObj.changes[0].priorState.should.equal("unknown");
    normalizedValidationObj.changes[1].should.equal(normalizedValidationObj);
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
    
    var barValidatorStub = sinon.stub();
    barValidatorStub.returns("invalid");
    
    var getValidatorStub = sinon.stub(validation, "getValidator");
    getValidatorStub.withArgs("foo").returns(fooValidatorStub);
    getValidatorStub.withArgs("bar").returns(barValidatorStub);
    
    validation.validateValue(normalizedValidationObj, "");
    getValidatorStub.restore();
    
    fooValidatorStub.calledOnce.should.be.true;
    barValidatorStub.calledOnce.should.be.true;
    getValidatorStub.calledTwice.should.be.true;
    normalizedValidationObj.state.should.equal("invalid");
    normalizedValidationObj.priorState.should.equal("unknown");
    normalizedValidationObj.changes.length.should.equal(3);
    normalizedValidationObj.changes[0].should.equal(normalizedValidationObj.constraints[0]);
    normalizedValidationObj.changes[0].state.should.equal("valid");
    normalizedValidationObj.changes[0].priorState.should.equal("unknown");
    normalizedValidationObj.changes[1].should.equal(normalizedValidationObj.constraints[1]);
    normalizedValidationObj.changes[1].state.should.equal("invalid");
    normalizedValidationObj.changes[1].priorState.should.equal("unknown");
    normalizedValidationObj.changes[2].should.equal(normalizedValidationObj);
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
  
  it("should normalize validation content targets", function () {
    var validationObj = {
      required: {
        invalid: "propertyRefForRequired"
      },
      text: {
        minLength: 2,
        maxLength: 10,
        valid: "propertyRefForValidTextLength",
        invalid: "propertyRefForInvalidTextLength"
      }
    };
    
    validation.normalizeValidationConstraintSetObject(validationObj);
    
    validationObj.constraints[0].contentTargets.length.should.equal(1);
    validationObj.constraints[0].contentTargets[0].name.should.equal("propertyRefForRequired");
    validationObj.constraints[0].contentTargets[0].forState.should.equal("invalid");
    
    validationObj.constraints[1].contentTargets.length.should.equal(2);
    validationObj.constraints[1].contentTargets[0].name.should.equal("propertyRefForValidTextLength");
    validationObj.constraints[1].contentTargets[0].forState.should.equal("valid");
    validationObj.constraints[1].contentTargets[1].name.should.equal("propertyRefForInvalidTextLength");
    validationObj.constraints[1].contentTargets[1].forState.should.equal("invalid");
  });
});

describe("validation / addValidationExtensionsToView", function () {
  it("should call the appropriate funcs for input views", function () {
    var view = {}, validationObj = {};
    view.matches = function () { return true; };
    var stubs = [
      sinon.stub(validation, "normalizeValidationConstraintSetObject"),
      sinon.stub(validation, "addValidationExtensionsToInputView")
    ];
    
    validation.addValidationExtensionsToView(view, validationObj);
    stubs.forEach(stub => stub.restore());
    
    stubs.forEach(stub => stub.calledOnce.should.equal(true));
  });
  
  it("should call the appropriate funcs for container views", function () {
    var view = {}, validationObj = {};
    view.matches = function () { return false; };
    var stubs = [
      sinon.stub(validation, "normalizeValidationConstraintSetObject"),
      sinon.stub(validation, "addValidationExtensionsToContainerView")
    ];
    
    validation.addValidationExtensionsToView(view, validationObj);
    stubs.forEach(stub => stub.restore());
    
    stubs.forEach(stub => stub.calledOnce.should.equal(true));
  });
});

describe("validation / addValidationExtensionsToInputView", function () {
  beforeEach(function () {
    view = document.createElement("input");
    view.lynxGetValue = sinon.stub();
    view.lynxSetValue = sinon.stub();
    view.lynxUpdateValidationContentVisibility = sinon.stub();
    sinon.stub(view, "addEventListener");
    
    stubs = [
      sinon.stub(validation, "formatValue"),
      sinon.stub(validation, "validateValue"),
      sinon.stub(validation, "raiseValiditionStateChangedEvent")
    ];
    
    validationObj = {
      state: "valid",
      priorState: "valid",
      changes: []
    };
  });
  
  afterEach(function () {
    stubs.forEach(stub => stub.restore());
  });
  
  var view, stubs, validationObj;
  
  it("should set 'data-lynx-validation-state' attribute", function () {
    validationObj.state = "invalid"; 
    validation.addValidationExtensionsToInputView(view, validationObj);
    view.getAttribute("data-lynx-validation-state").should.equal("invalid");
  });
  
  it("should set 'data-lynx-validation-state' attribute and raise event when validity state changes", function () { 
    validation.addValidationExtensionsToInputView(view, validationObj);
    var changeListener = view.addEventListener.getCall(0).args[1];
    
    validationObj.state = "invalid";
    validationObj.priorState = "valid";
    changeListener();
    
    view.lynxGetValue.calledOnce.should.equal(true);
    validation.validateValue.calledOnce.should.equal(true);
    view.getAttribute("data-lynx-validation-state").should.equal("invalid");
    validation.raiseValiditionStateChangedEvent.calledOnce.should.equal(true);
  });
  
  it("should update target content visibility when validation constraints change state", function () { 
    validation.addValidationExtensionsToInputView(view, validationObj);
    var changeListener = view.addEventListener.getCall(0).args[1];
    
    validationObj.changes.push({});
    changeListener();
    
    view.lynxUpdateValidationContentVisibility.calledOnce.should.equal(true);
  });
  
  it("should format the value when a formatted validation constraint changes state", function () { 
    validation.addValidationExtensionsToInputView(view, validationObj);
    var changeListener = view.addEventListener.getCall(0).args[1];
    
    validationObj.changes.push({
      name: "text",
      state: "valid",
      pattern: "(\d{5})-?(\d{4})",
      format: "$1-$2"
    });
    
    changeListener();
    
    view.lynxUpdateValidationContentVisibility.calledOnce.should.equal(true);
    view.lynxGetValue.calledTwice.should.equal(true);
    validation.formatValue.calledOnce.should.equal(true);
    view.lynxSetValue.calledOnce.should.equal(true);
  });
});

describe("validation / addValidationExtensionsToContainerView", function () {
  beforeEach(function () {
    view = document.createElement("div");
    view.lynxUpdateValidationContentVisibility = sinon.stub();
    sinon.stub(view, "addEventListener");
    
    stubs = [
      sinon.stub(validation, "resolveValidationStateOfDescendants"),
      sinon.stub(validation, "raiseValiditionStateChangedEvent"),
      sinon.stub(validation, "validateContainer")
    ];
    
    validationObj = {
      state: "valid",
      priorState: "valid",
      changes: []
    };
  });
  
  afterEach(function () {
    stubs.forEach(stub => stub.restore());
  });
  
  var view, stubs, validationObj;
  
  it("should set 'data-lynx-validation-state' attribute", function () {
    validation.resolveValidationStateOfDescendants.returns("invalid");
    validation.addValidationExtensionsToContainerView(view, validationObj);
    view.getAttribute("data-lynx-validation-state").should.equal("invalid");
  });
  
  it("should set 'data-lynx-validation-state' attribute, raise event, and update target content when validity state changes", function () { 
    validation.addValidationExtensionsToContainerView(view, validationObj);
    var changeListener = view.addEventListener.getCall(0).args[1];
    
    validationObj.state = "invalid";
    validationObj.priorState = "valid";
    changeListener({});
    
    validation.validateContainer.calledOnce.should.equal(true);
    view.getAttribute("data-lynx-validation-state").should.equal("invalid");
    validation.raiseValiditionStateChangedEvent.calledOnce.should.equal(true);
    view.lynxUpdateValidationContentVisibility.calledOnce.should.equal(true);
  });
});

describe("validation / updateContentTargetVisibility", function () {
  beforeEach(function () {
    contentView = {
      lynxSetVisibility: function (visibility) {
        contentView["data-lynx-visibility"] = visibility;
      }
    };
    
    constraint = {
      state: "unknown",
      contentTargets: []
    };
    
    findNearestViewStub = sinon.stub(util, "findNearestView");
    findNearestViewStub.returns(contentView);
  });
  
  afterEach(function () {
    findNearestViewStub.restore();
  });
  
  var contentView, constraint, findNearestViewStub;
  
  it("should show content for validation constraint state", function () {
    constraint.state = "valid";
    constraint.contentTargets.push({ forState: "valid", name: "propertyRef" });
    validation.updateContentTargetVisibility({}, constraint);
    contentView["data-lynx-visibility"].should.equal("visible");
  });
  
  it("should hide content not for validation constraint state", function () {
    constraint.state = "invalid";
    constraint.contentTargets.push({ forState: "valid", name: "propertyRef" });
    validation.updateContentTargetVisibility({}, constraint);
    contentView["data-lynx-visibility"].should.equal("hidden");
  });
});
