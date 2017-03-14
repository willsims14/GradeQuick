"use strict";

app.controller("SingleCourseCtrl", function($scope, AuthFactory, GradeStorage, $routeParams){

	// Scope Variables
	$scope.enteringGrade = false;
	// $scope.newGrade;
	$scope.newAssignment = {};

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
		GradeStorage.deleteAssignment(assId)
		.then( function(){
			GradeStorage.getCourseAssignments(selectedCourse)
			.then( function(assignments){
				$scope.assignments = assignments;
			});
		});

	};

	// Shows input field for entering a new grade
	$scope.showNewGradeField = function(assignment){
        $scope.assignmentToUpdate = assignment;
		$scope.enteringGrade = true;
	};

	// Makes call to firebase to update a grade on an assignment
    $scope.updateGrade = function(){
        var updatedAssignment = $scope.assignmentToUpdate;
        updatedAssignment.pointsEarned = $scope.updatedGrade;

        GradeStorage.recordNewGrade(updatedAssignment.id, updatedAssignment)
        .then( function(x){
        	console.log("POSTED GRADE: ", x);
			$scope.enteringGrade = false;
        		GradeStorage.getCourseAssignments(selectedCourse)
				.then( function(assignments){
					$scope.assignments = assignments;
				});
        });


    };


});