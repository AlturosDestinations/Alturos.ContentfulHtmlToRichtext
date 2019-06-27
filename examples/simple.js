var parser = require("../");

let rt = parser.generateRichtText(
  `<a href='mailto:test'>We link!</a>
  <p>this a test is <a href='mailto:test'>inmtext</a> test <b>Can we do it nested?</b> </p> <h1>BIG GUY</h1>but can we do more?`
);
console.log(JSON.stringify(rt, null, 2));
