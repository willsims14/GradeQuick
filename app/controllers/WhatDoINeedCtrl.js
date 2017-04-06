"use strict";

app.controller("WhatDoINeedCtrl", function($scope, AuthFactory, GradeStorage){

	console.log("What DO I Need");

	    // Ng-Models
    $scope.selectedCourseINeed = null;
    $scope.neededAssignmentChosen = false;
    $scope.ungradedAssignments = "";
    $scope.styles = ["Cumulative Avg", "Weighted Avg"];
    $scope.finalGrade = "";
    $scope.necesaryGrade = "";
    // Ng-Shows
    $scope.noUngradedAssignments = false;
    $scope.assignmentChosen = false;
    $scope.gradeStyleChosen = false;
    $scope.courseChosen = false;
    $scope.showNecesaryGrade = false;

    AuthFactory.getUserProfile($scope.userId)
	.then( function(userProfile){
		// Set the returned user profile equal to $scope.account
		$scope.account = Object.values(userProfile)[0];
    	GradeStorage.getUserCourses()
    	.then( function(courses){
            $scope.courses = courses;
    	});
    });



    $scope.getCourseDetails = function(){
        GradeStorage.getUngradedAssignmentsForCourse($scope.selectedCourseINeed.id)
        .then( function(allAssignments){
        	console.log("All: ", allAssignments);
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
                    
                $scope.finalGradeShow = GradeStorage.calcWeightedAvg(allAssignments.all).toFixed(1) + "%";
                $scope.finalGrade = GradeStorage.calcWeightedAvg(allAssignments.all);

                console.log("Final Grade", $scope.finalGrade);

        });
    };

    $scope.seeWhatINeed = function(){
        var desiredGrade = $scope.desiredGrade / 100;
        var i;

        // Weighted Average
        if($scope.selectedGradeStyle === "Weighted Avg"){
            var possiblePoints =GradeStorage.getCoursePossiblePoints($scope.allAssignments) +  $scope.selectedAssignmentINeed.possiblePoints;
            var earnedPoints = GradeStorage.getCourseEarnedPoints($scope.allAssignments);

            var gradeRatio = desiredGrade - (earnedPoints / possiblePoints);
            var pointsNecesary = (gradeRatio * possiblePoints);

            $scope.percentageNecesary = ((pointsNecesary / $scope.selectedAssignmentINeed.possiblePoints) * 100).toFixed(1) + "%";

            $scope.necesaryGrade = pointsNecesary.toFixed(1) + " / " + $scope.selectedAssignmentINeed.possiblePoints + " points";
            $scope.showNecesaryGrade = true;
        // Cumulative Average
        }else{
            var numAssignments = ($scope.allAssignments.length - $scope.ungradedAssignments.length) + 1;
            var gradeNeeded = numAssignments * desiredGrade;

            for(i = 0; i < $scope.allAssignments.length; i++){
                if($scope.allAssignments[i].pointsEarned !== "*"){
                    gradeNeeded -= ($scope.allAssignments[i].pointsEarned / $scope.allAssignments[i].possiblePoints);
                }
            }
            gradeNeeded *= $scope.selectedAssignmentINeed.possiblePoints;

            // Set $scope variables for DOM
            $scope.necesaryGrade = gradeNeeded.toFixed(1) + " / " + $scope.selectedAssignmentINeed.possiblePoints + " points";
            $scope.showNecesaryGrade = true;
            $scope.percentageNecesary = ((gradeNeeded / $scope.selectedAssignmentINeed.possiblePoints) * 100).toFixed(1) + "%";
        }
    };

    $scope.clearFields = function(){
        $scope.noUngradedAssignments = false;
        $scope.assignmentChosen = false;
        $scope.gradeStyleChosen = false;
        $scope.courseChosen = false;
        $scope.showNecesaryGrade = false; 
    };

});