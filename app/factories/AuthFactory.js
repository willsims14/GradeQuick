"use strict";

app.factory("AuthFactory", function(FBCreds, $q, $http){
	let currentUser = null;

	let createUser = function(userObj){
		console.log("Creating User: ", userObj);
		return firebase.auth().createUserWithEmailAndPassword(userObj.email, userObj.password)
		.catch( function(error){
			let errorCode = error.code;
			let errorMessage = error.message;
			return error;
		});
	};

	let loginUser = function(userObj) {
		console.log("Logging in User: ", userObj);
		return firebase.auth().signInWithEmailAndPassword(userObj.email, userObj.password)
		.catch( function(error){
			let errorCode = error.code;
			let errorMessage = error.message;
			console.log("error:", errorCode, errorMessage);
		});
	};

	let logoutUser = function(){
		return firebase.auth().signOut();
	};


	let isAuthenticated = function (){
		return new Promise ( (resolve, reject) => {
			firebase.auth().onAuthStateChanged( (user) => {
				if (user){
					currentUser = user.uid;
					resolve(true);
				}else {
					resolve(false);
				}
			});
		});
	};

	let getUser = function(){
		return currentUser;
	};


	let provider = new firebase.auth.GoogleAuthProvider();

	let authWithProvider= function(){
    	return firebase.auth().signInWithPopup(provider);
  	};

	/*******************************************************/
	/******* User Profiles *********************************/
	/*******************************************************/

  	// Retrieves record from database/users.json 
	let getUserProfile = function(userId){
		return $q((resolve, reject) => {
			$http.get(`${FBCreds.databaseURL}/users.json?orderBy="userId"&equalTo="${userId}"`)
			.then((userObject) => {
				resolve(userObject.data);
			})
			.catch((error) => {
				console.log("Error");
				reject(error);
			});
		});
	};

	let checkUserHasProfile = function(userId){
		return $q((resolve, reject) => {
			$http.get(`${FBCreds.databaseURL}/users.json?orderBy="userId"&equalTo="${userId}"`)
			.then( (userObject) => {
				var userObjLength = Object.keys(userObject.data).length;
				if(userObjLength === 1){
					resolve(true);
				}
				resolve(false);
			})
			.catch((error) => {
				reject(error);
			});
		});
	};

	// Adds record to database/users.json 
	let createUserProfile = function(profile){
		return $q((resolve, reject) => {
			$http.post(`${FBCreds.databaseURL}/users.json`, JSON.stringify(profile))
			.then((ObjectFromFirebase) => {
				resolve(ObjectFromFirebase);
			}).catch((error) => {
				reject(error);
			});
		});
	};

	let updateUserProfile = function(key, profile){
		return $q(function(resolve, reject){
			$http.patch(`${FBCreds.databaseURL}/users/${key}.json`, 
				angular.toJson(profile))
			.then( function(ObjectFromFirebase){
				console.log("Resolved: ", ObjectFromFirebase);
				resolve(ObjectFromFirebase);
			})
			.catch( function(error){
				reject(error);
			});
		});


	};



	return {updateUserProfile, createUserProfile, checkUserHasProfile, getUserProfile, createUser, loginUser, logoutUser, isAuthenticated, getUser, authWithProvider};

});