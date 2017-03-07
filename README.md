# jsua-lynx (PRELIMINARY DOCUMENTATION)
Extensions to the `jsua` package for the Lynx media type.

`building.build` accepts `content` and then:
  * parses it as Lynx
  * creates a `result` object `{ content, node }`
  * passes the `result` object to `builders.nodeViewBuilder`

`builders.nodeViewBuilder` accepts `result` and then:
  * finds (see `building.register`) the builder that matches the most specific hint
  * passes the `result` object to the builder
  
`building.register` registers a view builder (for a Lynx node) function that accepts the following params:
  * `hint` - the hint to build views for
  * `builder` - the builder function with signature f(node) -> view || Promise<view>
  * `input` - `true` if the builder expects the node to contain an `input` specification

`building.registrations` returns the registrations added via `building.register`

## View Attributes

A view representing a Lynx document may have the following attributes:

* `data-content-url` - the document's URL
* `data-content-type` - the document's content type (`application/lynx+json`)
* `data-lynx-realm` - the document's realm URI

A view representing a node of a Lynx document may have the following attributes:

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
