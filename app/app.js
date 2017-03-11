"use strict";

console.log("MAIN");

var app = angular.module("MyApp", ['ngRoute', 'ui.bootstrap']);


app.config(function($routeProvider){
    $routeProvider.
    when('/', {
        controller: 'UserCtrl'
    }).
    when('/profile', {
    	templateUrl: 'partials/profile.html',
    	controller: 'UserCtrl'
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