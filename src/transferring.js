export function transfer(request) {
  if (!request.options.document) throw new Error("The 'request.options.document' param must have a value of a parsed Lynx JSON document.");
  request.blob = new Blob([], { type: "application/vnd.lynx-json.document" });
  return Promise.resolve(request);
}
