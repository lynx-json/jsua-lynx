# jsua-lynx (PRELIMINARY DOCUMENTATION)
Extensions to the `jsua` package for the Lynx JSON media type.

`building.build` accepts `content` and then:
  * parses it as Lynx JSON
  * creates a `result` object `{ content, node }`
  * passes the `result` object to `builders.nodeViewBuilder`

`builders.nodeViewBuilder` accepts `result` and then:
  * finds (see `building.register`) the builder that matches the most specific hint
  * passes the `result` object to the builder
  
`building.register` registers a view builder (for a Lynx JSON node) function that accepts the following params:
  * `hint` - the hint to build views for
  * `builder` - the builder function with signature f(node) -> view || Promise<view>
  * `input` - `true` if the builder expects the node to contain an `input` specification

`building.registrations` returns the registrations added via `building.register`

## View Attributes

A view representing a Lynx JSON document may have the following attributes:

* `data-content-url` - the document's URL
* `data-content-type` - the document's content type (`application/lynx+json`)
* `data-lynx-realm` - the document's realm URI

A view representing a node of a Lynx JSON document may have the following attributes:

* `data-lynx-visibility` - the node's `visibility`
* `data-lynx-hints` - the node's `hints`
* `data-lynx-name` - the node's `name`
* `data-lynx-labeled-by` - the node's `labeledBy` property value
* `data-lynx-scope` - the node's `scope` (`container` nodes)
* `href` - the node's `href` property value (`link` nodes)
* `type` - the node's `type` property value (`link` nodes)
* `data-lynx-follow` - the node's `follow` property value (`link` nodes)
* `data-lynx-input` - the view is an input control (input nodes)
* `data-lynx-options` - the node's `options` property value (input nodes)
* `data-lynx-submitter` - the node's `submitter` property value (`form` and input nodes)
* `data-lynx-option` - the view is an option control
* `formaction` - the node's `action` property value (`submit` nodes)
* `formmethod` - the node's `method` property value (`submit` nodes)
* `formenctype` - the node's `enctype` property value (`submit` nodes)
* `data-lynx-send` - the node's `send` property value (`submit` nodes)
* `data-lynx-embedded-view` - the view for the node's `src` or `data` property value (`content` nodes)
* `alt` - the node's `alt` property value (`content` nodes)
* `title` - the node's `alt` property value (`image` nodes)
* `data-lynx-height` - the node's `height` property value (`image` nodes)
* `data-lynx-width` - the node's `width` property value (`image` nodes)
* `data-lynx-container-input-add` - the control used to add a new value to a `container` input node
* `data-lynx-container-input-value` - the view for the value of an item in the `container` input node
* `data-lynx-container-input-remove` - the control used to remove a value from a `container` input node
* `data-lynx-container-input-item` - contains the `data-lynx-container-input-value` view and its associated `data-lynx-container-input-remove` control
* `data-lynx-validation-state` - the current validation state of the view
* `data-lynx-option-selected` - the current option selected state of the view

## View Functions

A view representing a node of a Lynx JSON document may have the following methods/functions:

* `lynxGetVisibility` - gets the visibility of a view
* `lynxSetVisibility` - sets the visibility of a view
* `lynxGetValue` - gets the value of a view (text, content, text input, content input, container input, option, and option value views)
* `lynxSetValue` - sets the value of an input view
* `lynxHasValue` - tests an input view's value
* `lynxClearValue` - clears an input view's value
* `lynxAddValue` - adds a value to a container input view
* `lynxRemoveValue` - removes a value from a container input view
* `lynxConnectOptions` - connects an input view that has options with its source of options (if found)
* `lynxDisconnectOptions` - disconnects an input view from its source of options (if connected)

## View Events

A view representing a node of a Lynx JSON document may emit the following events:

* `change` - emitted when an input view's value changes
* `lynx-visibility-change` - emitted when the view's `data-lynx-visibility` value changes
* `lynx-validation-state-change` - emitted when the view's `data-lynx-validation-state` value changes. The event object will have a `validation` property whose value is an object (conforming to Lynx JSON's ["Validation Constraint Set Object"](http://lynx-json.org/specification/specifications/properties/validation/) interface) with the following additional properties:
  - `state` - the overall validation state for the view after considering the state of all constraints
  - `priorState` - the overall validation state for the view prior to the change
  - `constraints` - an array of the validation constraints (conforming Lynx JSON's "Validation Constraint Object" interface) for the view also with their own `state` and `priorState` properties
  - `changes` - an array of references to the validation constraints that have changed state
* `lynx-options-connected` - emitted when a view that provides options to an input view is connected to the input view
* `lynx-options-disconnected` - emitted when a view that provides options to an input view is disconnected from the input view
* `lynx-option-selected` - emitted when a view that provides a value to an input view is selected
* `lynx-option-deselected` - emitted when a view that provides a value to an input view is deselected
