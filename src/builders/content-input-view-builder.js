export function contentInputViewBuilder(node) {
  var view = document.createElement("input");
  view.type = "file";
  view.name = node.spec.input.name || "";
  
  var value = null;
  
  view.getValue = function () {
    return value;
  };
  
  view.setValue = function (val) {
    value = val;
  };
  
  view.addEventListener("change", function (evt) {
    value = view.files[0];
  });
  
  if (node.value) {
    var buf = new Buffer(node.value.data, node.value.encoding || "utf8");
    value = new File([buf], "", { type: node.value.type });
  }
  
  return view;
}
