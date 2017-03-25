import { noopValidator, requiredValidator, createRegExpForTextConstraintPattern, textValidator, numberValidator, contentValidator } from "./validators";

export var validators = {
  required: requiredValidator,
  text: textValidator,
  number: numberValidator,
  content: contentValidator
};

export function getValidator(constraintName) {
  return validators[constraintName] || noopValidator;
}

export function addValidationExtensionsToView(view, validation) {
  normalizeValidationConstraintSetObject(validation);
  
  if (view.matches("[data-lynx-input=true]")) {
    addValidationExtensionsToInputView(view, validation);
  } else {
    addValidationExtensionsToContainerView(view, validation);
  }
  
  view.lynxUpdateValidationContentVisibility = function() {
    function updateContentTargetVisibility(constraint) {
      constraint.contentTargets.forEach(contentTarget => {
        var contentView = findNearestElement(view, "[data-lynx-name='" + contentTarget.name + "']");
        if (!contentView) return;
        var visibility = contentTarget.forState === constraint.state ? "visible" : "hidden";
        contentView.lynxSetVisibility(visibility);
      });
    }
    
    updateContentTargetVisibility(validation);
    validation.constraints.forEach(updateContentTargetVisibility);
  };
}

function findNearestElement(view, selector) {
  if (!view || view.matches("html")) return null;
  if (!selector) return null;
  return document.querySelector(selector) || findNearestElement(view.parentElement, selector);
}

export function addValidationExtensionsToContainerView(view, validation) {
  function resolveValidationStateOfDescendants() {
    var validatedViews = view.querySelectorAll("[data-lynx-validation-state]");
    var validationStates = Array.from(validatedViews)
      .map(validatedView => validatedView.getAttribute("data-lynx-validation-state"));
    return resolveValidationState(validationStates);
  }
  
  validation.state = resolveValidationStateOfDescendants();
  view.setAttribute("data-lynx-validation-state", validation.state);
  
  view.addEventListener("lynx-validation-state-change", function (evt) {
    if (evt.srcElement === view) return;
    validation.priorState = validation.state;
    validation.state = resolveValidationStateOfDescendants();
    if (validation.state === validation.priorState) return;
    view.setAttribute("data-lynx-validation-state", validation.state);
    raiseValiditionStateChangedEvent(view, validation);
    view.lynxUpdateValidationContentVisibility();
  });
}

export function addValidationExtensionsToInputView(view, validation) {
  view.setAttribute("data-lynx-validation-state", validation.state);
  
  function formatInputValue() {
    var value = view.lynxGetValue();
    if (!value || typeof value !== "string") return;
    
    var formattedConstraints = validation.constraints.filter(constraint => constraint.name === "text" && 
      constraint.state === "valid" &&
      "format" in constraint && 
      "pattern" in constraint);
    
    if (formattedConstraints.length === 0) return;
    
    var formattedConstraint = formattedConstraints[0];
    var regexp = createRegExpForTextConstraintPattern(formattedConstraint.pattern);
    var formattedValue = value.replace(regexp, formattedConstraint.format);
    
    view.lynxSetValue(formattedValue);
  }
  
  view.addEventListener("change", function () {
    var value = view.lynxGetValue();
    
    validateValue(validation, value);
    
    if (validation.state !== validation.priorState) {
      view.setAttribute("data-lynx-validation-state", validation.state);
      raiseValiditionStateChangedEvent(view, validation);
      view.lynxUpdateValidationContentVisibility();  
      formatInputValue();
    } else if (validation.changes.length > 0) {
      view.lynxUpdateValidationContentVisibility();
      formatInputValue();
    }
  });
}

export function validateValue(validation, value) {
  validation.changes = [];
  
  validation.constraints.forEach(constraint => {
    constraint.priorState = constraint.state;
    constraint.state = getValidator(constraint.name)(constraint, value);
    if (constraint.state !== constraint.priorState) validation.changes.push(constraint);
  });
  
  validation.priorState = validation.state;
  validation.state = resolveValidationState(validation.constraints.map(constraint => constraint.state));
  if (validation.state !== validation.priorState) validation.changes.push(validation);
}

function raiseValiditionStateChangedEvent(view, validation) {
  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("lynx-validation-state-change", true, false);
  changeEvent.validation = validation;
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
  
  validation.state = resolveValidationState(initialConstraintStates);
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
