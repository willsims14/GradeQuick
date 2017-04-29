# MyGrades
#### Will Sims, March, 2017

### What It Does
MyGrades is an application for students. MyGrades allows a user to keeps track of the grades he or she receive in their courses and calculates GPA. The "What Do I Need" feature allows a student to calculate a grade that they need to get on an upcoming assignment (homework, exam, project, etc.) in order to get a specific grade (that the user inputs) in the course.

### Dependencies
You need a few things in order to download and run MyGrades:
1. A *Firebase* database to store user grades. Once you have created the Firebaes database and have your keys, create this file (with your own keys): app/values/fb-creds.js

    ```fb-creds.js
    "use strict";

    app.constant('FBCreds', {
        apiKey:      "XXXXXXXXXXXXXXX",
        authDomain:  "XXXXXXXXXXXXXXX",
        databaseURL: "XXXXXXXXXXXXXXX"
    }); 
    ```
2. Node Package Manager (NPM) was used to install and manage dependencies
    * ```cd lib```
    * ```npm install```
* _If you're using Bower, be sure to change the <script> tags in index.html to reflect the correct filepaths._
### Built With
* [Angular](https://docs.angularjs.org/api)
* [Bootstrap](http://getbootstrap.com/)

### Contact
* (willsims14@gmail.com "Email Me")
* [Connect w/ Me](https://www.linkedin.com/in/willsimsiii/)
* [Code w/ Me](https://github.com/willsims14 "My GitHub")
