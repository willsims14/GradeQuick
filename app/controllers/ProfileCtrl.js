"use strict";

/* Buttons
	* Create New Course
	* Add New Assignment
	* Enter grade for assignment
*/


app.controller("ProfileCtrl", function($scope, $routeParams, AuthFactory){
	// Get userId from URL 
	var myParams = $routeParams;
	$scope.userId = myParams.userId;

	console.log("PROFILE CTRL");

	// Get user information to display on profile
	AuthFactory.getUserProfile($scope.userId)
	.then( function(userProfile){
		console.log("PROFILE: ", userProfile);
		// Set the returned user profile equal to $scope.account
		$scope.account = Object.values(userProfile)[0];
	});


	



});