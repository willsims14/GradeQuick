"use strict";

app.factory("CourseSettings", function(AuthFactory, $http, $q, FBCreds) {

	let DefaultCourseSettings = {
		A : { min: 91, max: 100 },
		B : { min: 81, max:  90 },
		C : { min: 72, max:  80 },
		D : { min: 65, max:  71 },
		F : { min:  0, max:  59 }
	};

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

	return {setCourseSettings, DefaultCourseSettings};

});