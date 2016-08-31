angular.module('app.account', ['angular-jwt'])
.factory('CompanyService', ['$q', '$http', 'Upload', function($q, $http, Upload) {
	var get, save, uploadLogo;
	get = function() {
		var deferred = $q.defer();
		$http.get('api/company').then(
			function(success){
				deferred.resolve(success.data.objects[0])
			},
			function(error){
				deferred.reject(error)	
			}
		);
		return deferred.promise;
	};
	
	save = function(id, props){
		var deferred = $q.defer();
		$http.put('api/company/' + id + '/', props).then(function(result){
        	deferred.resolve(result);
        })
        return deferred.promise;
	};

	uploadLogo = function(id, file){
		var deferred = $q.defer();
		Upload.upload({
                url: 'api/company/' + id + '/',
                data: { logo: file },
                method: 'PUT'
            }).then(function (resp) {
            	deferred.resolve(resp.config.data.file.name)
            }, function (resp) {
                deferred.reject(resp.status);
            }, function (evt) {
                deferred.notify(parseInt(100.0 * evt.loaded / evt.total));
            });
		return deferred.promise;
	};

	return {
		get: get,
		save: save,
		uploadLogo: uploadLogo
	};
}])
.factory('UserService', ['$q', '$http', 'Upload', function($q, $http, Upload) {
	var get, save, uploadAvatar;

	get = function() {
		var deferred = $q.defer();

		$http.get('api/user').then(
			function(success){
				if(success.data.objects.length)
				{
					deferred.resolve(success.data.objects[0])
				}
				else
				{
					deferred.reject('No data')	
				}
			},
			function(error){
				console.log('error ' , error);
				deferred.reject(error)	
			}
		);

		return deferred.promise;
	}

	save = function(id, props){
		var deferred = $q.defer();
		$http.put('api/user/' + id + '/', props).then(function(result){
        	deferred.resolve(result);
        })
        return deferred.promise;
	}

	uploadAvatar = function(id, file){
		var deferred = $q.defer();
		Upload.upload({
                url: 'api/client_settings/' + id + '/',
                data: { avatar: file },
                method: 'PUT'
            }).then(function (result) {
            	deferred.resolve(result)
            }, function (resp) {
                deferred.reject(resp.status);
            }, function (evt) {
                deferred.notify(parseInt(100.0 * evt.loaded / evt.total));
            });
		return deferred.promise;
	}

	return {
		get: get,
		save: save,
		uploadAvatar: uploadAvatar
	};
}])
.factory('accountService', ['$rootScope', '$http', '$q', 'urlService', '$injector', function($rootScope, $http, $q, urlService, $injector){
	
	//methods
	var get, reload, reset;
	
	//properties
	var account; 

	//get account profile
	get = function(){
		var deferred = $q.defer();

		if(account) {

			deferred.resolve(account);

		}	else	{
			
			reload().then(
				function(success){
					deferred.resolve(success);
				},
				function(error){
					deferred.reject(error);
				}
			);

		}

		
		return deferred.promise;
	}, // -- get

	//reload account profile
	reload = function(){
		
		var deferred = $q.defer();

		$http.get('api/client_settings/').then(
			function(success){

				// get avatar and logo urls
				var avatarUrl = success.data.objects.length && (success.data.objects[0].avatar ? success.data.objects[0].avatar : null);
				var companyLogoUrl = success.data.objects.length && (success.data.objects[0].company_logo ? success.data.objects[0].company_logo : null);

				// check for availability and substitute with defaults otherwise
				var avatarPromise = urlService.exists(avatarUrl, '/static/image/default.avatar.jpg');
				var logoPromise = urlService.exists(companyLogoUrl, '/static/image/default.logo.jpg');
				
				var userProfile = $injector.get('UserService').get();
				var companyProfile = $injector.get('CompanyService').get();

				$q.all([avatarPromise, logoPromise, userProfile, companyProfile]).then(
					function(result){
						if(success.data.objects.length)
						{
							//combine account profile with avatar
							success.data.objects[0].avatar = result[0];
							success.data.objects[0].company_logo = result[1];
							
							success.data.objects[0].userProfile = result[2];
							success.data.objects[0].companyProfile = result[3];

							//cache account
							account = angular.copy(success.data.objects[0]);

							$rootScope.account = account;

							deferred.resolve(success.data.objects[0]);
						}
						else
						{
							deferred.resolve({ avatar: resultUrl[0], company_logo: resultUrl[1] });
						}
					},
					function(err){
						deferred.reject(err);
					}
				);

			},
			function(failure){
				deferred.reject(failure);
			}
		);

		return deferred.promise;
	}

	//clear account profile on logout
	reset = function(){
		account = {};
	}

	return {
		get: get,
		reload: reload,
		reset: reset,
		account: function(){
			return account;
		}
	}
}])
.factory('authService', ['$q', '$rootScope', 'accountService', 'localStorageService', 'jwtHelper', '$http', 'accountService', function ($q, $rootScope, accountService, localStorageService, jwtHelper, $http, accountService) {

        var _profile, login, logout, refresh, isAuthorized, isUserInRoles, getProfile;

        isAuthorized = function(){
        	var token = localStorageService.get('token');
        	return token && !jwtHelper.isTokenExpired(token);
        }

		login = function(formData){
			var deferred = $q.defer();

			//remove token if exists before authorization
	    	if(localStorageService.get('token')){
            	localStorageService.remove('token');
	    	}

	    	//authorize
			$http.post('api-token-auth/',formData).then(
				function(success){

					$rootScope.$broadcast('auth:success');

	                //save auth token
					var token = (success.data||{}).token;
	                localStorageService.set('token', token);

	                //reload user profile
	                accountService.reload();

					deferred.resolve(token);
				},
				function(err){
					deferred.reject(err);
				})
			return deferred.promise;
		}
        
        logout = function(){
			localStorageService.remove('token');
        	authorized = false;
        	accountService.reset();
        }
        
        isUserInRoles = function (roles) {
            var deferred = $q.defer();
            deferred.resolve(true);
            return deferred.promise;
        };
        
        refresh = function(){
        	//TODO: Refresh token here

        	//Reload profile
        	accountService.reload();
        }

        return {
        	refresh: refresh,
            login: login,
            logout: logout,
            isAuthorized: isAuthorized,
            isUserInRoles: isUserInRoles,
            profile: function(){
            	return accountService.account;
            }
        };
}])
.factory('$requestLog', [function(){

	var requests = [];

	return {
		add: function(request){
			if(request.url.indexOf('---') >= 0)
				requests = [];
			else
				requests.push(request);
		},
		list: function(){
			return requests;
		}
	}

}])
.config(['$httpProvider', function($httpProvider) {
	
	$httpProvider.interceptors.push(['$q', '$location', '$rootScope', 'localStorageService', '$requestLog','$timeout', function($q, $location, $rootScope,localStorageService, $requestLog, $timeout) {
        return {
            'request': function (config) {
                var token = localStorageService.get('token');
                config.headers = config.headers || {};
                if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }
                config.headers["Content-Type"]="application/json"
                return config;
            },
            'response':function(response){
                // refresh token
                storedToken=localStorageService.get('token');
                receivedToken=response.headers('http_authorization');
                if(receivedToken){
                    receivedToken=receivedToken.split(" ")[1];
                    if (receivedToken&&storedToken !== receivedToken){
                        localStorageService.set('token',receivedToken);
                    }
                }
             //    $timeout(function(){
             //    	if(response.config.url.indexOf('api') > -1)
             //    		$requestLog.add({ url: response.config.url, method: response.config.method, status: response.status, data: response.data }); 
            	// })
                return response
            },
            'responseError': function(response) {
                if(response.status === 401 || response.status === 403) {
                    localStorageService.remove('token')
                    $location.path('/login/');
                }
                return $q.reject(response);
            }
        };
    }]);

}])
.run(['$rootScope', 'authService', 'localStorageService', 'jwtHelper', 'accountService', '$injector', function($rootScope, authService, localStorageService, jwtHelper, accountService, $injector){

	$rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams) {

            // Prevent unauthorized access
            if(!toState.skipAuthorization){
                
                // Is authorized
                if (!authService.isAuthorized()){
                	
                	// save destination to redirect after authorization 
                	$rootScope.returnState = toState;
                	$rootScope.returnParams = toParams;
                    
                    // redirect to login
                    return $rootScope.$state.go('root.login');

                }

                // Ensure user profile loaded
	            if(!$rootScope.user)
	            	authService.refresh();

            }

    });



	var unbindAuthSuccess = $rootScope.$on('auth:success', function(){
		
		var UserService = $injector.get("UserService");
		UserService.get().then(function(user){
			$rootScope.user = user;
		});

		var CompanyService = $injector.get("CompanyService");
		CompanyService.get().then(function(profile){
			$rootScope.user = profile;
		})

		accountService.get().then(function(profile){
			//$rootScope.user = profile;
		})
	});


    $rootScope.logout=function(){
        authService.logout();
        $rootScope.$state.go('root.login');
    }

    $rootScope.$on('$destroy', function(){
		unbindAuthSuccess();
    });

}]);

