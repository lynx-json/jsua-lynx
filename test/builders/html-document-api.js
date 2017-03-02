global.document = {
  createElement: function (tagName) {
    return {
      setAttribute: function (attr, val) {
        this[attr] = val;
      }
    };
  }
};
