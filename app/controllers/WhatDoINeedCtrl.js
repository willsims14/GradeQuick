"use strict";

app.controller("WhatDoINeedCtrl", function($scope, AuthFactory, GradeStorage){

	console.log("What DO I Need");

	    // Ng-Models
    $scope.selectedCourseINeed = "";
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
        var desiredGrade = $scope.desiredGrade / 100;
        var i;


        var gradeRatio = desiredGrade - (earnedPoints / possiblePoints);
        var pointsNecesary = (gradeRatio * possiblePoints);

        $scope.percentageNecesary = ((pointsNecesary / $scope.selectedAssignmentINeed.possiblePoints) * 100).toFixed(1) + "%";

        $scope.necesaryGrade = pointsNecesary.toFixed(1) + " / " + $scope.selectedAssignmentINeed.possiblePoints + " points";
        $scope.showNecesaryGrade = true;
        console.log("GRADE: ", $scope.necesaryGrade);
        }else{
            console.log("--------- Calculating ACCUMULATING Avg --------------");
        }
        

        // Reset ng-shows
        // $scope.courseChosen = false;
        // $scope.assignmentChosen = false;

        // Reset ng-models
        // $scope.selectedCourseINeed = "";
        // $scope.selectedAssignmentINeed = "";

        // Make calculation for what they need to get
    };

});