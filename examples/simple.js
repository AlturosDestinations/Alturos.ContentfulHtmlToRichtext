const parser = require("../");

let rt = parser.generateRichText(
  `<a href='mailto:test'>We link!</a>
  <p>this a test is <a href='mailto:test'>inmtext</a> test <b>Can we do it nested? <i>And nested styles?</i></b> </p> <h1>BIG GUY</h1>but can we do more?
  <ol>
  <li><h1>Major one:</h1>eins</li>
  <li>zwei</li>
  </ol>
  
  `
);
console.log(JSON.stringify(rt, null, 2));
