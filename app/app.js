"use strict";

console.log("MAIN");

var app = angular.module("MyApp", ['ngRoute']);

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