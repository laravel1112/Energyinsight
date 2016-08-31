angular.module('app.controllers.account.login', [])
.controller('loginCtrl',['$scope', '$rootScope','$state', 'authService', 'localStorageService', 
	function ($scope, $rootScope, $state,authService, localStorageService) {
	    $scope.credentials = {
	        username: 'demouser',
	        password: 'demouser'
	    };

	    $scope.login=function(){
	        authService.login($scope.credentials).then(
	            function(token){
	                $rootScope.$state.go('root.home')
	            },
	            function(err){
	                console.log(err);
	                $scope.credentials.password = '';
	            }
	        )

	    }
	}
]);
