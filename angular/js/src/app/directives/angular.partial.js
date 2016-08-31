angular.module('partial', [])
.directive('partial', ['$rootScope', '$injector', '$compile', '$injector', function ($rootScope, dialogService, $compile, $injector) {
    return {
        restrict: "EA",
        scope: { config: '=partial' },
        link: function ($scope, $element, $attrs) {
            //watch for config changes
            $scope.$watch('config', function (value) {
                if (!$scope.config || !$scope.config.view) {
                    console.log('empty');
                    $element.empty();
                    return;
                }

                var template = '<div ng-include="\'' + $scope.config.view + '\'" ' + ($scope.config.ctrl ? ' ng-controller="' + $scope.config.ctrl + '" ' : ' ') + '></div>';
                var cTemplate = $compile(template)($scope);
                $element.append(cTemplate);
            });

        }
    };
}]);