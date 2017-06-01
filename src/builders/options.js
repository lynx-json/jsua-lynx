import * as util from "../util";

export function addOptionsExtensionsToView(inputView, spec) {
  var optionsView;
  var isContainerInput = inputView.matches("[data-lynx-hints~=container]");
  inputView.setAttribute("data-lynx-options-name", spec.options);
  
  inputView.lynxConnectOptions = function () {
    var nearestOptionsView = util.findNearestView(inputView, "[data-lynx-name='" + spec.options + "']");
    
    if (optionsView) inputView.lynxDisconnectOptions();
    if (!nearestOptionsView) return;
    
    var optionValueHint = isContainerInput ? spec.children.hints[0] : spec.hints[0];
    var optionValueViews = nearestOptionsView.querySelectorAll("[data-lynx-hints~='" + optionValueHint + "']");
    
    exports.initializeOptionsInterface(nearestOptionsView, inputView, isContainerInput);    
    
    Array.from(optionValueViews).forEach(optionValueView => {
      var optionView = exports.findOptionView(nearestOptionsView, optionValueView);
      if (!optionView) return;
      exports.initializeOptionInterface(nearestOptionsView, optionView, optionValueView, inputView);
    });
    
    function onInputViewDetach(evt) {
      if (evt.target === inputView) {
        inputView.lynxDisconnectOptions();
      }
    }
    
    inputView.lynxDisconnectOptions = function () {
      inputView.removeEventListener("jsua-detach", onInputViewDetach);
      delete inputView.lynxGetOptionsView;
      if (!optionsView) return;
      optionsView.lynxDisconnectOptions();
      optionsView = null;
    };
    
    inputView.addEventListener("jsua-detach", onInputViewDetach);
    
    optionsView = nearestOptionsView;
    
    inputView.lynxGetOptionsView = function () {
      return optionsView;
    };
    
    exports.raiseOptionsConnectedEvent(nearestOptionsView);
  };
}

export function initializeOptionsInterface(optionsView, inputView, isContainerInput) {
  optionsView.lynxOptions = [];
  
  optionsView.setAttribute("data-lynx-options-role", "options");
  
  optionsView.lynxToggleOption = function (optionView) {
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
  
  optionsView.lynxGetInputView = function () {
    return inputView;
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
    var optionViews = optionsView.lynxOptions;
    optionsView.lynxOptions.forEach(optionView => optionView.lynxDisconnectOption());
    delete optionsView.lynxOptions;
    delete optionsView.lynxToggleOption;
    delete optionsView.lynxDisconnectOptions;
    delete optionsView.lynxGetInputView;
    optionsView.removeAttribute("data-lynx-options-role");
    exports.raiseOptionsDisonnectedEvent(optionsView, optionViews);
  };
}

export function initializeOptionInterface(optionsView, optionView, optionValueView, inputView) {
  optionView.lynxSetSelected = function (selected) {
    if (selected === optionView.lynxGetSelected()) return;
    optionView.setAttribute("data-lynx-option-selected", selected);
    exports.raiseOptionSelectedChangeEvent(optionView);
  };
  
  optionView.lynxGetSelected = function () {
    var selected = optionView.getAttribute("data-lynx-option-selected");
    return "true" === selected;
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
  
  function optionClicked(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    optionsView.lynxToggleOption(optionView);
  }
  
  optionView.addEventListener("click", optionClicked);
  
  optionView.lynxDisconnectOption = function () {
    optionView.removeEventListener("click", optionClicked);
    optionView.removeAttribute("data-lynx-option-selected");
    delete optionView.lynxSetSelected;
    delete optionView.lynxGetSelected;
    if (optionView !== optionValueView) delete optionView.lynxGetValue;
    delete optionView.lynxToggleSelected;
    delete optionView.lynxDisconnectOption;
  };
  
  optionsView.lynxOptions.push(optionView);
  optionView.setAttribute("data-lynx-option-selected", false);
  optionView.lynxSetSelected( inputView.lynxHasValue( optionView.lynxGetValue() ) );
}

export function raiseOptionSelectedChangeEvent(optionView) {
  var changeEvent = document.createEvent("Event");
  
  if (optionView.lynxGetSelected()) {
    changeEvent.initEvent("lynx-option-selected", true, false);  
  } else {
    changeEvent.initEvent("lynx-option-deselected", true, false);
  }
  
  optionView.dispatchEvent(changeEvent);
}

export function raiseOptionsConnectedEvent(optionsView) {
  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("lynx-options-connected", true, false);
  optionsView.dispatchEvent(changeEvent);
}

export function raiseOptionsDisonnectedEvent(optionsView, optionViews) {
  var changeEvent = document.createEvent("Event");
  changeEvent.initEvent("lynx-options-disconnected", true, false);
  changeEvent.lynxOptions = optionViews;
  optionsView.dispatchEvent(changeEvent);
}

export function findOptionView(optionsView, optionValueView) {
  var currentView = optionValueView;
  
  do {
    if (currentView.matches("[data-lynx-option=true]")) return currentView;
    currentView = currentView.parentElement;
  } while (currentView !== optionsView);
  
  return null;
}
