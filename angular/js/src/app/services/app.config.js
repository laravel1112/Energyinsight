// TODO: RESERVED: EXTERNAL API CALLS FUNCTIONALITY
angular.module('app.config', [])
.factory('configService', ['$q', '$rootScope', '$http', function ($q, $rootScope, $http) {

	var load, settings = {};

	load = function(){
		return $http.get('static/js/config.json');
	}

	var toReturn=load().then(
		function(res){
			return res.data
		},
		function(){

		}
	);

	return {
		settings: toReturn
	}
	

}])
// .factory('rewriteService', ['$q', 'platformService', '$injector', function($q, platformService, $injector){

// 	var rewriteInjector = {
// 		request: function(config) {
// 			if(platformService.isMobile() && config.url){

// 				//var configService = $injector.get('configService');

// 				//Adjust request url occording to config.json 
// 				// if(config.url.indexOf('api/') > -1 || config.url.indexOf('api-token-auth') > -1){
// 				// 	config.url = '/' +
// 				// 	 	(config.url.indexOf('/') == 0 ? config.url.substring(1) : config.url);
// 				// 	// config.url = 
// 				// 	// 	'http://' + 
// 				// 	// 	(configService.settings().API_IP ? configService.settings().API_IP + ':' + configService.settings().API_PORT : 'localhost:8000') + '/'  + 
// 				// 	// 	(config.url.indexOf('/') == 0 ? config.url.substring(1) : config.url);
// 				// }

// 				// Disable authorization
// 				// if(config.url.indexOf('api/getSeries/') > -1){
// 				// 	config.skipAuthorization = true;
// 				// }
// 			}
//             return config;
//         },
//         response:function(response){
//         	return response;
// 		},
// 		responseError: function(response){
//             return $q.reject(response);
// 		}
// 	};

// 	return rewriteInjector;

// }])
// .config(['$httpProvider', function($httpProvider) {  
//     $httpProvider.interceptors.push('rewriteService');
// }]);