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
                if($scope.semester.selectedSemester !== undefined){
                    console.log("Selected: ", $scope.semester.selectedSemester);
                    $scope.getGPA();
                }
    		});
    	});
    };

    $scope.updateGrade = function(){
        console.log("CLICKED");
        var newGrade = $scope.updatedGrade;

        console.log("New Grade: ", newGrade);
        console.log("$Scope: ", $scope.updateGrade);
    };


    $scope.getGPA = function(){

        if($scope.semester.selectedSemester === "All"){
            $scope.semester.selectedSemester = undefined;
            $scope.showGPA = false;
        }else{
            $scope.showGPA = true;
            var myCourses = [];
            // Get courses within the chosen semester
            for(var i = 0; i < $scope.courses.length; i++){
                if($scope.courses[i].semester === $scope.semester.selectedSemester){
                    myCourses.push($scope.courses[i]);
                }
            }

            if($scope.gradeStyle === "Cumulative Average"){
                let cumulativeGPA = 0.0;

                // Get GPA for a semester
                for(i = 0; i < myCourses.length; i++){
                    console.log("Course: ", myCourses[i].finalAccumulated);
                    if(myCourses[i].finalAccumulated > 90){
                        cumulativeGPA += 4.0;
                    }else if(myCourses[i].finalAccumulated > 80){
                        cumulativeGPA += 3.0;
                    }else if(myCourses[i].finalAccumulated > 72){
                        cumulativeGPA += 2.0;
                    }else if(myCourses[i].finalAccumulated > 65){
                        cumulativeGPA += 1.0;
                    }else{
                        cumulativeGPA += 0.0;
                    }
                }
                console.log("CUMULATIVE GPA: ", cumulativeGPA);
                console.log("Length: ", myCourses.length);
                $scope.semester.GPA = (cumulativeGPA / myCourses.length).toFixed(2);
            }else if($scope.gradeStyle === "Weighted Average"){
                let weightedGPA = 0.0;

                for(i = 0; i < myCourses.length; i++){
                    console.log("Course: ", myCourses[i].finalWeighted);
                    if(myCourses[i].finalWeighted > 90){
                        weightedGPA += 4.0;
                    }else if(myCourses[i].finalWeighted > 80){
                        weightedGPA += 3.0;
                    }else if(myCourses[i].finalWeighted > 72){
                        weightedGPA += 2.0;
                    }else if(myCourses[i].finalWeighted > 65){
                        weightedGPA += 1.0;
                    }else{
                        weightedGPA += 0.0;
                    }
                }
                console.log("WEIGHTED GPA:", weightedGPA);
                console.log("Length: ", myCourses.length);
                $scope.semester.GPA = (weightedGPA / myCourses.length).toFixed(2);
            }else{
                console.log("ERROR");
            }
        }

    };



});

// END