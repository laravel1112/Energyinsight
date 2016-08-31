angular.module('app.controllers.news.details', [])

    .controller('newsDetailsCtrl', [
    	'$scope', '$rootScope', '$state', '$timeout', '$http', '$window', 'uiGridConstants', 'EnergyUnitFactory', 'AllMetersService','MiscSelectionFactory', 'geoService', '$mdSidenav', 'platformService', '$templateCache',
		function ($scope, $rootScope, $state, $timeout, $http, $window, uiGridConstants, EnergyUnitFactory, AllMetersService,MiscSelectionFactory, geoService, $mdSidenav, platformService, $templateCache) {
			$scope.newsItems = [];
			$scope.newsItem = {};
			

            //$scope.$on('$ionicView.enter', function(){
				MiscSelectionFactory.get({name:'blog_post'}).then(function(result){
					$scope.newsItems = result.objects;
					if($rootScope.$stateParams.id){
						$scope.newsItem = $scope.newsItems[$rootScope.$stateParams.id];
					}
	            })
			//});



			$scope.getNewsItem = function(){
				return $scope.newsItem;
			}
		}
	]);