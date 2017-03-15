"use strict";

app.factory("GradeStorage", function(AuthFactory, FBCreds, $http, $q){

/*************************/
/****** Courses ******/
/*************************/

	// Retrieves all boards (for the logged in user)
	let getUserCourses = () => {
		let courses = [];
		let user = AuthFactory.getUser();

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

    	// Get total amount of possible points
		for(i = 0; i < assignments.length; i++){
			if(assignments[i].pointsEarned !== '*'){
				totalPossiblePoints += parseInt(assignments[i].possiblePoints);
			}
		}
		// Get total amount of earned points
		for(i = 0; i < numAssignments; i++){
			if(assignments[i].pointsEarned !== '*'){
				totalEarnedPoints += parseInt(assignments[i].pointsEarned);
			}
			
		}
		finalGrade = ((totalEarnedPoints / totalPossiblePoints) * 100);
		console.log("BEFORE Final: ", finalGrade);
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



	return {deleteCourse, getUserCourses, addUserCourse, getCourseName, getCourseAssignments, addNewAssignment, deleteAssignment, recordNewGrade, calcWeightedAvg, calcCumulativeAvg};
});