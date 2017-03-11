"use strict";

app.controller("UserCtrl",  function($scope){
	console.log("UserCtrl");

	$scope.isLoggedIn = false;
	$scope.user = {
		name: null,
		email: null,
		password: null
	};

	$scope.header = "";
	$scope.btnText = ""; 

    $scope.openLoginModal = function(){
        $('#loginModal').modal('show');
    };

    $scope.openRegisterModal = function(){
    	$scope.header = "Register";
    	$scope.btnText = "Sign Me Up";
        $('#loginModal').modal('show');
    };

});