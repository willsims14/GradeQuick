"use strict";

var app = angular.module("MyApp", ['ngRoute', 'ui.bootstrap']);

let isAuth = (AuthFactory) => new Promise ( (resolve, reject) => {
    AuthFactory.isAuthenticated()
    .then ( (userExists) => {
    console.log("userExists", userExists);
        if (userExists){
            resolve();
        }else {
            reject();
        }
    });
});

app.config(function($routeProvider){
    $routeProvider.
    when('/', {
        controller: 'UserCtrl'
    }).
    when('/:userId', {
    	templateUrl: 'partials/profile.html',
    	controller: 'ProfileCtrl',
        resolve:{isAuth}
    }).
    when('/register', {
    	templateUrl: 'partials/register.html',
    	controller: 'UserCtrl'
    }).
    otherwise('/');
});

app.run(($location, FBCreds) => {
	console.log("App.run");
    let creds = FBCreds;
    let authConfig = {
        apiKey: creds.apiKey,
        authDomain: creds.authDomain,
        databaseURL: creds.databaseURL
    };
    firebase.initializeApp(authConfig);
});