"use strict";


app.controller("ProfileCtrl", function($scope, $routeParams, AuthFactory, GradeStorage){
	// Get userId from URL 
	var myParams = $routeParams;
    $scope.userId = myParams.userId;

    // New Course Placeholder
    $scope.course = {};

    // Ng-Models
    $scope.selectedCourseINeed = "";
    $scope.neededAssignmentChosen = false;
    $scope.ungradedAssignments = "";
    $scope.styles = ["Cumulative Avg", "Weighted Avg"];
    $scope.finalGrade = "";
    // Ng-Shows
    $scope.noUngradedAssignments = false;
    $scope.assignmentChosen = false;
    $scope.gradeStyleChosen = false;
    $scope.courseChosen = false;


	// Get user information to display on profile
	AuthFactory.getUserProfile($scope.userId)
	.then( function(userProfile){
		// Set the returned user profile equal to $scope.account
		$scope.account = Object.values(userProfile)[0];
    	GradeStorage.getUserCourses()
    	.then( function(courses){
            $scope.courses = courses;
            console.log("$Scope.courses: ", $scope.courses);
    	});
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
    	.then( function(){
    		GradeStorage.getUserCourses()
    		.then( function(courses){
                console.log("$Scope.courses");
    			$scope.courses = courses;
    		});
    	});
    };

    $scope.updateGrade = function(){
        console.log("CLICKED");
        var newGrade = $scope.updatedGrade;

        console.log("New Grade: ", newGrade);
        console.log("$Scope: ", $scope.updateGrade);
    };

    $scope.openSeeWhatINeedModal = function(){
        console.log("OPEN MODAL");
        // Forces first input of modal to get focus
        $('.modal').on('shown.bs.modal', function() {
            $(this).find('[autofocus]').focus();
        });
        // Show login modal window
        $('#gradeNeededModal').modal('show');
    };

    // Gets all ungraded assignments for a course and loads that courses current grade
    $scope.getCourseDetails = function(){
        GradeStorage.getUngradedAssignmentsForCourse($scope.selectedCourseINeed.id)
        .then( function(allAssignments){
            $scope.ungradedAssignments = allAssignments.ungraded;
            $scope.allAssignments = allAssignments.all;

            // If there are no ungraded assignment for a course,
            //  show an alert
            if(allAssignments.ungraded.length === 0){
                $scope.noUngradedAssignments = true;
                $scope.courseChosen = false;
            }else{
                $scope.noUngradedAssignments = false;
                $scope.courseChosen = true;
            }

            // Set final grade that depends on grade style chosen
            if($scope.selectedGradeStyle === "Cumulative Avg"){
                $scope.finalGrade = (GradeStorage.calcCumulativeAvg(allAssignments.all)).toFixed(1) + "%";
            }else if($scope.selectedGradeStyle === "Weighted Avg"){
                $scope.finalGrade = GradeStorage.calcWeightedAvg(allAssignments.all).toFixed(1) + "%";
            }else{

            }
        });
    };

    $scope.seeWhatINeed = function(){

        if($scope.selectedGradeStyle === "Weighted Avg"){

        var possiblePoints =GradeStorage.getCoursePossiblePoints($scope.allAssignments) +  $scope.selectedAssignmentINeed.possiblePoints;
        var earnedPoints = GradeStorage.getCourseEarnedPoints($scope.allAssignments);
        var gradeNeeded = 0.0;
        var desiredGrade = $scope.desiredGrade / 100;
        var i;



        // Earned:           72pt + x
        // Possible:        205pt
        // Desired Grade:    89%
        
        // FORMULA: (127 + X)/145 = 0.89
        // FORMULA:    X = 57 pts (out of 70)
        


        console.log("-------------------------------------------------");
        var         y = 0.89 - (127/205);
        console.log("0.27: ", y);
        console.log("(Y / 205) = ", 0.89 - (127/205));
        console.log(" Y = ", (y * 205));
        // 59.55
        console.log("-------------------------------------------------");


        var gradeRatio = desiredGrade - (earnedPoints / possiblePoints);

        $scope.finalGrade = (gradeRatio * possiblePoints) + " / " + $scope.selectedAssignmentINeed.possiblePoints;

        alert("You need a " + $scope.finalGrade + " out of " + $scope.selectedAssignmentINeed.possiblePoints + "\n (Or a " + ($scope.finalGrade / $scope.selectedAssignmentINeed.possiblePoints) + "%");



        }else{
            console.log("--------- Calculating ACCUMULATING Avg --------------");
        }



        // Reset ng-shows
        $scope.courseChosen = false;
        $scope.assignmentChosen = false;

        // Reset ng-models
        $scope.selectedCourseINeed = "";
        $scope.finalGrade = "";
        $scope.selectedAssignmentINeed = "";

        // Make calculation for what they need to get
        

        

    };

});
