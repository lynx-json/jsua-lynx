import { noopValidator, requiredValidator, textValidator, numberValidator, contentValidator } from "./validators";

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
}

export function addValidationExtensionsToContainerView(view, validation) {
  view.addEventListener("lynx-validation-state-change", function (evt) {
    if (evt.srcElement === view) return;
    validation.priorState = validation.state;
    validation.state = resolveValidationState([validation.state, evt.validation.state]);
    if (validation.state === validation.priorState) return;
    view.setAttribute("data-lynx-validation-state", validation.state);
    raiseValiditionStateChangedEvent(view, validation);
  });
}

export function addValidationExtensionsToInputView(view, validation) {
  view.addEventListener("change", function () {
    var value = view.getValue();
    validateValue(validation, value);
    if (validation.state === validation.priorState) return;
    view.setAttribute("data-lynx-validation-state", validation.state);
    raiseValiditionStateChangedEvent(view, validation);
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
  
  Object.getOwnPropertyNames(validation).forEach(propertyName => {
    if (isValidationConstraintName(propertyName) === false) return;
    
    var constraints = validation[propertyName];
    if (!Array.isArray(constraints)) constraints = [ constraints ];
    
    constraints.forEach(constraint => {
      constraint.name = propertyName;
      constraint.state = constraint.state || "unknown";
      constraint.priorState = "";
      initialConstraintStates.push(constraint.state);
      initialConstraints.push(constraint);
    });
  });
  
  validation.state = resolveValidationState(initialConstraintStates);
  validation.priorState = "";
  validation.constraints = initialConstraints;
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