// taken from angular-jwt package 
// https://github.com/auth0/angular-jwt

angular.module('angular-jwt', [])
  .service('jwtHelper', function() {

    this.urlBase64Decode = function(str) {
		var output = str.replace(/-/g, '+').replace(/_/g, '/');
			switch (output.length % 4) {
			case 0: { break; }
			case 2: { output += '=='; break; }
			case 3: { output += '='; break; }
			default: {
			  throw 'Illegal base64url string!';
			}
		}
		return decodeURIComponent(escape(window.atob(output))); //polifyll https://github.com/davidchambers/Base64.js
    }


    this.decodeToken = function(token) {
      var parts = token.split('.');

      if (parts.length !== 3) {
        throw new Error('JWT must have 3 parts');
      }

      var decoded = this.urlBase64Decode(parts[1]);
      if (!decoded) {
        throw new Error('Cannot decode the token');
      }

      return JSON.parse(decoded);
    }

    this.getTokenExpirationDate = function(token) {
      var decoded;
      decoded = this.decodeToken(token);

      if(typeof decoded.exp === "undefined") {
        return null;
      }

      var d = new Date(0); // The 0 here is the key, which sets the date to the epoch
      d.setUTCSeconds(decoded.exp);

      return d;
    };

    this.isTokenExpired = function(token, offsetSeconds) {
      var d = this.getTokenExpirationDate(token);
      offsetSeconds = offsetSeconds || 0;
      if (d === null) {
        return false;
      }

      // Token expired?
      return !(d.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
    };
});
// .factory('authorization', ['$rootScope', '$state', 'AuthService',
//     function ($rootScope, $state, AuthService) {
//         return {
//             authorize: function () {
//                 return;
//                 var identity = AuthService.identity();
            
//                 if ($rootScope.toState.data && $rootScope.toState.data.roles && $rootScope.toState.data.roles.length > 0) {
                
//                     var roles = angular.copy($rootScope.toState.data.roles);
//                     AuthService.isUserInRoles(roles).then(function (hasRoles) {
//                         if (identity) {
//                             if (hasRoles === false) {
//                                 $state.go('root.accessdenied');
//                             }
//                         } else {
//                             // track state
//                             $rootScope.returnToState = $rootScope.toState;
//                             $rootScope.returnToStateParams = $rootScope.toStateParams;
                        
//                             // redirect to signin
//                             $state.go('root.login');
//                         }

//                     });

//                 }

//             }
//         };
//     }])