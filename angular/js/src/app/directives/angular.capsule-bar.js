angular.module('capsuleBar', [])
    .directive('capsuleBar', function() {
        return {
            scope: { 'options': '=capsuleBar' },
            replace: true,
            template: '<div class="capsule-bar">' +
                        '<span class="title {{options.titlePosition}}" ng-bind="options.title"></span>' +
                        '<div class="capsule" ng-repeat="item in items" ng-style="item.style"></div>' +
                        '<span class="value" ng-style="options.valueStyle" ng-bind="options.value"></span>' + 
                      '</div>',
            link: function ($scope, element, attrs) {

                $scope.drawCapsules = function () {
                    var opts = $scope.options,
                        max = opts.max || 100,          // chart max value
                        capsules = opts.capsules || 10, // chart capsules
                        value = opts.value || 0,        // chart value
                        spacing = 3,                    // HARDCODE: spacing between capsules
                        titleHeight = 30,               // HARDCODE: title height  see: .capsule-bar .title
                        valueHeight = 30,               // HARDCODE: value height  see: .capsule-bar .value
                        titlePosition = opts.value || 'top'

                    // capsules
                    $scope.items = [];

                    // how many colored capsules to show
                    var count = value / (max / capsules);

                    // capsule height to fit container
                    var parentHeight = $(element[0]).parent().height();
                    var capHeight = (parentHeight - (spacing * capsules) - titleHeight - valueHeight) / capsules;

                    // gradient helper
                    var cs = chroma.scale(['green', 'orange', 'red']).mode('lab').correctLightness(false);

                    // building capsule bar
                    for (var i = 0; i < capsules; i++) {

                        // capsule default style
                        var item = { style: { height: capHeight + 'px', 'margin-bottom': spacing + 'px' } };

                        // capsule default color
                        angular.extend(item.style, { 'background': item.bgColor || '#eee' });

                        // capsule value gradient color
                        if (count > i)
                            angular.extend(item.style, { 'background-color': cs(i / 10).hex() });

                        // title on right side style
                        if (opts.titlePosition == 'right') {
                            var width = ($(element).width() - 18);
                            angular.extend(item.style, { 'width': width + 'px' });
                            $scope.options.valueStyle = { width: width + 'px' };
                        }

                        $scope.items.push(item);
                    }

                    $scope.items.reverse();
                };

                $scope.$watch('options', function (newValue, oldValue) {
                    $scope.drawCapsules();
                });

            }
        }
    });