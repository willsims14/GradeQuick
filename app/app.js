"use strict";

var app = angular.module("MyApp", ['ngRoute', 'ui.bootstrap']);

let isAuth = (AuthFactory) => new Promise ( (resolve, reject) => {
    AuthFactory.isAuthenticated()
    .then ( (userExists) => {
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
        controller: 'UserCtrl',
        templateUrl: 'partials/splash_page.html'
    }).
    when('/:userId', {
    	templateUrl: 'partials/profile.html',
    	controller: 'ProfileCtrl',
        resolve:{isAuth}
    }).
    when('/courses/:courseId', {
        templateUrl: 'partials/single_course_view.html',
        controller: 'SingleCourseCtrl',
        resolve: {isAuth}
    }).
    when('/settings/:courseId', {
        templateUrl: 'partials/settings.html',
        controller: 'SettingsCtrl'
    }).
    when('/:userId/whatif', {
        templateUrl: 'partials/WhatDoINeed.html',
        controller: 'WhatDoINeedCtrl',
        resolve:{isAuth}
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