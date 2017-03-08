global.document = {
  createElement: function (tagName) {
    var element = {
      setAttribute: function (attr, val) {
        element[attr] = val;
      },
      children: [],
      appendChild: function (child) {
        element.children.push(child);
      },
      addEventListener: function () {
      }
    };
    
    return element;
  }
};
