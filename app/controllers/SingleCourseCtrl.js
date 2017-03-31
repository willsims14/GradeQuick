"use strict";

app.controller("SingleCourseCtrl", function($scope, ChartFactory, AuthFactory, GradeStorage, $routeParams){

	$(document).ready(function(){
		console.log("HERE");
	    $('[data-toggle="tooltip"]').tooltip();   
	});
	// Scope Variables
	$scope.enteringGrade = false;
	// $scope.newGrade;
	$scope.newAssignment = {};
	// For dropown under header
	$scope.styles = ["Cumulative Average", "Weighted Average"];
	$scope.assignments = [];
	$scope.clickedAssignment = {};
	$scope.clickedAssignment.id = "";
	$scope.invalidGrade = false;
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
			console.log("Assignments: ", $scope.assignments);


		}else{
			$scope.newAssignment.pointsEarned = "*";
		}

		GradeStorage.addNewAssignment($scope.newAssignment)
		.then( function(){
			GradeStorage.getCourseAssignments(selectedCourse)
			.then( function(assignments){
				$scope.assignments = assignments;
				GradeStorage.getCourseObject(selectedCourse)
				.then( function(courseObj){
		    		let myCourse = courseObj.info;

					let accumulatedCourseGrade = GradeStorage.calcCumulativeAvg($scope.assignments);
		    		let weightedCourseGrade = GradeStorage.calcWeightedAvg($scope.assignments);

		    		myCourse.finalAccumulated = accumulatedCourseGrade;
		    		myCourse.finalWeighted = weightedCourseGrade;

		    		GradeStorage.updateCourseGrades(myCourse, selectedCourse)
		    		.then( function(msg){
						$scope.recalculate();
		    		});
				});
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
        $scope.assignmentToUpdate = assignment;
		$scope.enteringGrade = true;
		$scope.clickedAssignment = assignment;

	};

	// Makes call to firebase to update a grade on an assignment
    $scope.updateGrade = function(){
    	console.log("Clicked Assignment: ", $scope.updatedGrade);

    	if(!$scope.updatedGrade){
    		console.log("NO GRADE");
    		$scope.invalidGrade = true;
    		return;
    	}else if(parseFloat($scope.updatedGrade) < 0){
    		console.log("INVALID NUMBER");
    		$scope.invalidGrade = true;
    		return;
    	}else{
    		console.log("GOOD");
	    	$scope.invalidGrade = false;
	    	$scope.enteringGrade = false;
	    	GradeStorage.getCourseObject(selectedCourse)
	    	.then( function(courseObj) {
	    		let myCourse = courseObj.info;
	    		let courseAssignments = Object.values(courseObj.assignments);

	    		console.log("Assignments: ", courseAssignments);

	    		let weightedCourseGrade = GradeStorage.calcWeightedAvg(courseAssignments);

	    		myCourse.finalWeighted = weightedCourseGrade;

		        var updatedAssignment = $scope.assignmentToUpdate;
		        updatedAssignment.pointsEarned = $scope.updatedGrade;
		        updatedAssignment.weightedGradePercentage = (updatedAssignment.pointsEarned / updatedAssignment.possiblePoints) * 100;

		        GradeStorage.recordNewGrade(updatedAssignment.id, updatedAssignment)
		        .then( function(){
		        	GradeStorage.getCourseAssignments(selectedCourse)
					.then( function(assignments){
			    		weightedCourseGrade = GradeStorage.calcWeightedAvg(assignments);
			    		console.log("WeightedCourse: ", weightedCourseGrade);
						myCourse.finalWeighted = weightedCourseGrade;
						GradeStorage.updateCourseGrades(myCourse, selectedCourse)
    					.then( (msg) => {
					        if(updatedAssignment.pointsEarned > updatedAssignment.possiblePoints){
								$("#new-grade-btn").html(" ");
								return;
					        }
							$("#new-grade-btn").val(" ");
							$scope.assignments = assignments;
							$scope.recalculate();
					    	$scope.enteringGrade = false;
							$scope.clickedAssignment.id = "";
					    	$scope.clickedAssignment = {};
					    	$scope.updatedGrade = undefined;
				    	});
					});
		        });
    		});
    	}
    };
    

    $scope.recalculate = function(){
		var finalGrade = 0.0;
		var bar;

		// Clear the chart's div to prepare for new chart
		$("#chartDiv").html("");

		if($scope.assignments.length === 0){
			$scope.finalGrade = "No Grades Yet!";
		}else{
			finalGrade = GradeStorage.calcWeightedAvg($scope.assignments);
			$scope.finalGrade = finalGrade.toFixed(2) + "%";

			bar = ChartFactory.getBar(finalGrade);
			bar.setText($scope.finalGrade);
			bar.animate(finalGrade / 100);
		}
    };

    $scope.cancel = function(){
    	$scope.enteringGrade = false;
    	$scope.clickedAssignment = "";
    	$scope.updatedGrade = undefined;
    	$scope.invalidGrade = false;
    };


});


