import * as util from "../util";

export function addOptionsExtensionsToView(inputView, spec) {
  var optionsView;
  var isContainerInput = inputView.matches("[data-lynx-hints~=container]");
  
  inputView.lynxConnectOptions = function () {
    var nearestOptionsView = util.findNearestElement(inputView, "[data-lynx-name='" + spec.options + "']");
    
    if (optionsView && optionsView === nearestOptionsView) return;
    if (optionsView) inputView.lynxDisconnectOptions();
    if (!nearestOptionsView) return;
    
    var optionValueHint = isContainerInput ? spec.children.hints[0] : spec.hints[0];
    var optionValueViews = nearestOptionsView.querySelectorAll("[data-lynx-hints~='" + optionValueHint + "']");
    
    exports.initializeOptionsInterface(nearestOptionsView, inputView, isContainerInput);    
    Array.from(optionValueViews).forEach(optionValueView => {
      var optionView = exports.findOptionView(optionValueView);
      if (!optionView) return;
      exports.initializeOptionInterface(nearestOptionsView, optionView, optionValueView, inputView);
    });
    
    optionsView = nearestOptionsView;
  };
  
  inputView.lynxDisconnectOptions = function () {
    if (!optionsView) return;
    optionsView.lynxDisconnectOptions();
    optionsView = null;
  };
}

export function initializeOptionsInterface(optionsView, inputView, isContainerInput) {
  optionsView.lynxOptions = [];
  
  optionsView.lynxSelectOption = function (optionView) {
    if (isContainerInput) {
      optionView.lynxToggleSelected();
      if (optionView.lynxGetSelected()) {
        inputView.lynxAddValue(optionView.lynxGetValue());
      } else {
        inputView.lynxRemoveValue(optionView.lynxGetValue());
      }
    } else {
      let selectedOptionView = optionsView.querySelector("[data-lynx-option-selected=true]");
      
      optionView.lynxToggleSelected();
      if (selectedOptionView && selectedOptionView !== optionView) selectedOptionView.lynxToggleSelected();
      
      if (optionView.lynxGetSelected()) {
        inputView.lynxSetValue( optionView.lynxGetValue() );
      } else {
        inputView.lynxClearValue();
      }
    }
  };
  
  function inputChanged() {
    var values = inputView.lynxGetValue();
    if (!Array.isArray(values)) values = [values];
    optionsView.lynxOptions.forEach(optionView => {
      var selected = values.indexOf(optionView.lynxGetValue()) > -1;
      optionView.lynxSetSelected(selected);
    });
  }
  
  inputView.addEventListener("change", inputChanged);
  
  optionsView.lynxDisconnectOptions = function () {
    inputView.removeEventListener("change", inputChanged);
    optionsView.lynxOptions.forEach(optionView => optionView.lynxDisconnectOption());
    delete optionsView.lynxOptions;
    delete optionsView.lynxSelectOption;
    exports.raiseOptionsDisonnectedEvent(optionsView);
  };
  
  exports.raiseOptionsConnectedEvent(optionsView);
}

export function initializeOptionInterface(optionsView, optionView, optionValueView, inputView) {
  optionView.lynxSetSelected = function (selected) {
    var currentState = optionView.lynxGetSelected();
    if (currentState === selected) return;
    optionView.setAttribute("data-lynx-option-selected", selected);
    exports.raiseOptionSelectedChangeEvent(optionView);
  };
  
  optionView.lynxGetSelected = function () {
    var selected = optionView.getAttribute("data-lynx-option-selected");
    if (!selected) return false;
    return JSON.parse(selected);
  };
  
  if (optionView !== optionValueView) {
    optionView.lynxGetValue = function () {
      return optionValueView.lynxGetValue();
    };
  }
  
  optionView.lynxToggleSelected = function () {
    if (optionView.lynxGetSelected()) {
      optionView.lynxSetSelected(false);
    } else {
      optionView.lynxSetSelected(true);
    }
  };
  
  function optionClicked() {
    optionsView.lynxSelectOption(optionView);
  }
  
  optionView.addEventListener("click", optionClicked);
  
  optionView.lynxDisconnectOption = function () {
    optionView.removeEventListener("click", optionClicked);
    optionView.removeAttribute("data-lynx-option-selected");
    delete optionView.lynxSetSelected;
    delete optionView.lynxGetSelected;
    if (optionView !== optionValueView) delete optionView.lynxGetValue;
    delete optionView.lynxToggleSelected;
  };
  
  optionsView.lynxOptions.push(optionView);
  optionView.setAttribute("data-lynx-option-selected", false);
  optionView.lynxSetSelected( inputView.lynxHasValue( optionView.lynxGetValue() ) );
}

export function raiseOptionSelectedChangeEvent(optionView) {
  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("lynx-option-selected-change", true, false);
  optionView.dispatchEvent(changeEvent);
}

export function raiseOptionsConnectedEvent(optionsView) {
  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("lynx-options-connected", true, false);
  optionsView.dispatchEvent(changeEvent);
}

export function raiseOptionsDisonnectedEvent(optionsView) {
  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("lynx-options-disconnected", true, false);
  optionsView.dispatchEvent(changeEvent);
}

export function findOptionView(optionValueView) {
  var optionView = null, currentView = optionValueView;
  
  while (optionView === null && currentView !== null) {
    if (currentView.matches("[data-lynx-option=true]")) optionView = currentView;
    currentView = currentView.parentElement;
  }
  
  return optionView;
}
