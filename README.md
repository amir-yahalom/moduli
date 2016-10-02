# moduli
IoC container for Node JS.


Usage
-------
First, install via npm:

- [npm](http://www.npmjs.com/): `npm install moduli --save`

simple example:
```js
  var moduli = require('moduli');
  // initialize moduli with configuration file (or object..)
  moduli.initInjector(__dirname, "/modules.json");
  // trigger app initialization
  moduli.init("app");
```