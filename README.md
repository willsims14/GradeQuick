# MyGrades
## Will Sims
#### March, 2017

### What It Does
MyGrades is an application for students. MyGrades allows a user to keeps track of the grades he or she receive in their courses and calculates GPA. The "What Do I Need" feature allows a student to calculate a grade that they need to get on an upcoming assignment (homework, exam, project, etc.) in order to get a specific grade (that the user inputs) in the course.

### Dependencies
You need a few things in order to download and run MyGrades:
* A *Firebase* database to store user grades. Once you have created the Firebaes database and have your keys, create this file (with your own keys): app/values/fb-creds.js
    ```fb-creds.js
    "use strict";

    app.constant('FBCreds', {
        apiKey: "AIzaSyCw9ZpEYg8YvdpaxHmK8QevO9j2GQdCPVc",
        authDomain: "mygrader.firebaseapp.com",
        databaseURL: "https://mygrader.firebaseio.com"
    }); 
    ```
* Node Package Manager (NPM) was used to download and manage dependencies
    * How to Download Dependencies
        - ```cd lib```
        - ```npm install```
        - 