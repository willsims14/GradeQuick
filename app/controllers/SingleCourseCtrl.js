"use strict";

app.controller("SingleCourseCtrl", function($scope, AuthFactory, GradeStorage, $routeParams){

	var selectedCourse = $routeParams.courseId;
	var user = AuthFactory.getUser();
	$scope.newAssignment = {};


	GradeStorage.getCourseAssignments(selectedCourse)
	.then( function(assignments){
		$scope.assignments = assignments;
	});



	$scope.openNewAssignmentModal = function(){
    	// Forces first input of modal to get focus
    	$('.modal').on('shown.bs.modal', function() {
  			$(this).find('[autofocus]').focus();
		});
		// Show login modal window
        $('#newAssignmentModal').modal('show');
	};



	$scope.createAssignment = function(){
		$scope.newAssignment.courseId = selectedCourse;
		$scope.newAssignment.userId = user;
		console.log("NEW ASSIGNMENT: ", $scope.newAssignment);

		if($scope.newAssignment.pointsEarned){
			console.log("POINTS WERE EARNED: ", $scope.newAssignment.pointsEarned);
		}else{
			$scope.newAssignment.pointsEarned = "*";
		}

		GradeStorage.addNewAssignment($scope.newAssignment)
		.then( function(x){
			GradeStorage.getCourseAssignments(selectedCourse)
			.then( function(assignments){
				$scope.assignments = assignments;
			});			
		}).catch( function(error){
			console.log("ERROR: ", error);
		});

		$scope.newAssignment = {};
	};

	$scope.deleteAssignment = function(assId){
		console.log("DELETING: ", assId);

		GradeStorage.deleteAssignment(assId)
		.then( function(){
			GradeStorage.getCourseAssignments(selectedCourse)
			.then( function(assignments){
				$scope.assignments = assignments;
			});
		});

	};



});