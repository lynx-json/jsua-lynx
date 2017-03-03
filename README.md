# jsua-lynx (PRELIMINARY DOCUMENTATION)
Extensions to `jsua` for the Lynx media type.

`building.build` accepts `content` and then:
  * parses it as Lynx
  * creates a `result` object `{ content, node }`
  * passes the `result` object to `builders.nodeViewBuilder`

`builders.nodeViewBuilder` accepts `result` and then:
  * finds the builder that matches the most specific hint
  * passes the `result` object to the builder

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
* `data-lynx-follow` - the node's `follow` property value (`link` nodes)
* `data-lynx-input` - the view is an input control
* `data-lynx-options` - the node's `options` property value (input nodes)
* `data-lynx-option` - the view is an option control
