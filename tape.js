var smokestack = require('smokestack');
var test = require("tape");

document.body.innerHTML = "Hello, Smokestack";

test('A passing test', (assert) => {

  assert.pass('This test will pass.');

  assert.end();
});
 
// smokestack.capture('screenshots/0001.png', function(err) {
//   if (err) throw err;
//   window.close();
// });

// describe("a foo", function () {
//   it("should bar", function () {
//     var el = document.createElement("div");
//     el.textContent = "Tested";
//     document.body.appendChild(el);
//   });
// });
