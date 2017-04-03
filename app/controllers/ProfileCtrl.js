"use strict";


app.controller("ProfileCtrl", function($scope, $routeParams, $window, AuthFactory, GradeStorage, CourseSettings){
    $scope.profilePicturePath = "/img/profile_placeholder.png";

    $scope.Math = window.Math;

    // Get userId from URL 
    var myParams = $routeParams;
    $scope.userId = myParams.userId;


    $scope.isNumber = angular.isNumber;

    // New Course Placeholder
    $scope.course = {};
    $scope.years = ['2013', '2014', '2015', '2016', '2017', '2018'];
    $scope.seasons = ['Fall', 'Winter', 'Spring', 'Summer'];
    $scope.styles = ["Weighted Average", "Cumulative Average"];
    $scope.semesters = [];
    $scope.hasProfilePicture = false;

    let DefaultCourseSettings = CourseSettings.DefaultCourseSettings;

    // Get user information to display on profile
    AuthFactory.getUserProfile($scope.userId)
    .then( function(userProfile){

        if(Object.keys(userProfile).length > 0){

            let userDetails = Object.values(userProfile)[0];

            $scope.currentSemester = userDetails.currentSemester;
            $scope.userEmail = userDetails.email;
            if(userDetails.profilePicture){
                $scope.profilePicturePath = userDetails.profilePicture;
                $scope.hasProfilePicture = true;
            }
            if(userDetails.school){
                $scope.userSchool = userDetails.school;
            }
            // Set the returned user profile equal to $scope.account
            $scope.account = Object.values(userProfile)[0];
            GradeStorage.getUserCourses()
            .then( function(courses){
                $scope.courses = courses;
                console.log("Courses: ", courses);
                var localSemesters = GradeStorage.getUserSemesters(courses);
                localSemesters.unshift("All Courses");

                $scope.semesters = localSemesters;

                for(var i = 0; i < $scope.semesters.length; i++){
                    if($scope.semesters[i] === $scope.currentSemester){
                        $scope.currentSemester = $scope.semesters[i];
                        $scope.semester.selectedSemester = $scope.semesters[i];
                        $scope.semester.filter = $scope.semester.selectedSemester;
                    }
                }

                $scope.getGPA();
            });
        }
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

    // Creates a new course
    $scope.createCourse = function(semesterInfo){
        $scope.course.semester = semesterInfo.season + "-" + semesterInfo.year;
        $scope.course.year = semesterInfo.year;
        $scope.course.season = semesterInfo.season;
    	$scope.course.userId = AuthFactory.getUser();
        $scope.course.gradeRange = DefaultCourseSettings;
        $scope.course.finalWeighted = '*';



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

    // Deletes a single course
    $scope.courseDelete = function(courseId){

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

    // Gets GPA for ALL semesters
    $scope.getTotalCumulativeGPA = function(){

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
            var GPAholder = [];

            // Get GPA for newly created Object
            if(GradeStorage.getCumulativeGPA(vals)){
                let grade = GradeStorage.getCumulativeGPA(vals);
                console.log("Grade: ", grade);
                GPAholder.push(grade);

                
                for(var j = 0; j < GPAholder.length; j++){
                    GPA += GPAholder[j];
                }

                console.log("Length: ", length);

                let newGPA = (GPA /length);
                $scope.semester.GPA = newGPA.toFixed(2);
            }
        }
    };

    // Gets GPA for individual semesters
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

            console.log("MyCOurses: ", myCourses);
            let weightedGPA = GradeStorage.getCumulativeGPA(myCourses);
            console.log("WeightedGPA: ", weightedGPA);
            if(weightedGPA <= 0 || weightedGPA > 4.05 || Number.isNaN(weightedGPA)){
                $scope.semester.GPA = "None";
            }else{
                $scope.semester.GPA = (weightedGPA).toFixed(2);
            }
        }
    };

    // 
    $scope.goToCourseSettings = function(courseId){
        $window.location.href = `#!/settings/${courseId}`;

    };

        // Open modal for a new assignment
    $scope.openChangeSemesterModal = function(){
        // Gets a shallow copy so that we dont mess with $scope.semesters by reference
        $scope.currentSemesterChoices = Object.values(jQuery.extend({}, $scope.semesters));
        $scope.currentSemesterChoices.splice(0,1);

        // Forces first input of modal to get focus
        $('.modal').on('shown.bs.modal', function() {
            $(this).find('[autofocus]').focus();
        });
        // Show login modal window
        $('#changeSemesterModal').modal('show');
    };

    // Gets old user profile, updates current semester, and patches new object to Firebase
    $scope.updateCurrentSemester = function(selectedSemester){

        AuthFactory.getUserProfile($scope.userId)
        .then( function(userProfile){
            let profileKey = Object.keys(userProfile)[0];
            let updatedUserProfile = jQuery.extend({}, Object.values(userProfile)[0]);
            updatedUserProfile.currentSemester = selectedSemester;
            AuthFactory.updateUserProfile(profileKey, updatedUserProfile)
            .then( function (resolve){
                
                for(var i = 0; i < $scope.semesters.length; i++){
                    console.log("HERE: ", i);
                    if($scope.semesters[i] === selectedSemester){
                        console.log("$scope.semesters: ", $scope.semesters[i]);
                        $scope.semester.selectedSemester = $scope.semesters[i];
                        $scope.semester.filter = $scope.semester.selectedSemester;
                    }
                }                

            });
        });
    };


});



// END
