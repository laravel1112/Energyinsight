angular.module('app.controllers.recommendations.strategies.strategy3', [])

    .controller('strategy3Ctrl', ['$scope', '$rootScope', 'FormService', 'uiGridConstants', '$http', '$q', '$window', '$timeout', 'seriesService','UtilityService',function ($scope, $rootScope, FormService, uiGridConstants, $http, $q, $window, $timeout,seriesService,UtilityService) {

        var cancelLoad = $q.defer();
        $scope.dateConfig = { selected: null, minDate: -1 };

        $scope.sliderConfig = {
            minValue: 9, maxValue: 18,
            options: {
                id: 'slider1', floor: 0, ceil: 23, showTicks: true, showTicksValues: true, step: 1,
                onChange: function (id) {
                    $scope.change();
                }
            }
        }

        // Start with utc offset 8 hours to match Highcharts global configuration
        var pointStart = moment().utc().utcOffset(-480).startOf('day').valueOf();
        var pointInterval = 3600 * 1000;

        $scope.chartOptions1 = {
            options: {
                chart: {
                    alignTicks: true, spacingBottom: 15, spacingTop: 0, spacingLeft: 0, spacingRight: 0,
                    type: 'column'
                },
                title: null,
                legend: {
                    enabled: true,
                    layout: 'horizontal',
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true,
                            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                            format: '{point.y:.2f}' ,
                            style: {
                                textShadow: '0 0 3px black'
                            }
                        }
                    }
                },
                xAxis: {
                    categories: [
                        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Hollidays'
                    ],
                    tickWidth: 0,
                    startOnTick: true, endOnTick: true,
                    labels: {
                        rotation: 0,
                        align: 'center'
                    }
                },
                yAxis: {
                    title: { text: '' }, gridLineWidth: 1, minorGridLineWidth: 0, min: 0, labels: { align: 'left', x: 5, y: -5 }, showFirstLabel: false, showLastLabel: false
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y:.2f}kWh</b><br>' ,
                    shared: true, followPointer: true, crosshairs: {
                        color: 'rgba(0,0,0,0.05)',
                        dashStyle: 'dash'
                    },
                },
                credits: false
            },
            series: [
                {
                    name: '白天用电',
                    data: [],
                    color: Highcharts.getOptions().colors[1]
                },
                {
                    name: '晚间用电',
                    data: [],
                    color: Highcharts.getOptions().colors[0]
                }
            ]
        }

        $scope.getDateRange = function () {
            if ($scope.events && $scope.events.length > 0)
                return moment($scope.events[0].date).format('MMM DD, YYYY') + ' - ' + moment($scope.events[$scope.events.length - 1].date).format('MMM DD, YYYY');
            else
                return '---';
        };

        $scope.change=function(){
            var dailyDayAndNight=[];
            for(key in $scope.highchartData){
                if($scope.highchartData.hasOwnProperty(key)){
                    var d=$scope.highchartData[key];
                    var token={day:{sum:0,count:0},night:{sum:0,count:0}};
                    var energy={};
                    d.forEach(function(m){
                        var h=new Date(m[0]).getHours();
                        if(h>=$scope.sliderConfig.minValue&&h<$scope.sliderConfig.maxValue){
                            //Day time
                            token['day']['sum']+=m[1];
                            token['day']['count']++;
                        }else{
                            token['night']['sum']+=m[1];
                            token['night']['count']++;
                        }
                    });
                    energy['day']=token.day.sum/token.day.count*($scope.sliderConfig.maxValue-$scope.sliderConfig.minValue);
                    energy['night']=token.night.sum/token.night.count*(24-($scope.sliderConfig.maxValue-$scope.sliderConfig.minValue));
                    dailyDayAndNight.push([key,energy]);
                }
            }
            var weekdaySplit=_.groupBy(dailyDayAndNight,function(d){
                var date=moment(new Date(d[0]));
                return date.format('E');
            })
            var data1=[];data2=[];
            for(key in weekdaySplit){
                if(weekdaySplit.hasOwnProperty(key)){
                    var d=weekdaySplit[key];
                    var energy={day:0,night:0};
                    d.forEach(function(e){
                        energy['day']+=e[1]['day']||0;
                        energy['night']+=e[1]['night']||0;
                    });
                    data1.push(energy['day']);
                    data2.push(energy['night']);
                }
            }
            $scope.chartOptions1.series[0].data = data1;
            $scope.chartOptions1.series[1].data = data2;

        }

        $scope.load = function(dateStart, dateEnd){
            dateStart = moment(dateStart);
            dateEnd = moment(dateEnd);

            seriesService.load($rootScope.$stateParams.id,dateStart.valueOf(),dateEnd.valueOf(),{interval:"15m"}).then(function(result){

                var data=result[0].points.reverse();
                var groupedData=_.groupBy(data,function(d){
                    var date=new Date(d[0]);
                    var day="0"+date.getDate();
                    var month="0"+(date.getMonth()+1);
                    var year = date.getFullYear();
                    return year + "/" + month.slice(-2) + "/" + day.slice(-2); // ex: 2015/11/11
                });
                $scope.highchartData=groupedData;
                var groupedEnergy=[]
                for (key in groupedData){
                    if(groupedData.hasOwnProperty(key)){
                        var d=groupedData[key];
                        var energy= UtilityService.getAreaUnderCurve(d,{partitions:true});
                        groupedEnergy.push([key,energy]);
                    }
                }
                $scope.weekdayEnergy={};
                groupedData=_.groupBy(groupedEnergy,function(d){
                    var date=moment(new Date(d[0]));
                    return date.format('E');
                })
                for (key in groupedData){
                    if(groupedData.hasOwnProperty(key)){
                        var d=groupedData[key];
                        var energy={h:0,m:0,l:0};
                        d.forEach(function(e){
                            energy['h']+=e[1]['h']||0;
                            energy['m']+=e[1]['m']||0;
                            energy['l']+=e[1]['l']||0;
                        });
                        $scope.weekdayEnergy[key]=energy;
                    }
                }
                $scope.change();

            })
        }

        $scope.applyDateRange = function () {
            var data1, data2;

            //TODO: Use this daterange for API requests
            //TODO: Fine tune daterange picker
            var dateStart = moment($scope.events[0].date);
            var dateEnd = moment($scope.events[$scope.events.length - 1].date);

            // Close Compare configuration Popup
            $scope.isCompareOpen = false;
            $scope.load(dateStart, dateEnd);
        };


        // initial load
        $scope.events = [
            { date: moment().startOf('isoweek'), status: 'full', label: 'start' },
            { date: moment().endOf('isoweek'), status: 'full', label: 'start' }
        ];
        $scope.applyDateRange();

        /**********************************
        *
        * WARNING: BUG: First day of the month always selected: https://github.com/angular-ui/bootstrap/issues/3879
        *
        ***********************************/

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

        $scope.$watch('dateConfig.selected', function () {
            if (!$scope.dateConfig.selected) return;
            $scope.events = [];

            /*
            * week range selection
            */
            var selected = moment($scope.dateConfig.selected).clone().startOf('isoweek');

            if ($scope.start && $scope.end && $scope.start.valueOf() == selected.valueOf() && $scope.end.valueOf() != $scope.start.clone().endOf('isoweek').valueOf()) {
                $scope.start = $scope.end = null;
            }

            if (!$scope.start || $scope.start > selected || moment($scope.end).diff(selected, 'days') == 6) {
                $scope.start = selected;
                $scope.end = selected.clone().endOf('isoweek');
            } else {
                $scope.end = selected.clone().endOf('isoweek');
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
            $scope.dateConfig.selected = null;
        });

        $scope.onCancelStrategy = function () {
            $rootScope.$state.go('root.home.unit.recommendations.strategies');
        }

        $scope.$on('$destroy', function () {
            cancelLoad.resolve();
        });

    }])