angular.module('busy', [])
    .directive('busy', function () {
        return {
            scope: { busy: '=', onCancel: '=' },
            replace: true,
            template: '<div class="busy" ng-show="busy">' +
                      '     <div class="centered text-center">' +
                      '          <div class="centered-item">' +
                      '              <div>Loading... Please wait</div><br/>' +
                      '              <img src="/static/image/busy.gif"/><br/><br/><br/>' +
                      '              <button ng-show="onCancel" class="btn btn-default btn-flat btn-light-green" style="width: auto" ng-click="cancel()">Cancel</button>' +
                      '          </div>' +
                      '      </div>' +
                      '</div>',
            link: function ($scope, element, attrs) {
                $scope.cancel = function() {
                    if ($scope.onCancel) {
                        $scope.onCancel();
                    }
                }
            },
            controller: ['$scope', '$rootScope', '$timeout', function ($scope, $rootScope, $timeout) {
                
            }]
        }
    });