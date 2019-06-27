# HTML to Contentful RichText

[![NPM version](https://img.shields.io/npm/v/contentful-html-to-richtext.svg?style=flat)](https://npmjs.org/package/contentful-html-to-richtext)

## Installation

```
npm i contentful-html-to-richtext -s
```
## Usage

This package exposes one simple method called `generateRichText`:

```javascipt
var parser = require("../");

let rt = parser.generateRichText(
  `<a href='mailto:test'>We link!</a>
  <p>this a test is <a href='mailto:test'>inmtext</a> test <b>Can we do it nested?</b> </p> <h1>BIG GUY</h1>but can we do more?`
);
console.log(JSON.stringify(rt, null, 2));
```

This should produce (if published to Contentful with `contentful-management`):
![alt text](/images/sample_output.png "sample")
