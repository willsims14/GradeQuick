"use strict";

/* Buttons
	* Create New Course
	* Add New Assignment
	* Enter grade for assignment
*/


app.controller("ProfileCtrl", function($scope, $routeParams, AuthFactory, GradeStorage){
	// Get userId from URL 
	var myParams = $routeParams;
	$scope.userId = myParams.userId;
	$scope.course = {};


	// Get user information to display on profile
	AuthFactory.getUserProfile($scope.userId)
	.then( function(userProfile){
		// Set the returned user profile equal to $scope.account
		$scope.account = Object.values(userProfile)[0];
	});

	GradeStorage.getUserCourses()
	.then( function(courses){
		$scope.courses = courses;
		console.log("Courses: ", $scope.courses);
	});

		// Opens modal for user to login
    $scope.openNewCourseModal = function(){
    	console.log("OPEN MODAL");
    	// Forces first input of modal to get focus
    	$('.modal').on('shown.bs.modal', function() {
  			$(this).find('[autofocus]').focus();
		});
		// Show login modal window
        $('#newCourseModal').modal('show');
    };

    $scope.createCourse = function(){
    	console.log("$Scope: ", $scope.course);

    	$scope.course.userId = AuthFactory.getUser();
    	$scope.course.assignments = ['',''];
    	$scope.course.gradeStyle = "";

    	GradeStorage.addUserCourse($scope.course)
    	.then( function(){
    		GradeStorage.getUserCourses()
    		.then( function(courses){
    			$scope.courses = courses;
    		});
    	});
    	$scope.course = {};
    };

    $scope.courseDelete = function(courseId){
    	console.log("Deleting: ", courseId);
    	GradeStorage.deleteCourse(courseId)
    	.then( function(x){
    		console.log("X: ", x);

    		GradeStorage.getUserCourses()
    		.then( function(courses){
    			$scope.courses = courses;
    		});
    	});
    };

    // $scope.x = function(y){
    // 	console.log("X: ", y);
    // };


	



});