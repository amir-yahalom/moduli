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

You can find an example in this repo under example/<br>
Besides configurations, this is the only code you will need to run your app:<br>
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
        // other injections..
      }
    }
    // other modules...
  }
}
 ```

<b>moduli</b> supports several types of configurations: 
 * <b>inline</b> <br>
 ```js
 // your module
 // ... 
 module.export["@moduli"] = {
  // configurations..
 };
 ```
 
 * <b>json file</b> <br>
 modules.json:<br>
 ```js
  {
    "mode": ".."
    "modules": {
      // ...
    }
  }
 ```
 main.js:<br>
 ```js
var moduli = require('moduli');
// initialize moduli with configuration file (or object..)
moduli.initInjector(__dirname, "/modules.json");
//....
 ```
 
 * <b>js object</b> <br>
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


Dependency Injection
-------
Lets look at the following exmaple (can be found in this repo codeline):<br>
<b>Project structure</b><br>
 ```
/example/
	entity/
		User.js (User - class, multiple)
	service/
		auth.js (AuthService - class, singleton)
		user.js (UserService - class, singleton)
	app.js (object)
	db.js (object)
	utils.js (object)
	main.js
	modules.json
 ```
for example, AuthService depeneds on: db, utils and UserService instance.<br>
with moduli it can be achived by simply declaring those modules as injections for AuthService:<br>
 ```js
function AuthService(secret, mydb, utils, userService) {
    // ...
}

// ....
module.exports = AuthService;
// NOTE that this can be written in the config json:
module.export["@moduli"] = {
 	injections: {
 		"mydb": "db",
 		"utils": "utils",
 		"userService": "userService"
 	}
};
 ```
it can be achived also be using '$' before arg name (the arg name without the '$' must match the desired module name):
 ```js
function AuthService(secret, $db, $utils, $userService) {
    // ...
}

// ....
module.exports = AuthService;
 ```
