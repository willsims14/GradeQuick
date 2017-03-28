"use strict";


app.controller("ProfileCtrl", function($scope, $routeParams, $window, AuthFactory, GradeStorage, CourseSettings){
	// Get userId from URL 
	var myParams = $routeParams;
    $scope.userId = myParams.userId;

    // New Course Placeholder
    $scope.course = {};
    $scope.years = ['2013', '2014', '2015', '2016', '2017', '2018'];
    $scope.seasons = ['Fall', 'Winter', 'Spring', 'Summer'];
    $scope.styles = ["Weighted Average", "Cumulative Average"];
    $scope.semesters = [];
    $scope.semesters = [];

    let DefaultCourseSettings = CourseSettings.DefaultCourseSettings;

    console.log("Default: ", DefaultCourseSettings);



	// Get user information to display on profile
	AuthFactory.getUserProfile($scope.userId)
	.then( function(userProfile){
		// Set the returned user profile equal to $scope.account
		$scope.account = Object.values(userProfile)[0];
    	GradeStorage.getUserCourses()
    	.then( function(courses){
            $scope.courses = courses;
            console.log("Courses: ", courses);
            var localSemesters = GradeStorage.getUserSemesters(courses);
            localSemesters.unshift("All Courses");
            $scope.semesters = localSemesters;
            $scope.semester.selectedSemester = $scope.semesters[0];


            // $scope.getTotalCumulativeGPA();

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
        $scope.course.gradeRange = DefaultCourseSettings;



        console.log("INFO: ", semesterInfo);
        console.log("$Scope.course:  ", $scope.course);
        
    	GradeStorage.addUserCourse($scope.course)
    	.then( function(){
    		GradeStorage.getUserCourses()
    		.then( function(courses){
    			$scope.courses = courses;
                var localSemesters = GradeStorage.getUserSemesters(courses);
                localSemesters.unshift("All Courses");
                $scope.semesters = localSemesters;
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
    };


    $scope.getTotalCumulativeGPA = function(){
        console.log("Getting GPA: ", $scope.semesters);

        var mySemesters = {};
        let length = $scope.semesters.length - 1;
        mySemesters.all = $scope.semesters;
        let GPA = 0.0;

        var i, j;

        // For each semester, create an object to pass to GradeStorage
        for(i = 0; i < mySemesters.all.length; i++){
            GradeStorage.getCoursesBySemester(mySemesters.all[i])
            .then( createObject );
        }

        function createObject(semester){
            let vals = Object.values(semester);
            console.log("Vals: ", semester);
            var GPAholder = [];

            // Get GPA for newly created Object
            if(GradeStorage.getCumulativeGPA(vals)){
                let grade = GradeStorage.getCumulativeGPA(vals);
                GPAholder.push(grade);

                
                for(var j = 0; j < GPAholder.length; j++){
                    GPA += GPAholder[j];
                }

                let newGPA = (GPA /length);
                $scope.semester.GPA = newGPA.toFixed(2);
            }
        }
    };

    $scope.getGPA = function(){
        $scope.semester.filter = $scope.semester.selectedSemester;
        if($scope.semester.selectedSemester === "All Courses"){
            $scope.semester.filter = undefined;
            $scope.getTotalCumulativeGPA();
        }else{
            var myCourses = [];
            // Get courses within the chosen semester
            for(var i = 0; i < $scope.courses.length; i++){
                if($scope.courses[i].semester === $scope.semester.selectedSemester){
                    myCourses.push($scope.courses[i]);
                }
            }
            // Calculate GPA (depending on grade style selected by user)
            if($scope.gradeStyle === "Cumulative Average"){
                let cumulativeGPA = GradeStorage.getWeightedGPA(myCourses);
                if(cumulativeGPA <= 0 || cumulativeGPA > 4.05){
                    $scope.semester.GPA = "N/A";
                    return;
                }                
                $scope.semester.GPA = (cumulativeGPA).toFixed(2);

            }else if($scope.gradeStyle === "Weighted Average"){
                console.log("MyCourses!!: ", myCourses);
                let weightedGPA = GradeStorage.getCumulativeGPA(myCourses);
                if(weightedGPA <= 0 || weightedGPA > 4.05){
                    $scope.semester.GPA = "N/A";
                    return;
                }
                console.log("WeightedGPA: ", weightedGPA);
                $scope.semester.GPA = (weightedGPA).toFixed(2);
            }else{
                console.log("ERROR");
            }
        }

    };

    $scope.goToCourseSettings = function(courseId){
        $window.location.href = `#!/settings/${courseId}`;
        $routeParams.courseName = "x";
    };


});

// END
