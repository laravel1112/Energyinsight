angular.module('app.controllers.news.summary', [])

    .controller('newsCtrl', [
    	'$scope', '$rootScope', '$state', '$timeout', '$http', '$window', 'uiGridConstants', 'EnergyUnitFactory', 'AllMetersService','MiscSelectionFactory', 'geoService', '$mdSidenav', 'platformService', '$templateCache',
		function ($scope, $rootScope, $state, $timeout, $http, $window, uiGridConstants, EnergyUnitFactory, AllMetersService,MiscSelectionFactory, geoService, $mdSidenav, platformService, $templateCache) {
			$scope.newsItems = [];
			
			$scope.convertTo = function (arr, key, dayWise) {
                var groups = {};
                for (var i=0;l= arr.length, i<l;i++) {
                    console.log(arr[i][key]);

                    arr[i][key] = moment(arr[i][key]).format('MMM DD, YYYY');
                    groups[arr[i][key]] = groups[arr[i][key]] || [];
                    groups[arr[i][key]].push(arr[i]);
                }
                return groups;
            };


            // Watch for authorization to load data
            $scope.$watch(function(){
                    return $rootScope.isAuthorized();        
                }, 
                function(value){
                    if(value)
                        $scope.load();
                }
            );

            // News category color 
            $scope.getCategoryColor = function(categ){
                switch(categ){
                    case '建议': return 'orange';
                    case '新闻': return 'blue';
                    case '报警': return 'magenta';
                    default: return '#aaa';
                }
            }

            $scope.load = function(){
                //TODO: Cache news 
                MiscSelectionFactory.get({name:'blog_post'}).then(function(result){
                    $scope.originalItems = result.objects;
                    $scope.newsItems=$scope.convertTo(result.objects, 'created', false);
                })
            }
		}
	]);