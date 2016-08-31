angular.module('app.controllers.reports.nav', [])

    .controller('reportsNavCtrl', [
        '$scope', '$rootScope', '$http', '$filter', '$timeout', 'EnergyUnitFactory', '$state', '$ionicActionSheet', '$ionicHistory',
         function($scope, $rootScope, $http, $filter, $timeout, EnergyUnitFactory, $state, $ionicActionSheet, $ionicHistory) {

            $scope.reportUrl = null;

                
            EnergyUnitFactory.getByType(1).then(function(result) {

                //Redirect to first applicable Building if received 0 for ID
                if ($rootScope.$stateParams.id == 0) {

                    $rootScope.$state.go($rootScope.$state.current.name, { id: result[0].id }, {location:'replace', reload:true});
                    $rootScope.building = result[0];
                }
                else{

                    // Get report link PDF
                    var current = _.find(result,function(d){
                        return $rootScope.$stateParams.id == d.id;
                    });
                    if(current.buildingparam > 0){
                        console.log('current.buildingparam ' , current.buildingparam);
                        EnergyUnitFactory.getDetail(current.id).then(function(res){
                            console.log('res ' , res.objects[0]);

                            $scope.reportUrl = res.objects[0].report;
                        });
                    }

                }

                $scope.items = result;

            });


            /********************************************************************
             *
             *
             *  Mobile related
             *
             *
            *********************************************************************/

            $scope.linkSelected = { name: 'Select Report' };

            $scope.links = [
                { text: '综述指标', href: 'root.reports.summary' },
                /*{ text: '最新动态', href: 'root.reports.trend' },*/
                { text: '能耗构成', href: 'root.reports.disagg' },
                { text: '能耗透视', href: 'root.reports.heatmap' },
                { text: '历史比较', href: 'root.reports.monthly' },
                { text: '能耗对比', href: 'root.reports.regular' }
            ];

            $scope.toggleLinks = function() {
                $scope.linksShown = !$scope.linksShown;
            };

            $scope.areLinksShown = function() {
                return $scope.linksShown;
            };

            $scope.onLinkClicked = function(link){
                $scope.linkSelected = link;
                $scope.linksShown = false;
                $state.go(link.href);
            }


            $scope.showLinks = function() {

                // Show the action sheet
                var hideSheet = $ionicActionSheet.show({
                    buttons: $scope.links,
                    titleText: 'Select Report',
                    cancelText: 'Cancel',
                    cancel: function() {},
                    buttonClicked: function(index) {
                        $state.go($scope.links[index].href);
                        return true;
                    }
                });

            };


        }
    ]);
