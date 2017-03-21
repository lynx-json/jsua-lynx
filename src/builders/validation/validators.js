export function noopValidator() {
  return "unknown";
}

export function requiredValidator(constraint, value) {
  var valid = !(value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0));
  return valid ? "valid" : "invalid";
}

export function textValidator(constraint, value) {
  var empty = (value === undefined || value === null || value === "");
  
  if (empty) {
    return "valid";
  }

  if (constraint.minLength && (value.length < constraint.minLength)) {
    return "invalid";
  }

  if (constraint.maxLength && (value.length > constraint.maxLength)) {
    return "invalid";
  }

  if (constraint.pattern) {
    var pattern = constraint.pattern;
    if (pattern.substring(0, 1) !== "^") pattern = "^" + pattern;
    if (pattern.substring(pattern.length - 1, 1) !== "$") pattern += "$";
    if (new RegExp(pattern).test(value) === false) {
      return "invalid";
    }
  }
  
  return "valid";
}

export function numberValidator(constraint, value) {
  var empty = (value === undefined || value === null || value === "");
  
  if (empty) {
    return "valid";
  }

  if(isNaN(+value)){
    return "invalid";
  }

  if (constraint.min && (value < Number(constraint.min))) {
    return "invalid";
  }

  if (constraint.max && (value > Number(constraint.max))) {
    return "invalid";
  }

  if (constraint.step && (value % Number(constraint.step) !== 0)) {
    return "invalid";
  }
  
  return "valid";
}

export function typeMatchesTypeRange(actualType, expectedTypeRange) {
  expectedTypeRange = expectedTypeRange.split(";")[0].split("/");
  actualType = actualType.split(";")[0].split("/");
  if (expectedTypeRange[0] !== "*" && (expectedTypeRange[0] !== actualType[0])) return false;
  if (expectedTypeRange[1] !== "*" && (expectedTypeRange[1] !== actualType[1])) return false;
  return true;
}

export function contentValidator(constraint, value) {
  var empty = (value === null || value.length === 0);
  
  if (empty) {
    return "valid";
  }
  
  if (constraint.type) {
    var expectedTypeRanges = constraint.type;
    
    if (!Array.isArray(expectedTypeRanges)) {
      expectedTypeRanges = [ expectedTypeRanges ];
    }
    
    var matchesTypeRange = typeMatchesTypeRange.bind(null, value.type);
    
    if (!expectedTypeRanges.some(matchesTypeRange)) return "invalid";
  }
  
  if (constraint.maxLength && value.length > constraint.maxLength) {
    return "invalid";
  }
  
  return "valid";
}
