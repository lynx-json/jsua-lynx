import * as util from "../../util";
import * as validators from "./validators";

var validatorsByConstraint = {
  required: "requiredValidator",
  text: "textValidator",
  number: "numberValidator",
  content: "contentValidator"
};

export function getValidator(constraintName) {
  return validators[validatorsByConstraint[constraintName]] || validators.noopValidator;
}

export function updateContentTargetVisibility(origin, constraint) {
  constraint.contentTargets.forEach(contentTarget => {
    var contentView = util.findNearestView(origin, "[data-lynx-name='" + contentTarget.name + "']");
    if (!contentView) return;
    var visibility = contentTarget.forState === constraint.state ? "visible" : "hidden";
    contentView.lynxSetVisibility(visibility);
  });
}

export function addValidationExtensionsToView(view, validation) {
  exports.normalizeValidationConstraintSetObject(validation);
  
  if (view.matches("[data-lynx-input]")) {
    exports.addValidationExtensionsToInputView(view, validation);
  } else {
    exports.addValidationExtensionsToContainerView(view, validation);
  }
  
  view.lynxUpdateValidationContentVisibility = function() {
    exports.updateContentTargetVisibility(view, validation);
    validation.constraints.forEach(constraint => exports.updateContentTargetVisibility(view, constraint));
  };
}

export function resolveValidationStateOfDescendants(view) {
  var validatedViews = view.querySelectorAll("[data-lynx-validation-state]");
  var validationStates = Array.from(validatedViews)
    .map(validatedView => validatedView.getAttribute("data-lynx-validation-state"));
  return exports.resolveValidationState(validationStates);
}

export function validateContainer(view, validation) {
  validation.changes = [];
  
  validation.priorState = validation.state;
  validation.state = exports.resolveValidationStateOfDescendants(view);
  
  if (validation.state === validation.priorState) return;
  validation.changes.push(validation);
}

export function addValidationExtensionsToContainerView(view, validation) {
  validation.state = exports.resolveValidationStateOfDescendants(view);
  view.setAttribute("data-lynx-validation-state", validation.state);
  
  view.lynxGetValidationState = function () {
    return view.getAttribute("data-lynx-validation-state");
  };
  
  view.addEventListener("lynx-validation-state-change", function (evt) {
    if (evt.srcElement === view) return;
    exports.validateContainer(view, validation);
    
    if (validation.state !== validation.priorState) {
      view.setAttribute("data-lynx-validation-state", validation.state);
      exports.raiseValidationStateChangedEvent(view, validation);
      view.lynxUpdateValidationContentVisibility();
    }
    
    exports.raiseValidatedEvent(view);
  });
}

export function formatValue(formattedConstraint, value) {
  var regexp = validators.createRegExpForTextConstraintPattern(formattedConstraint.pattern);
  var formattedValue = value.replace(regexp, formattedConstraint.format);
  return formattedValue;
}

export function addValidationExtensionsToInputView(view, validation) {
  function isFormattedConstraint(constraint) {
    return constraint.name === "text" && 
      constraint.state === "valid" &&
      "format" in constraint && 
      "pattern" in constraint;
  }
  
  view.setAttribute("data-lynx-validation-state", validation.state);
  
  view.lynxGetValidationState = function () {
    return view.getAttribute("data-lynx-validation-state");
  };
  
  view.addEventListener("change", function () {
    var value = view.lynxGetValue();
    exports.validateValue(validation, value);
    
    if (validation.state !== validation.priorState) {
      view.setAttribute("data-lynx-validation-state", validation.state);
      exports.raiseValidationStateChangedEvent(view, validation);
    }
    
    if (validation.changes.length > 0) {
      view.lynxUpdateValidationContentVisibility();
      let formattedConstraint = validation.changes.find(isFormattedConstraint);
      if (formattedConstraint) view.lynxSetValue( exports.formatValue(formattedConstraint, view.lynxGetValue() ) );
    }
  });
}

export function validateValue(validation, value) {
  validation.changes = [];
  
  validation.constraints.forEach(constraint => {
    constraint.priorState = constraint.state;
    constraint.state = exports.getValidator(constraint.name)(constraint, value);
    if (constraint.state !== constraint.priorState) validation.changes.push(constraint);
  });
  
  validation.priorState = validation.state;
  validation.state = exports.resolveValidationState(validation.constraints.map(constraint => constraint.state));
  if (validation.state !== validation.priorState) validation.changes.push(validation);
}

export function raiseValidationStateChangedEvent(view, validation) {
  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("lynx-validation-state-change", true, false);
  changeEvent.validation = validation;
  view.dispatchEvent(changeEvent);
}

export function raiseValidatedEvent(view) {
  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("lynx-validated", true, false);
  view.dispatchEvent(changeEvent);
}

export function normalizeValidationConstraintSetObject(validation) {
  var initialConstraintStates = [];
  var initialConstraints = [];
  
  function normalizeContentTargets(constraint) {
    ["valid", "invalid", "unknown"].forEach(forState => {
      var name = constraint[forState];
      if (name) constraint.contentTargets.push({ forState, name });
    });
  }
  
  Object.getOwnPropertyNames(validation).forEach(propertyName => {
    if (isValidationConstraintName(propertyName) === false) return;
    
    var constraints = validation[propertyName];
    if (!Array.isArray(constraints)) constraints = [ constraints ];
    
    constraints.forEach(constraint => {
      constraint.name = propertyName;
      constraint.state = constraint.state || "unknown";
      constraint.priorState = "";
      constraint.contentTargets = [];
      normalizeContentTargets(constraint);
      initialConstraintStates.push(constraint.state);
      initialConstraints.push(constraint);
    });
  });
  
  validation.state = exports.resolveValidationState(initialConstraintStates);
  validation.priorState = "";
  validation.constraints = initialConstraints;
  validation.contentTargets = [];
  normalizeContentTargets(validation);
}

export function isValidationConstraintName(propertyName) {
  if (propertyName === "state") return false;
  if (propertyName === "valid") return false;
  if (propertyName === "invalid") return false;
  if (propertyName === "unknown") return false;
  return true;
}

export function resolveValidationState(validationStates) {
  if (!Array.isArray(validationStates)) return "unknown";
  if (validationStates.indexOf("invalid") > -1) return "invalid";
  if (validationStates.indexOf("unknown") > -1) return "unknown";
  if (validationStates.indexOf("valid") > -1) return "valid";
  return "unknown";
}
