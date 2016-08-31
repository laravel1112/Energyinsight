/**
 * Directive that handles file-type input ngmodel
 * NOTE: does not work with IE9 and below
 */
angular.module('fileInput', [])
.directive('fileInput', [function () {
    return {
        require: "ngModel",
        restrict: 'A',
        link: function ($scope, elem, attrs, ngModel) {
            elem.bind('change', function (event) {
                ngModel.$setViewValue(event.target.files[0]);
                $scope.$apply();
            });

            $scope.$watch(function () {
                return ngModel.$viewValue;
            }, function (value) {
                if (!value) {
                    elem.val('');
                }
            });
        }
    };
}]);
