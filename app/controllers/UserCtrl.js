"use strict";

app.controller("UserCtrl",  function($scope, $location, $window, AuthFactory){
	// Scope Variables
	$scope.isLoggedIn = false;
	$scope.account = {
		name: "",
		email: "",
		password: ""
	};
	$scope.header = "";
	$scope.btnText = ""; 

	// Wrote function as IIFE so that a logout
	//		occurs immediately upon load
	let logout = ( function(){
		AuthFactory.logoutUser()
		.then(function(data){
			$window.location.url = "/login";
		}, function(error){
			console.log("error occured on logout");
		});
	})();

	// Opens modal for user to login
    $scope.openLoginModal = function(){
    	// Forces first input of modal to get focus
    	$('.modal').on('shown.bs.modal', function() {
  			$(this).find('[autofocus]').focus();
		});
		// Show login modal window
        $('#loginModal').modal('show');


    };

    // Allows user to hit enter to submit login modal
    $(".login-input").keypress( function(event){
    	if(event.keyCode === 13){
    		$scope.loginUser();
	        $('#loginModal').modal('hide');
    	}
    });

    // Login in user (not using Google account)
    $scope.loginUser = function(){
    	AuthFactory.loginUser($scope.account)
    	.then( (validatedUser) => {
    		// Using $window so modal does not remain on screen
    		$window.location.href = `#!/${validatedUser.uid}`;
    	});
    };
    // Logs in user using his/her Google account
	$scope.loginGoogle = function() {
		AuthFactory.authWithProvider()
		.then(function(validatedUser) {
			console.log("ValidatedUser: ", validatedUser);

			// If user does not have a profile, make one
			AuthFactory.checkUserHasProfile(validatedUser.user.uid)
			.then( function(userExists){
				if(userExists === false){
					var newUser = {
						name: validatedUser.user.displayName,
						email: validatedUser.user.email,
						profilePicture: validatedUser.user.photoURL,
						userId: validatedUser.user.uid
					};
					AuthFactory.createUserProfile(newUser)
					.then( function(x){
						console.log("x: ", x);
			    		$window.location.href = `#!/${x.data.name}`;
					});
				}else{
					console.log("Welcome Back ", validatedUser.user.displayName);
		    		$window.location.href = `#!/${validatedUser.user.uid}`;
				}
		        $('#loginModal').modal('hide');
			});
    		$window.location.href = `#!/${validatedUser.uid}`;
	  	}).catch(function(error) {
	    	console.log("error with google login", error);
	  	});
	};
});