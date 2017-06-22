"use strict";

app.controller("SettingsCtrl", function($scope, $routeParams, $location, AuthFactory, GradeStorage, CourseSettings){

	var myParams = $routeParams;
    $scope.courseId = myParams.courseId;
    // Used for RETRIEVING user input
    $scope.range = null;
    // Used to SHOWING course's current grade range
    $scope.myRange = null;

    let DefaultCourseRange = CourseSettings.DefaultCourseSettings;

    GradeStorage.getCourseObject($scope.courseId)
    .then( function(courseObj){
    	$scope.assignments = Object.values(courseObj.assignments);
    	$scope.course = courseObj.info;
    	// Scope variables used ONLY to show current grade range
    	$scope.myRange = courseObj.info.gradeRange;


    });

    $scope.updateCourseGradeRange = function(){
    	let editedCourse = $scope.course;

    	if($scope.range === null){
    		console.log("NULL ERROR");
    	}else if(Object.keys($scope.range).length !== 5){
    		console.log("AMOUNT ERROR");
    	}else{
    		editedCourse.gradeRange = $scope.range;
    		console.log("NewCourse: ", editedCourse);

	    	CourseSettings.setCourseSettings($scope.courseId, editedCourse)
	    	.then( function(msg){
	    		var user = AuthFactory.getUser();
                console.log("User", user);
                $location.path(`/${user}`)
	    	});
    	}
    };

    $scope.clearFields = function(){
    	$scope.range = {};
    };

    $scope.resetRanges = function(){
    	$scope.range = DefaultCourseRange;
    	$scope.showEditRanges = true;
    };






});