"use strict";

app.controller("SingleCourseCtrl", function($scope, AuthFactory, GradeStorage, $routeParams){

	// Scope Variables
	$scope.enteringGrade = false;
	// $scope.newGrade;
	$scope.newAssignment = {};
	$scope.newGrade = {};

	// Local Variables
	var selectedCourse = $routeParams.courseId;
	var user = AuthFactory.getUser();


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

	$scope.showNewGradeField = function(){
		$scope.enteringGrade = true;
	};

	$scope.recordNewGrade = function(assignment){
		var newGrade = $scope.assignments.newGrade;
		var assId = assignment.id;
		// Delete new grade object from $scope once its retrieved
		delete $scope.assignments.newGrade;
		assignment.pointsEarned = newGrade;
		GradeStorage.recordNewGrade(assId, assignment)
		.then( function(x){
			console.log("X: ", x);

			GradeStorage.getCourseAssignments(selectedCourse)
			.then( function(assignments){
				$scope.assignments = assignments;
			});
			
		});
	};

	$scope.cancel = function(){
		$scope.enteringGrade = false;
	};



});