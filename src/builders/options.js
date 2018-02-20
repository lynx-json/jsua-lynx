import * as util from "../util";

export function addOptionsExtensionsToView(inputView, spec) {
  var optionsView;
  var isContainerInput = inputView.matches("[data-lynx-hints~=container]");
  inputView.setAttribute("data-lynx-options-name", spec.options);
  
  inputView.lynxConnectOptions = function () {
    if (optionsView) return;
    
    var nearestOptionsView = util.findNearestView(inputView, "[data-lynx-name='" + spec.options + "']");
    if (!nearestOptionsView) return;
    
    optionsView = nearestOptionsView;
    inputView.setAttribute("data-lynx-options-connected", true);
    
    var optionValueHint = isContainerInput ? spec.children.hints[0] : spec.hints[0];
    
    function findAndInitializeOptionViews(originView, shouldRaiseOptionAddedEvent) {
      var optionValueViews = originView.querySelectorAll("[data-lynx-hints~='" + optionValueHint + "']");
      
      Array.from(optionValueViews).forEach(optionValueView => {
        var optionView = exports.findOptionView(optionsView, optionValueView);
        if (!optionView) return;
        exports.initializeOptionInterface(optionsView, optionView, optionValueView, inputView);
        if (shouldRaiseOptionAddedEvent) exports.raiseOptionAttachedEvent(optionView);
      });
    }
    
    exports.initializeOptionsInterface(optionsView, inputView, isContainerInput);
    findAndInitializeOptionViews(optionsView);
    
    function onInputViewDetach(evt) {
      if (evt.target !== inputView) return;
      inputView.lynxDisconnectOptions();
    }
    
    function onOptionsViewAttach(evt) {
      findAndInitializeOptionViews(evt.target, true);
    }
    
    inputView.lynxDisconnectOptions = function () {
      inputView.removeEventListener("jsua-detach", onInputViewDetach);
      delete inputView.lynxGetOptionsView;
      if (!optionsView) return;
      optionsView.lynxDisconnectOptions();
      optionsView.removeEventListener("jsua-attach", onOptionsViewAttach);
      optionsView = null;
    };
    
    inputView.addEventListener("jsua-detach", onInputViewDetach);
    optionsView.addEventListener("jsua-attach", onOptionsViewAttach);
    
    inputView.lynxGetOptionsView = function () {
      return optionsView;
    };
    
    exports.raiseOptionsConnectedEvent(optionsView);
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
  inputView.lynxHasValue(optionView.lynxGetValue()).then(optionView.lynxSetSelected);
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
  var connectedEvent = document.createEvent("Event");
  connectedEvent.initEvent("lynx-options-connected", true, false);
  optionsView.dispatchEvent(connectedEvent);
}

export function raiseOptionsDisonnectedEvent(optionsView, optionViews) {
  var disconnectedEvent = document.createEvent("Event");
  disconnectedEvent.initEvent("lynx-options-disconnected", true, false);
  disconnectedEvent.lynxOptions = optionViews;
  optionsView.dispatchEvent(disconnectedEvent);
}

export function raiseOptionAttachedEvent(optionView) {
  var attached = document.createEvent("Event");
  attached.initEvent("lynx-option-attached", true, false);
  optionView.dispatchEvent(attached);
}

export function findOptionView(optionsView, optionValueView) {
  var currentView = optionValueView;
  
  do {
    if (currentView.matches("[data-lynx-option=true]")) return currentView;
    currentView = currentView.parentElement;
  } while (currentView !== optionsView);
  
  return null;
}
