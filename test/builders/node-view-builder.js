require("../html-document-api");
var builders = require("../../dist/builders");
var options = require("../../dist/builders/options");
var validation = require("../../dist/builders/validation");
var resolver = require("../../dist/builders/resolve-view-builder");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");

describe("builders / nodeViewBuilder", function () {
  beforeEach(function () {
    resolveViewBuilderStub = sinon.stub(resolver, "resolveViewBuilder");
  });

  afterEach(function () {
    resolveViewBuilderStub.restore();
  });

  function runTest(node, assert) {
    var builderStub = sinon.stub();
    builderStub.returns(document.createElement("div"));

    resolveViewBuilderStub.returns(builderStub);

    return builders.nodeViewBuilder(node).then(assert).then(function () {
      builderStub.called.should.be.true;
      resolveViewBuilderStub.called.should.be.true;
    });
  }

  var resolveViewBuilderStub;

  it("should reject when no params", function () {
    return builders.nodeViewBuilder().catch(function (err) {
      expect(err).to.be.an("error");
    });
  });

  it("should reject when param doesn't have 'spec' property", function () {
    return builders.nodeViewBuilder({}).catch(function (err) {
      expect(err).to.be.an("error");
    });
  });

  it("should reject when param doesn't have 'spec.hints' property", function () {
    return builders.nodeViewBuilder({ spec: {} }).catch(function (err) {
      expect(err).to.be.an("error");
    });
  });

  it("should reject when 'spec.hints' property is empty", function () {
    return builders.nodeViewBuilder({ spec: { hints: [] } }).catch(function (err) {
      expect(err).to.be.an("error");
    });
  });

  it("should return an empty view when a view builder is not be resolved", function () {

    resolveViewBuilderStub.returns(null);

    return builders.nodeViewBuilder({ spec: { hints: ["text"] } }).then(function (view) {
      expect(view).to.be.ok;
      resolveViewBuilderStub.called.should.be.true;
    });
  });

  it("should call the resolved builder function", function () {
    var node = {
      spec: {
        name: "node1",
        visibility: "visible",
        hints: ["group", "container"],
        labeledBy: "node2"
      },
      value: {}
    };

    return runTest(node, function (view) {
      expect(view).to.not.equal(null);
      view.getAttribute("data-lynx-hints").should.equal(node.spec.hints.join(" "));
      view.getAttribute("data-lynx-name").should.equal(node.spec.name);
      view.getAttribute("data-lynx-labeled-by").should.equal(node.spec.labeledBy);
    });
  });

  it("should add visibility accessors and publish change events", function () {
    var node = {
      spec: {
        visibility: "visible",
        hints: ["container"]
      },
      value: {}
    };

    return runTest(node, function (view) {
      expect(view).to.not.equal(null);
      expect(view.lynxGetVisibility).to.not.equal(null);
      expect(view.lynxSetVisibility).to.not.equal(null);
      view.getAttribute("data-lynx-visibility").should.equal("visible");
      view.lynxGetVisibility().should.equal("visible");

      return new Promise(function (resolve) {
        view.addEventListener("lynx-visibility-change", function () {
          view.lynxGetVisibility().should.equal("hidden");
          resolve();
        });

        view.lynxSetVisibility("hidden");
      });
    });
  });

  describe("nodes with visibility of `concealed` or `revealed`", function () {
    var node;

    beforeEach(function () {
      node = {
        spec: {
          visibility: "concealed",
          hints: ["container"]
        },
        value: {}
      };
    });

    it("should add concealment controls when visibility is `concealed`", function () {
      return runTest(node, function (view) {
        expect(view).to.not.equal(null);
        expect(view.lynxGetConcealView).to.not.equal(null);
        expect(view.lynxSetConcealView).to.not.equal(null);
        expect(view.lynxGetRevealView).to.not.equal(null);
        expect(view.lynxSetRevealView).to.not.equal(null);
        expect(view.querySelector("[data-lynx-visibility-conceal]")).to.not.equal(null);
      });
    });

    it("should add concealment controls when visibility is `revealed`", function () {
      node.spec.visibility = "revealed";

      return runTest(node, function (view) {
        expect(view).to.not.equal(null);
        expect(view.lynxGetConcealView).to.not.equal(null);
        expect(view.lynxSetConcealView).to.not.equal(null);
        expect(view.lynxGetRevealView).to.not.equal(null);
        expect(view.lynxSetRevealView).to.not.equal(null);
        expect(view.querySelector("[data-lynx-visibility-conceal]")).to.not.equal(null);
      });
    });

    it("concealment control should change visibility from `concealed` to `revealed` when clicked", function () {
      return runTest(node, function (view) {
        return new Promise(function (resolve) {
          view.addEventListener("lynx-visibility-change", function () {
            view.lynxGetVisibility().should.equal("revealed");
            resolve();
          });

          var concealmentControl = view.querySelector("[data-lynx-visibility-conceal]");
          concealmentControl.click();
        });
      });
    });

    it("concealment control should change visibility from `revealed` to `concealed` when clicked", function () {
      node.spec.visibility = "revealed";

      return runTest(node, function (view) {
        return new Promise(function (resolve) {
          view.addEventListener("lynx-visibility-change", function () {
            view.lynxGetVisibility().should.equal("concealed");
            resolve();
          });

          var concealmentControl = view.querySelector("[data-lynx-visibility-conceal]");
          concealmentControl.click();
        });
      });
    });

    it("`lynxSetRevealView` should change the content of the concealment control", function () {
      return runTest(node, function (view) {
        var newRevealView = document.createElement("span");
        newRevealView.textContent = "🔽";
        view.lynxSetRevealView(newRevealView);
        expect(view.lynxGetRevealView()).to.equal(newRevealView);

        var concealmentControl = view.querySelector("[data-lynx-visibility-conceal]");
        expect(concealmentControl.compareDocumentPosition(newRevealView) & Node.DOCUMENT_POSITION_CONTAINED_BY).to.equal(Node.DOCUMENT_POSITION_CONTAINED_BY);
      });
    });

    it("`lynxSetConcealView` should change the content of the concealment control", function () {
      node.spec.visibility = "revealed";

      return runTest(node, function (view) {
        var newConcealView = document.createElement("span");
        newConcealView.textContent = "🔼";
        view.lynxSetConcealView(newConcealView);
        expect(view.lynxGetConcealView()).to.equal(newConcealView);

        var concealmentControl = view.querySelector("[data-lynx-visibility-conceal]");

        var position = concealmentControl.compareDocumentPosition(newConcealView);
        position = position & Node.DOCUMENT_POSITION_CONTAINED_BY;
        expect(position).to.equal(Node.DOCUMENT_POSITION_CONTAINED_BY);
      });
    });

    it("setting `visible` should remove the concealment control", function () {
      return runTest(node, function (view) {
        view.lynxSetVisibility("visible");
        var concealmentControl = view.querySelector("[data-lynx-visibility-conceal]");
        expect(concealmentControl).to.equal(null);
      });
    });

    it("setting `hidden` should remove the concealment control", function () {
      return runTest(node, function (view) {
        view.lynxSetVisibility("hidden");
        var concealmentControl = view.querySelector("[data-lynx-visibility-conceal]");
        expect(concealmentControl).to.equal(null);
      });
    });
  });

  it("should set attribute 'data-lynx-option'", function () {
    var node = {
      spec: {
        hints: ["group", "container"],
        option: true
      },
      value: {}
    };

    return runTest(node, function (view) {
      expect(view).to.not.equal(null);
      view.getAttribute("data-lynx-option").should.equal("true");
    });
  });

  it("should set attribute 'data-lynx-input' equal spec.input when spec.input is string", function () {
    var node = {
      spec: {
        name: "node1",
        hints: ["text"],
        input: "foo"
      },
      value: ""
    };

    return runTest(node, function (view) {
      expect(view).to.not.equal(null);
      view.getAttribute("data-lynx-input").should.equal("foo");
    });
  });

  it("should set attribute 'data-lynx-input' equal spec.name when spec.input === true", function () {
    var node = {
      spec: {
        name: "node1",
        hints: ["text"],
        input: true
      },
      value: ""
    };

    return runTest(node, function (view) {
      expect(view).to.not.equal(null);
      view.getAttribute("data-lynx-input").should.equal("node1");
    });
  });

  it("should add options extensions to view", function () {
    var node = {
      spec: {
        name: "node1",
        hints: ["text"],
        input: true,
        options: "node2"
      },
      value: ""
    };

    sinon.stub(options, "addOptionsExtensionsToView");

    return runTest(node, function (view) {
      expect(view).to.not.be.null;
      options.addOptionsExtensionsToView.calledOnce.should.equal(true);
      options.addOptionsExtensionsToView.restore();
    });
  });

  it("should add validation extensions to view", function () {
    var node = {
      spec: {
        name: "node1",
        hints: ["text"],
        input: true,
        validation: {
          required: {
            invalid: "propertyRef"
          }
        }
      },
      value: ""
    };

    sinon.stub(validation, "addValidationExtensionsToView");

    return runTest(node, function (view) {
      expect(view).to.not.equal(null);
      validation.addValidationExtensionsToView.calledOnce.should.equal(true);
      validation.addValidationExtensionsToView.restore();
    });
  });

  it("should add validation extensions to view for forms", function () {
    var node = {
      spec: {
        name: "node1",
        hints: ["form"],
      },
      value: {}
    };

    var addValidationExtensionsToViewStub = sinon.stub(validation, "addValidationExtensionsToView");

    return runTest(node, function (view) {
      addValidationExtensionsToViewStub.restore();
      expect(view).to.not.equal(null);
      addValidationExtensionsToViewStub.calledOnce.should.equal(true);
    });
  });

  it("should set attribute 'data-lynx-submitter'", function () {
    var node = {
      spec: {
        name: "node1",
        hints: ["text"],
        submitter: "node2"
      },
      value: {}
    };

    return runTest(node, function (view) {
      expect(view).to.not.equal(null);
      view.getAttribute("data-lynx-submitter").should.equal(node.spec.submitter);
    });
  });

  it("should set `data-lynx-var-*` attributes for data properties", function () {
    var node = {
      spec: {
        hints: ["container"]
      },
      value: {
        scheduled: true
      }
    };

    return runTest(node, function (view) {
      expect(view).to.not.equal(null);
      view.getAttribute("data-lynx-var-scheduled").should.equal("true");
    });
  });

  it("should not set `data-lynx-var-*` attributes for children of an array", function () {
    var node = {
      spec: {
        hints: ["container"]
      },
      value: [
        0, 1, 2
      ]
    };

    return runTest(node, function (view) {
      expect(view).to.not.equal(null);
      should.not.exist(view.getAttribute("data-lynx-var-0"));
    });
  });

  it("should not set `data-lynx-var-*` attributes for characters in a string", function () {
    var node = {
      spec: {
        hints: ["text"]
      },
      value: "abc"
    };

    return runTest(node, function (view) {
      expect(view).to.not.equal(null);
      should.not.exist(view.getAttribute("data-lynx-var-0"));
    });
  });

  it("should set resolved for attribute for markers", function () {
    var node = {
      base: 'http://example.com/',
      spec: {
        hints: ['marker', 'container']
      },
      value: {
        for: '/foo'
      }
    };

    return runTest(node, function (view) {
      expect(view).to.not.equal(null);
      expect('http://example.com/foo').to.equal(view.getAttribute('data-lynx-marker-for'));
    });
  });
});
