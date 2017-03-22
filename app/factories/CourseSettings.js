"use strict";

app.factory("CourseSettings", function(AuthFactory, $http, $q, FBCreds) {

	let setCourseSettings = function(courseId, courseObj){


		return $q(function(resolve, reject){
			$http.patch(`${FBCreds.databaseURL}/courses/${courseId}.json`, 
				angular.toJson(courseObj))
			.then( function(ObjectFromFirebase){
				resolve(ObjectFromFirebase);
			})
			.catch( function(error){
				reject(error);
			});
		});


	};

	return {setCourseSettings};

});