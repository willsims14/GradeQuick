"use strict";


app.controller("ProfileCtrl", function($scope, $routeParams, AuthFactory, GradeStorage){
	// Get userId from URL 
	var myParams = $routeParams;
    $scope.selectedCourseINeed = "";
	$scope.userId = myParams.userId;
	$scope.course = {};
    $scope.neededAssignmentChosen = false;
    $scope.assignmentsINeed = "";
    $scope.styles = ["Cumulative Avg", "Weighted Avg"];
    $scope.finalGrade = "";
    $scope.noUngradedAssignments = false;


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
            $scope.assignmentsINeed = allAssignments.ungraded;

            // If there are no ungraded assignment for a course,
            //  show an alert
            if(allAssignments.ungraded.length === 0){
                $scope.noUngradedAssignments = true;
                $scope.courseChosen = false;
            }else{
                $scope.courseChosen = true;
                $scope.noUngradedAssignments = false;
            }

            // Set final grade that depends on grade style chosen
            if($scope.selectedGradeStyle === "Cumulative Avg"){
                $scope.finalGrade = (GradeStorage.calcCumulativeAvg(allAssignments.all)).toFixed(2) + "%";
            }else if($scope.selectedGradeStyle === "Weighted Avg"){
                $scope.finalGrade = GradeStorage.calcWeightedAvg(allAssignments.all).toFixed(2) + "%";
            }else{

            }
        });
    };

    $scope.seeWhatINeed = function(){
        // Reset ng-shows
        $scope.courseChosen = false;
        $scope.assignmentChosen = false;

        // Reset ng-models
        $scope.selectedCourseINeed = "";
        $scope.finalGrade = "";
        $scope.selectedAssignmentINeed = "";

        console.log("Desired Grade: ", $scope.desiredGrade);
        // Make calculation for what they need to get
         
        

    };




});
