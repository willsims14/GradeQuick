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






	return {deleteCourse, getUserCourses, addUserCourse, getCourseAssignments, addNewAssignment, deleteAssignment, recordNewGrade};
});