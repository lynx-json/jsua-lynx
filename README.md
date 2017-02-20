# jsua-lynx (PRELIMINARY DOCUMENTATION)
Extensions to `jsua` for the Lynx media type.

`building.build` accepts `content` and then:
  * parses it as Lynx
  * creates a `result` object `{ content, node }`
  * passes the `result` object to `builders.nodeViewBuilder`

`builders.nodeViewBuilder` accepts `result` and then:
  * finds the builder that matches the most specific hint
  * passes the `result` object to the builder
