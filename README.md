# moduli
As your Node.js project gets larger, you will face some dependency issues:<br>
Where to initiate required modules/components, how to exports those modules in order to use them correctly or dealing with stubs within your tests.<br>
In Java for example, you got frameworks like Spring for handling the issues mentioned above.<br>
<p><strong>Moduli</strong> aims to tackle those issues:<br>
This library will manage your dependencies. It will let you concentrate on your app logic instead of requiring modules manually, taking care of instantiation/initialization and working hard to make your code testable.</p>
<p>
<h4><a href="https://github.com/amir-yahalom/moduli-express-example">moduli-express-example</a> - an express starter app built with moduli</h4>
</p>
<br>
<p><b>How it works?</b><br>
<ol>
<li>you configure all the desired modules & injections (very easy...)</li>
<li>moduli initializes & injects all of your dependencies</li>
<li>your app is ready to run!</li>
</ol>
</p>

Your project modules will look like this:<br>
```js
function MessageService($db, $utils, $logger, $userService) {
    this.db = $db;
    //...
}

MessageService.prototype.getAllMessages = function () {
    return this.db.messages.find();  
};

// ...

module.exports = MessageService;
```
As you can see it cleans your code - zero lines for require/resolve/initiate dependencies


Usage
-------
Install via npm:

- [npm](http://www.npmjs.com/): `npm install moduli --save`

<strong>Code samples</strong> can be found at:
<ul>
<li><a href="https://github.com/amir-yahalom/moduli-express-example">moduli-express-example</a> - an express starter app built with moduli</li>
<li>In this repo under example/ and in tests.</li>
</ul>
Besides configurations, this is the only code you will need to run your app:<br>
```js
  var moduli = require('moduli');
  // initialize moduli with configuration file (or object..)
  moduli.initInjector(__dirname, "/modules.json")
    .then(function () {
      // initialize base dependencies
      moduli.init("db", ["dummy-connection-string"]);
      //...
      // trigger app initialization
      moduli.init("app");
    });
```

Configure Modules
-------
Project modules config has the following structure
 ```js
{
  "mode": "string" // "strict" (default) | "tolerant" - if mode is strict, moduli will throw exceptions if you are trying to have a circular reference 
  "groups": {
    "GROUP_NAME": {
      "dir": "string", // optional - dir of the desired group from the root of the project (your package.json)
      "ignore": ["/IgnoredModule.js"], // optional - modules/directories to ignore within current group
      "postfix": "string", // optional - postfix for all child modules
      "prefix": "string", // optional - prefix for all child modules
      "alias": { // optional - modules renaming
        "REAL_MODULE_NAME": "DESIRED_MODULE_NAME"
      },
      "data": { // REQUIRED - module configurations to apply on all group modules
        "type": "class",
        "initiate": "multiple"
      },
      "extends": ["string"] // optional - array of groups to inherit from (only 'data' property)
    }
    // other groups 
  },
  "modules": {
    "MODULE_NAME": {
      "module": "string", // REQUIRED - path to the module from the root of the project (your package.json)
      "type": "string", // optional - "object" (default) | "function" | "class"
      "postConstructor": "string", // optional - an init method to call after require & instantiation 
      "initiate": "string", // optional - "singleton" (default) | "multiple" - if multiple, each time moduli.get() is called - a new instance will be created. relevant only for 'class'
      "injections": { // optional - injections can be defined by adding '$' before param name 
        "ARG_NAME": "MODULE_NAME"
        // other injections..
      },
      "extends": ["string"] // optional - array of groups to inherit from (only module config - 'data' property in group)
    }
    // other modules...
  },
  "npm": { // optional - use when you want moduli to resolve npm dependencies
    "MODULE_NAME": {
        // custom config for npm module
    }
  },
  "node": { // optional - use when you want moduli to resolve node core modules
      "MODULE_NAME": {
          // custom config for npm module
      }
  }
}
 ```
<h4>Groups</h4>
 Group is a way to define multiple modules (which have similar configurations) in a single json property.<br>
 By default, all group modules will inherit configurations from the group. In addition, every module can override or add configuration, using <b>inline config</b> (see below).

<h4>Modules</h4>
 Is a collection that holds all your project modules. Note that you can use Groups + inline module config instead of defining all your modules manually.

<h4>npm/node modules</h4>
 If you want moduli to resolve (inject, initiate...) npm/node modules (no require()), you need to define collection for each one.<br>
 The collection can be empty - it means that modules will be loaded with base configuration.<br>
 <strong>NOTE</strong> that if you don't specify npm/node property - npm/node modules won't be resolved by moduli.<br>
 Lets say you don't have any special configurations for your npm dependencies, your config json will look like this:<br>
  ```js
 {
   "groups": {
     // groups...
   },
   "modules": {
     // modules...
   },
   
   // An empty object - all npm depenecies can be loaded from within moduli
   "npm": {}
 }
  ```

 
<h3>moduli.initInjector(projectBasePath, modulesConfig) : promise</h3>
This method should be called before any other call to moduli.<br>
It will reset moduli config, according to the given input:
<ul>
<li><strong>projectBasePath</strong> : string - is the absolute path of the project (if called from project root -> <b>__dirname</b>)</li>
<li><strong>modulesConfig</strong> : object || string - is configurations from moduli (string if you want to load configurations from json file)</li>
</ul>

There are several types of configurations: 
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
Lets look at the following exmaple, AuthService depeneds on: db, utils and UserService instance.<br>
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


API
-------
<h3>moduli.get(sName, aArgs) : object</h3>
Returns the desired module (will be initiated on demand)<br>
<ul>
<li><strong>sName</strong> : string - is the name of the desired module (as defined in the modules configurations)</li>
<li><strong>aArgs</strong> : Array - (optional) is array of the arguments for the constructor / init function</li>
</ul>
example:<br>
 ```js
 // db module - object, reference to the db
var db = moduli.get("db");
db.findOne(query).then(function (result) {
	// User module - class (multiple) 
	var user = moduli.get("User", [result.email, result.password]);
	...
});
 ```

<h3>moduli.init(sName, aArgs) : void</h3>
Initialize the given module. It does hard init, even if the module is an object or singleton class<br>
<ul>
<li><strong>sName</strong> : string - is the name of the desired module (as defined in the modules configurations)</li>
<li><strong>aArgs</strong> : Array - (optional) is array of the arguments for the constructor / init function</li>
</ul>
example:<br>
 ```js
var db = moduli.init("db", ["my-dummy-connection-string");
 ```
 
<h3>moduli.set(sName, oInstance, oModuleData): void</h3>
Set module instnace and metadata. Useful for tests, where you want to inject your mock object.<br>
<ul>
<li><strong>sName</strong> : string - is the name of the desired module (as defined in the modules configurations)</li>
<li><strong>oInstance</strong> : Object - is the desired instance, note that it should be instantiated already</li>
<li><strong>oModuleData</strong> : Object - (optional) is the configuration for the specified module</li>
</ul>
example:<br>
 ```js
moduli.set("myModule", {a: "b", c: "d"}, {type: "object"});
 ```
 
<h3>moduli.initInjector(projectBasePath, modulesConfig) : promise</h3>
This method should be called before any other call to moduli.<br>
It will reset moduli config, according to the given input:
<ul>
<li><strong>projectBasePath</strong> : string - is the absolute path of the project (if called from project root -> <b>__dirname</b>)</li>
<li><strong>modulesConfig</strong> : object || string - is configurations from moduli (string if you want to load configurations from json file)</li>
</ul>
