angular.module('app.nav', [])
	.factory('navDelegateService', ['$q', '$http', '$ionicHistory', '$templateCache', 
		function($q, $http, $ionicHistory, $templateCache) {
			var _data = [];
			var _current = {};

			return {
				get: function() {
					return _current;
				},
				load: function(url, ctrl){
					_current = {url: url, ctrl: ctrl};
				}
			}
		}
	])
	.provider('navDelegate', [function(){
		
		var _current = {};

	    this.$get = function() {
	        return {
			        	current: {
				            url: 'static/views/nav.html',
				            ctrl: 'navCtrl'
			        	}
	        		}
	    };


	}])
	.run(['$rootScope', '$templateCache',function($rootScope, $templateCache){

		$rootScope.navDelegate = function(){
			return navDelegateProvider;
		}

	}]);

