"use strict";

app.factory("GradeStorage", function(AuthFactory, FBCreds, $http, $q, CourseSettings){

/*************************/
/****** Courses ******/
/*************************/

	// Retrieves all boards (for the logged in user)
	let getUserCourses = () => {
		let courses = [];
		let user = AuthFactory.getUser();
			console.log("USER: ", user);

		return $q((resolve, reject) => {
			$http.get(`${FBCreds.databaseURL}/courses.json?orderBy="userId"&equalTo="${user}"`)
			.then((coursesObj) => {
				let coursesCollection = coursesObj.data;
				Object.keys(coursesCollection).forEach((key) => {
					coursesCollection[key].id = key;
					courses.push(coursesCollection[key]);
				});
				resolve(courses);
			})
			.catch((error) => {
				reject(error);
			});
		});
	};

	let getUserSemesters = (courses) => {

		let myCourses = courses;
        var localSemesters = [];

        // Gets all semesters that the user has been a student for
        for(var i = 0; i < courses.length; i++){
            localSemesters.push(myCourses[i].semester);
        }

        // Removes duplicate semesters
        localSemesters = jQuery.unique(localSemesters);
        console.log("LocalFacorySemesters: ", localSemesters);
        return localSemesters;
    };

	let getCourseName = (courseId) => {
		let courseName = "";
		let user = AuthFactory.getUser();

		console.log("Looking For: ", courseId);

		return $q((resolve, reject) => {
			$http.get(`${FBCreds.databaseURL}/courses/${courseId}.json`)
			.then((coursesObj) => {
				let courseName = coursesObj.data.name;
				resolve(courseName);
			})
			.catch((error) => {
				reject(error);
			});
		});
	};

	let getCourseObject = (courseId) => {
		let course = {};
		return $q((resolve, reject) => {
			$http.get(`${FBCreds.databaseURL}/courses/${courseId}.json`)
			.then((coursesObj) => {
				course.info = coursesObj.data;
				// resolve(course);

				$http.get(`${FBCreds.databaseURL}/assignments.json?orderBy="courseId"&equalTo="${courseId}"`)
				.then((assignments) => {
					course.assignments = assignments.data;
					resolve(course);
				});
			})
			.catch((error) => {
				reject(error);
			});
		});
	};

	let getUngradedAssignmentsForCourse = function(courseId){
		let assignments = [];
		let ungradedAssignments = [];
		console.log("CourseID: ", courseId);
		return $q((resolve, reject) => {
			$http.get(`${FBCreds.databaseURL}/assignments.json?orderBy="courseId"&equalTo="${courseId}"`)
			.then((assignmentsObj) => {
				let assCollection = assignmentsObj.data;

				Object.keys(assCollection).forEach((key) => {
					assCollection[key].id = key;
					assignments.push(assCollection[key]);
				});

				console.log("Assignments: ", assignments);

				for(var i = 0; i < assignments.length; i++){
					if(assignments[i].pointsEarned === '*'){
						ungradedAssignments.push(assignments[i]);
					}
				}
				let allAssignments = {all: assignments, ungraded:ungradedAssignments};
				resolve(allAssignments);
			})
			.catch((error) => {
				reject(error);
			});
		});
	};

	let updateCourseGrades = (editedCourse, courseId) => {
		return $q(function(resolve, reject){
			$http.patch(`${FBCreds.databaseURL}/courses/${courseId}.json`, 
				angular.toJson(editedCourse))
			.then( function(ObjectFromFirebase){
				resolve(ObjectFromFirebase);
			})
			.catch( function(error){
				reject(error);
			});
		});
	};



	let addUserCourse = (newCourse) => {
		let courses = [];
		let user = AuthFactory.getUser();

		return $q((resolve, reject) => {
			$http.post(`${FBCreds.databaseURL}/courses.json`, angular.toJson(newCourse))
			.then( (objects) => {
				console.log("CoursesObj: ", objects);
				resolve(objects);
			}).catch((error) => {
				reject(error);
			});
		});
	};

	let deleteCourse = function(courseId){
		return $q((resolve, reject) => {
			$http.delete(`${FBCreds.databaseURL}/courses/${courseId}.json`)
			.then((objectFromFirebase) => {
				resolve(objectFromFirebase);
			});
		});

	};


/*************************/
/****** Assignments ******/
/*************************/

	let getCourseAssignments = function(courseId){
		let assignments = [];
		let user = AuthFactory.getUser();

		return $q((resolve, reject) => {
			$http.get(`${FBCreds.databaseURL}/assignments.json?orderBy="courseId"&equalTo="${courseId}"`)
			.then((assignmentsObj) => {
				let assCollection = assignmentsObj.data;
				Object.keys(assCollection).forEach((key) => {
					assCollection[key].id = key;
					assignments.push(assCollection[key]);
				});
				resolve(assignments);
			})
			.catch((error) => {
				reject(error);
			});
		});
	};

	let addNewAssignment = function(assignment){
		return $q((resolve, reject) => {
			$http.post(`${FBCreds.databaseURL}/assignments.json`, JSON.stringify(assignment))
			.then((ObjectFromFirebase) => {
				resolve(ObjectFromFirebase);
			}).catch((error) => {
				reject(error);
			});
		});
	};

	let deleteAssignment = function(assignmentId){
		return $q((resolve, reject) => {
			$http.delete(`${FBCreds.databaseURL}/assignments/${assignmentId}.json`)
			.then((objectFromFirebase) => {
				resolve(objectFromFirebase);
			});
		});
	};


	let recordNewGrade = function(assId, editedAssignment){

		return $q(function(resolve, reject){
			$http.patch(`${FBCreds.databaseURL}/assignments/${assId}.json`, 
				angular.toJson(editedAssignment))
			.then( function(ObjectFromFirebase){
				resolve(ObjectFromFirebase);
			})
			.catch( function(error){
				reject(error);
			});
		});

	};

/************************************/
/******  Modular Calculations  ******/
/****** with NO $http requests  *****/
/************************************/


    function calcWeightedAvg(assignments){
    	var numAssignments = assignments.length;
		var totalEarnedPoints = 0.0;
		var totalPossiblePoints = 0.0;
    	var finalGrade = 0.0;
    	var i;
		
		// Get a course's total amount of points possible 
		totalPossiblePoints = getCoursePossiblePoints(assignments);
		totalEarnedPoints = getCourseEarnedPoints(assignments);

		// Get a student's total amount of earned points
		finalGrade = ((totalEarnedPoints / totalPossiblePoints) * 100);
		return finalGrade;
    }

    function calcCumulativeAvg(assignments){
    	var numAssignments = assignments.length;
    	var finalGrade = 0.0;
    	var i;
		// Divide each assignments earned points by total possible points
		for(i = 0; i < assignments.length; i++){
			// If [i].pointsEarned is not a number
			if(assignments[i].pointsEarned === '*'){
				numAssignments--;
			}else{
				finalGrade += (assignments[i].pointsEarned / assignments[i].possiblePoints);
			}
		}
		finalGrade = (finalGrade / numAssignments) * 100;
		return finalGrade;
    }


    function getCoursePossiblePoints(assignments){
    	var possiblePoints = 0.0;
    	// Get total amount of possible points
		for(var i = 0; i < assignments.length; i++){
			if(assignments[i].pointsEarned !== '*'){
				possiblePoints += parseFloat(assignments[i].possiblePoints);
			}
		}
		return possiblePoints;
    }

    function getCourseEarnedPoints(assignments){
    	var earnedPoints = 0.0;
		for(var i = 0; i < assignments.length; i++){
			if(assignments[i].pointsEarned !== '*'){
				earnedPoints += parseFloat(assignments[i].pointsEarned);
			}
		}
		return earnedPoints;
    }


    function getWeightedGPA(myCourses){
        let cumulativeGPA = 0.0;
        var i = 0;



		// Get GPA for a semester
		for(i = 0; i < myCourses.length; i++){

	        let courseSettings = myCourses[i].gradeRange;

	        console.log("CourseSettings: ", courseSettings);

		    if(myCourses[i].finalAccumulated >= courseSettings.A.min){
		        cumulativeGPA += 4.0;
		    }else if(myCourses[i].finalAccumulated >= courseSettings.B.min){
		        cumulativeGPA += 3.0;
		    }else if(myCourses[i].finalAccumulated >= courseSettings.C.min){
		        cumulativeGPA += 2.0;
		    }else if(myCourses[i].finalAccumulated >= courseSettings.D.min){
		        cumulativeGPA += 1.0;
		    }else{
		        cumulativeGPA += 0.0;
		    }
		}
		return 1.0 * (cumulativeGPA / myCourses.length);	
    }

    function getCumulativeGPA(myCourses){
	    let weightedGPA = 0.0;
	    let i = 0;

	    console.log("MyCOurses: ", myCourses);

	    if(myCourses.length === 0){
	    	return "error";
	    }


	    for(i = 0; i < myCourses.length; i++){
	    	
	        let courseSettings = myCourses[i].gradeRange;

	        console.log("CourseSettings: ", courseSettings);

	        if(myCourses[i].finalWeighted >= courseSettings.A.min){
	            weightedGPA += 4.0;
	        }else if(myCourses[i].finalWeighted >= courseSettings.B.min){
	            weightedGPA += 3.0;
	        }else if(myCourses[i].finalWeighted >= courseSettings.C.min){
	            weightedGPA += 2.0;
	        }else if(myCourses[i].finalWeighted >= courseSettings.D.min){
	            weightedGPA += 1.0;
	        }else{
	            weightedGPA += 0.0;
	        }
	    }
	    console.log("Total: ", weightedGPA);
	    console.log("Length: ", myCourses.length);
	    console.log("Equals: ", weightedGPA / myCourses.length);
	    return 1.0 * (weightedGPA / myCourses.length);
    }




	return {getUserSemesters, getCumulativeGPA, getWeightedGPA, updateCourseGrades, getCourseObject, getCoursePossiblePoints, getCourseEarnedPoints, getUngradedAssignmentsForCourse, deleteCourse, getUserCourses, addUserCourse, getCourseName, getCourseAssignments, addNewAssignment, deleteAssignment, recordNewGrade, calcWeightedAvg, calcCumulativeAvg};
});