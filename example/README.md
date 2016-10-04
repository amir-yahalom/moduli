This example shows how to use moduli, note that it contains a mixed moduli-syntax in order to show all the use-cases<br>
mixed moduli-syntax means that some of the configurations (and injections) are inline and some are in json file.<br>
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
 
