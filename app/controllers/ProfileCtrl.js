"use strict";

/* Buttons
	* Create New Course
	* Add New Assignment
	* Enter grade for assignment
*/


app.controller("ProfileCtrl", function($scope, $routeParams, AuthFactory){
	// Get userId from URL 
	$scope.userId = $routeParams.userId;
	// Get user information to display on profile
	AuthFactory.getUserProfile($scope.userId)
	.then( function(userProfile){
		console.log("UserProfile: ", userProfile);
		// Set the returned user profile equal to $scope.account
		$scope.account = Object.values(userProfile)[0];
	});

});