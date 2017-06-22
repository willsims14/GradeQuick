"use strict";

app.controller("UserCtrl",  function($scope, $location, $window, $routeParams, AuthFactory, GradeStorage){
	// Scope Variables
	$scope.isLoggedIn = false;
	$scope.account = {
		name: "",
		email: "",
		password: "",
		userId: ""
	};
	$scope.header = "";
	$scope.btnText = ""; 
	$scope.emailAlreadyUsed = false;
	$scope.profileActive = true;

	let myParams = $routeParams;
	$scope.userID = myParams.userId;




	var user = AuthFactory.getUser();




	// When user logs in/out, change isLoggedIn value
	firebase.auth().onAuthStateChanged( function(user){
		firebase.auth().onAuthStateChanged( function(user){
			if(user){
				$scope.user = user.uid;
				$scope.isLoggedIn = true;
			}else{
				$scope.isLoggedIn = false;
			}
		});
	});

	$scope.$on('$routeChangeStart', function(next, current) {
		if($scope.user){
			setTimeout( function(){
				GradeStorage.getUserCourses()
				.then( function(userCourses){
					AuthFactory.getUserProfile($scope.user)
					.then( function(profile){
						let myCurrentSemester = Object.values(profile)[0].currentSemester;
						let myNavCourses = [];
						
						for(var i = 0; i < userCourses.length; i++){
							if(userCourses[i].semester === myCurrentSemester){
								myNavCourses.push(userCourses[i]);
							}
						}
						$scope.navCourses = myNavCourses;

					});


				});
			}, 1000);
		}
	});

	let logout = ( function(){
		AuthFactory.logoutUser()
		.then(function(data){
			// $window.location.href = "#!/login";
		}, function(error){
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

    $scope.openRegisterModal = function(){
    	// Forces first input of modal to get focus
    	$('.modal').on('shown.bs.modal', function() {
  			$(this).find('[autofocus]').focus();
		});
		// Show login modal window
        $('#registerModal').modal('show');
    };

    $scope.openGoogleRegisterModal = function(){
    	// Forces first input of modal to get focus
    	$('.modal').on('shown.bs.modal', function() {
  			$(this).find('[autofocus]').focus();
		});
		// Show login modal window
        $('#googleRegisterModal').modal('show');
    };

    

    // // Allows user to hit enter to submit login modal
    // $(".login-input").keypress( function(event){
    // 	if(event.keyCode === 13){
    // 		$scope.loginUser();
	   //      $('#loginModal').modal('hide');
    // 	}
    // });

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
        $('#loginModal').modal('hide');
		AuthFactory.authWithProvider()
		.then(function(validatedUser) {
			$scope.account.userId = validatedUser.user.uid;
			$scope.user = validatedUser.user.uid;


			// If user does not have a profile, make one
			AuthFactory.checkUserHasProfile(validatedUser.user.uid)
			.then( function(userExists){
				if(userExists === false){
					// $scope.openGoogleRegisterModal();
					var newUser = {
						name: validatedUser.user.displayName,
						email: validatedUser.user.email,
						profilePicture: validatedUser.user.photoURL,
						userId: AuthFactory.getUser()
					};

					AuthFactory.createUserProfile(newUser)
					.then( function(){
			    		$window.location.href = `#!/${newUser.userId}`;
					});
				}else{
		    		$window.location.href = `#!/${validatedUser.user.uid}`;
				}
			});
	  	}).catch(function(error) {
	  	});
	};
	

	$scope.registerNewUser = () => {
  		$scope.emailAlreadyUsed = false;
		var newUser = {
	      email: $scope.account.email,
	      password: $scope.account.password,
	      name: $scope.account.name,
	      school: $scope.account.school,
	      currentSemester: "Fall-2017",
	      userId: null
	    };

	    // Create register new authenticated user
	    AuthFactory.createUser(newUser)
	    .then( (userData) => {
	      	if(userData.code === "auth/email-already-in-use"){
	      		$scope.emailAlreadyUsed = true;
	      		$scope.$apply();
	      		return;
	    	}else{
	    		// Create new user PROFILE
	    		newUser.userId = userData.uid;
				AuthFactory.createUserProfile(newUser)
				.then( function(newUser){
		    		$window.location.href = `#!/${newUser.data.name}`;
		      		$('#registerModal').modal('hide');
		      		$scope.loginUser();
				});
	  	}
	    }, (error) => {
	    })
	    .catch( function(error){
	    });
  	};


});