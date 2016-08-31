angular.module('app.controllers.recommendations.nav', [])

    .controller('recommendationsNavCtrl', [
        '$scope', '$rootScope', 'EnergyUnitFactory', function($scope, $rootScope, EnergyUnitFactory) {
            EnergyUnitFactory.getByType(1).then(function(result) {

                //Redirect to first applicable Building if received 0 for ID
                if ($rootScope.$stateParams.id == 0) {
                    $rootScope.$state.go($rootScope.$state.current.name, { id: result[0].id });
                }

                $scope.items = result;

            });

            $scope.selectBuilding = function(building) {
                $rootScope.$state.go($rootScope.$state.current.name, { id: building.id });
            }

        }
    ])
