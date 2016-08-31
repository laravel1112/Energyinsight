angular.module('daterange', [])
    .directive('daterange', ['$parse', '$timeout', '$window', function ($parse, $timeout, $window) {
        return {
            template: '<uib-datepicker template-url="template/daterange-datepicker.html" ng-model="config.selected" min-date="config.minDate" max-date="config.maxDate" starting-day="config.startingDay" show-weeks="config.showWeeks" class="datepicker" custom-class="getDayClass(date, mode)"></uib-datepicker>',
            replace: false,
            scope: { config: "=daterange" },
            link: function ($scope, element, attrs) {
                $scope.events = [];
                $scope.config.showWeeks = $scope.config.showWeeks || true; 
                $scope.config.startingDay = $scope.config.startingDay || 1; 


                $scope.config.getDateRange = function () {
                    if ($scope.events && $scope.events.length > 0)
                        return moment($scope.events[0].date).format('MMM DD, YYYY') + ' - ' + moment($scope.events[$scope.events.length - 1].date).format('MMM DD, YYYY');
                    else
                        return '---';
                }

                $scope.config.setRange = function(start, end){
                    $scope.start = start;
                    $scope.config.selected = end;
                    $scope.processRangeSelection(true);

                    $timeout(function(){
                        $scope.$broadcast('refreshDatepickers');
                    });
                }

                $scope.config.getStart = function(){
                    return moment($scope.events[0].date);
                }

                $scope.config.getEnd = function(){
                    return moment($scope.events[$scope.events.length - 1].date);
                }

                $scope.getDayClass = function (date, mode) {
                    if (!$scope.events) return '';

                    if (mode === 'day') {
                        for (var i = 0; i < $scope.events.length; i++) {
                            if (moment(date).startOf('day').valueOf() === moment($scope.events[i].date).startOf('day').valueOf()) {
                                return $scope.events[i].status;
                            }
                        }
                    }
                    return '';
                };

                $scope.processRangeSelection = function(reset){
                    if (!$scope.config.selected) return;
                    $scope.events = [];

                    if(reset)
                       $scope.end = null; 

                    if (!$scope.start || $scope.start > $scope.config.selected || $scope.end) {
                       $scope.start = $scope.config.selected;
                       $scope.end = null;
                    } else {
                       $scope.end = $scope.config.selected;
                    }


                    if ($scope.start) 
                        $scope.events.push({ date: $scope.start, status: 'full', label: 'start' })
                    
                    if ($scope.end) {
                        $scope.events.push({ date: $scope.end, status: 'full', label: 'end' })

                        var start = moment($scope.start);
                        var end = moment($scope.end);
                        var diff = moment($scope.end).diff($scope.start, 'days');
                        var nexDate = start.clone();
                        for (var i = 1; i <= diff; i++) {
                            nexDate = start.add(1, 'days');
                            $scope.events.push({ date: nexDate.clone(), status: 'partially' })
                        }

                    }
                    $scope.config.selected = null;
                }

                $scope.$watch('config.selected', function () {
                    $scope.processRangeSelection();
                });

            }
        }
    }]);