# moduli
IoC container for Node JS.<br>
This library will manage your dependencies. It will let you concentrate on your app logic instead of requiring modules manually, taking care of instantiation/initialization and working hard to make your code testable.<br>
<p><b>How it works?</b><br>
<ol>
<li>you configure all the desired modules & injections (very easy...)</li>
<li>moduli initializes & injects all the dependencies</li>
<li>your app is ready to run!</li>
</ol>
</p>


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

Configure Modules
-------
modules config has the following structure
 ```js
{
  "mode": "string" // "strict" (default) | "tolerant" - if mode is strict, moduli will throw exceptions if you are trying to have a circular reference 
  "modules": {
    "MODULE_NAME": {
      "module": "string", // REQUIRED - path to the module from the root of the project (your package.json),
      "type": "string", // optional - "object" (default) | "function" | "class"
      "postConstructor": "string", // optional - an init method to call after require & instantiation 
      "initiate": "string", // optional - "singleton" (default) | "multiple" - if multiple, each time moduli.get() is called - a new instance will be created. relevant only for 'class'
      "injections": { // optional - injections can be defined by adding '$' before param name 
        "ARG_NAME": "MODULE_NAME"
        // ... other injections
      }
    }
  }
}
 ```

<b>moduli</b> supports several types of configurations: 
 * inline <br>
 ```js
   // your module
   // ... 
   module.export["@moduli"] = {
    // configurations..
   };
 ```
 
 * json file <br>
 ```js
   {
    "mode": ".."
    "modules": {
      // ...
    }
   }
 ```
 
 * js object <br>
 ```js
   var config = {
    "mode": ".."
    "modules": {
      // ...
    }
   }
   moduli.initInjector(__dirname, config);
 ```

Note that: 
* all modules names should be defined in the configuration object. 
* specific configurations can be defined inline.
* inline config will override json/object config.
