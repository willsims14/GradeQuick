"use strict";

app.controller("SingleCourseCtrl", function($scope, AuthFactory, GradeStorage, $routeParams){

	// Scope Variables
	$scope.enteringGrade = false;
	// $scope.newGrade;
	$scope.newAssignment = {};
	// For dropown under header
	$scope.styles = ["Cumulative Average", "Weighted Average"];
	$scope.assignments = [];
	$scope.clickedAssignment = {};
	$scope.clickedAssignment.id = "";
	// Local Variables
	var selectedCourse = $routeParams.courseId;
	var user = AuthFactory.getUser();


	GradeStorage.getCourseName(selectedCourse)
	.then( function(tempCourseName){
		$scope.courseName = tempCourseName;
	});

	GradeStorage.getCourseAssignments(selectedCourse)
	.then( function(assignments){
		console.log("SELECTED COURSE: ", selectedCourse);
		$scope.assignments = assignments;
		$scope.recalculate();
	});

	$scope.wasAssignmentClicked = function(assignment){
		for(var i in $scope.assignments){
			var match = $scope.assignments[i];
			if(assignment.id == $scope.clickedAssignment.id){
				return true;
			}
		}
		return false;
	};

	// Open modal for a new assignment
	$scope.openNewAssignmentModal = function(){
    	// Forces first input of modal to get focus
    	$('.modal').on('shown.bs.modal', function() {
  			$(this).find('[autofocus]').focus();
		});
		// Show login modal window
        $('#newAssignmentModal').modal('show');
	};

	// Creates a new asignment
	$scope.createAssignment = function(){
		$scope.newAssignment.courseId = selectedCourse;
		$scope.newAssignment.userId = user;
		console.log("NEW ASSIGNMENT: ", $scope.newAssignment);

		if($scope.newAssignment.pointsEarned > $scope.newAssignment.possiblePoints){
			console.log("CANT EARN MORE POINTS THAN POSSIBLE");
			// ALERT USER HERE
			return;
		}

		if($scope.newAssignment.pointsEarned){
			console.log("POINTS WERE EARNED: ", $scope.newAssignment.pointsEarned);
		}else{
			$scope.newAssignment.pointsEarned = "*";
		}

		GradeStorage.addNewAssignment($scope.newAssignment)
		.then( function(){
			GradeStorage.getCourseAssignments(selectedCourse)
			.then( function(assignments){
				$scope.assignments = assignments;
				$scope.recalculate();
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
				$scope.recalculate();
			});
		});
	};

	// Shows input field for entering a new grade
	$scope.showNewGradeField = function(assignment){
		console.log("Assignment: ", assignment);
        $scope.assignmentToUpdate = assignment;
		$scope.enteringGrade = true;
		$scope.clickedAssignment = assignment;

	};

	// Makes call to firebase to update a grade on an assignment
    $scope.updateGrade = function(){
        var updatedAssignment = $scope.assignmentToUpdate;
        updatedAssignment.pointsEarned = $scope.updatedGrade;

        if(updatedAssignment.pointsEarned > updatedAssignment.possiblePoints){
			console.log("CANT EARN MORE POINTS THAN POSSIBLE");
			$("#new-grade-btn").html(" ");
			return;
        }

        GradeStorage.recordNewGrade(updatedAssignment.id, updatedAssignment)
        .then( function(){
			$scope.enteringGrade = false;
        	GradeStorage.getCourseAssignments(selectedCourse)
			.then( function(assignments){
				$("#new-grade-btn").val(" ");
				$scope.assignments = assignments;
				$scope.recalculate();
			});
        });
    };
    

    $scope.recalculate = function(){
		var finalGrade = 0.0;

		if($scope.assignments.length === 0){
			$scope.finalGrade = "No Grades Yet!";
		}else{
			if($scope.selectedGradeStyle === "Cumulative Average"){
				finalGrade = GradeStorage.calcCumulativeAvg($scope.assignments);
				$scope.finalGrade = finalGrade.toFixed(2) + "%";
			}else if($scope.selectedGradeStyle === "Weighted Average"){
				finalGrade = GradeStorage.calcWeightedAvg($scope.assignments);
				$scope.finalGrade = finalGrade.toFixed(2) + "%";
			}else{
				console.log("ELSE OCCURRED");
			}
		}
    };

    $scope.cancel = function(){
    	$scope.enteringGrade = false;
    	$scope.clickedAssignment = "";
    };


});


