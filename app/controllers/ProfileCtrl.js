"use strict";


app.controller("ProfileCtrl", function($scope, $routeParams, AuthFactory, GradeStorage){
	// Get userId from URL 
	var myParams = $routeParams;
    $scope.userId = myParams.userId;

    // New Course Placeholder
    $scope.course = {};
    $scope.years = ['2013', '2014', '2015', '2016', '2017', '2018'];
    $scope.seasons = ['Fall', 'Winter', 'Spring', 'Summer'];
    $scope.styles = ["Weighted Average", "Cumulative Average"];
    $scope.semesters = [];
    $scope.showGPA = false;


	// Get user information to display on profile
	AuthFactory.getUserProfile($scope.userId)
	.then( function(userProfile){
		// Set the returned user profile equal to $scope.account
		$scope.account = Object.values(userProfile)[0];
    	GradeStorage.getUserCourses()
    	.then( function(courses){
            $scope.courses = courses;
            var localSemesters = [];
            for(var i = 0; i < $scope.courses.length; i++){
                localSemesters.push($scope.courses[i].semester);
            }
            localSemesters = jQuery.unique(localSemesters);
            localSemesters.unshift("All");
            $scope.semesters = localSemesters;

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

    $scope.createCourse = function(semesterInfo){
        $scope.course.semester = semesterInfo.season + "-" + semesterInfo.year;
        $scope.course.year = semesterInfo.year;
        $scope.course.season = semesterInfo.season;
    	$scope.course.userId = AuthFactory.getUser();

        console.log("INFO: ", semesterInfo);
        console.log("$Scope.course:  ", $scope.course);
        
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

    $scope.resetFilter = function(x){
        console.log("x: ",x);
        if(x.selectedSemester === "All"){
            console.log("ALL");
        }
    };

    $scope.getGPA = function(x){
        if(x.selectedSemester === "All"){
            $scope.semester.selectedSemester = undefined;
            $scope.showGPA = false;
        }else{
            $scope.showGPA = true;
            var myCourses = [];
            for(var i = 0; i < $scope.courses.length; i++){
                if($scope.courses[i].semester === x.selectedSemester){
                    myCourses.push($scope.courses[i]);
                }
            }

            console.log("MyCourses: ", myCourses);
            console.log("Grade Style: ", $scope.gradeStyle);

            if($scope.gradeStyle === "Cumulative Average"){
                console.log("CUMULATIVE");
            }else if($scope.gradeStyle === "Weighted Average"){
                console.log("WEIGHTED");

                GradeStorage.getWeightedGPA(myCourses);


            }else{
                console.log("ERROR");
            }









            $scope.semester.GPA = 3.5;
        }

    };



});

// END