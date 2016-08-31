angular.module('app.controllers.recommendations.strategies.strategy1', [])

    .controller('strategy1Ctrl', [
        '$scope', '$rootScope', 'FormService', 'uiGridConstants', '$http', '$q', 'seriesService', '$timeout', '$window', 'UtilityService',function ($scope, $rootScope, FormService, uiGridConstants, $http, $q, seriesService, $timeout, $window,UtilityService) {
            var cancelLoad = $q.defer();
            $scope.compareConfig = { mode: 'day', minMode: 'day', maxMode: 'year', dt1: moment().valueOf(), dt2: moment().valueOf() };
            $scope.time = 0;
            $scope.sliderConfig = {
                floor: 0, ceil: 4, onChange: function () { $scope.change(); }, showTicks: true, showTicksValues: true,
                translate: function(value) {
                    switch (value) {
                        case 0: return '0h';
                        case 1: return '30m';
                        case 2: return '1h';
                        case 3: return '1:30';
                        case 4: return '2h';
                    }
                }
            }

            $scope.load = function () {
                $scope.loading = true;
                $http.get('/api/stratege/0', { timeout: cancelLoad.promise }).then(function (result) {
                   $scope.loading = false;
                   $scope.resultData = result;
                   $scope.applyCompare();
                });

            }
            $scope.load();

            // Start with utc offset 8 hours to match Highcharts global configuration
            var pointStart = moment().utc().utcOffset(-480).startOf('day').valueOf();
            var pointInterval = 3600 * 1000;

            $scope.chartOptions1 = {
                options: {
                    chart: {
                        alignTicks: true, spacingBottom: 15,
                        spacingTop: 0,
                        spacingLeft: 0,
                        spacingRight: 0
                    },
                    title: null,
                    legend: {
                        enabled: true,
                        layout: 'horizontal',
                    },
                    plotOptions: {
                        series: {
                            pointStart: pointStart,
                            pointInterval: pointInterval
                        }
                    },
                    xAxis: {
                        showFirstLabel: true, showLastLabel: false,
                        tickWidth: 0, min: pointStart,
                        startOnTick: true, endOnTick: true,
                        type: 'datetime',
                        tickInterval: 60 * 60 * 1000 * 2,
                        labels: {
                            rotation: 0,
                            y: -5,
                            x: 5,
                            align: 'left',
                            formatter: function () {
                                return Highcharts.dateFormat('%H:%M', this.value);
                            }
                        }
                    },
                    yAxis: {
                        title: { text: '' }, gridLineWidth: 1, minorGridLineWidth: 0, min: 0, labels: { align: 'left', x: 5, y: -5 }, showFirstLabel: false, showLastLabel: false
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.y:.2f}kW</b><br>' ,
                        shared: true, followPointer: true, crosshairs: {
                            color: 'green',
                            dashStyle: 'dash'
                        },
                    },
                    credits: false
                },
                series: [
                    {
                        name: moment($scope.compareConfig.dt1).utc().utcOffset(-480).format('MMM DD, YYYY'),
                        data: [], // 24 hours
                        color: Highcharts.getOptions().colors[1]
                    },
                    {
                        name: moment($scope.compareConfig.dt2).utc().utcOffset(-480).format('MMM DD, YYYY'),
                        data: [],
                        color: Highcharts.getOptions().colors[2]
                    }
                ]
            }

            $scope.setMode = function (mode) {
                switch (mode) {
                    case 'day':
                        $scope.compareConfig.mode =
                        $scope.compareConfig.minMode =
                        $scope.compareConfig.maxMode = 'day';
                        break;
                    case 'week':
                        $scope.compareConfig.mode = 'week';
                        $scope.compareConfig.minMode =
                        $scope.compareConfig.maxMode = 'day';
                        break;
                    case 'month':
                        $scope.compareConfig.mode =
                        $scope.compareConfig.minMode = mode;
                        $scope.compareConfig.maxMode = 'year';
                        break
                }
            }

            $scope.formatPeriod = function (date) {
                var result = '', dt = moment(date).utc().utcOffset(-480);
                switch ($scope.compareConfig.mode) {
                    case 'day':
                        result = dt.format('MMM DD, YYYY');
                        break;
                    case 'week':
                        result = 'Week ' + dt.week();
                        break;
                    case 'month':
                        result = dt.format('MMMM YYYY');
                        break;
                }
                return result;
            };

            $scope.applyCompare = function () {

                var pointStart,
                    pointStart2,
                    tickInterval,
                    pointInterval,
                    name1,
                    name2,
                    data1,
                    data2,
                    formatter,
                    date1 = moment($scope.compareConfig.dt1).utc().utcOffset(-480),
                    date2 = moment($scope.compareConfig.dt2).utc().utcOffset(-480);

                var displaySeries=function(start1,start2,mode){
                    var interval=60*60*1000*24; // one day
                    var pointInterval="15m";
                    if(mode=="week"){
                        interval*=7;
                    }else if(mode=="month"){
                        interval*=30;
                        pointInterval="60m";
                    }
                    $q.all(
                        [
                            seriesService.load($rootScope.$stateParams.id,start1,start1+interval,{interval:pointInterval}),
                            seriesService.load($rootScope.$stateParams.id,start2,start2+interval,{interval:pointInterval}),
                            UtilityService.getEnergyPrice()
                        ]
                    ).then(function(result){
                        var series1=((result[0][0]||{}).points||[]).reverse(),
                            series2=((result[1][0]||{}).points||[]).reverse(),
                            data1 = [0],
                            data2 = [0];

                        $scope.range1={};
                        $scope.range2={};

                        $scope.price=result[2];

                        if(series1.length){

                            data1 =_.map(series1,function(d){
                                return d[1];
                            })

                            var time=series1[0][0];
                            var p=UtilityService.isSummer(time) ? $scope.price['s'] : $scope.price['ns'];
                            $scope.range1.stats=UtilityService.getAreaUnderCurve(series1,{partitions:true});
                            $scope.range1.charge={'h':$scope.range1.stats['h']*p['h'],'m':$scope.range1.stats['m']*p['m'],'l':$scope.range1.stats['l']*p['l']};
                        }

                        if(series2.length){

                            data2 = _.map(series2,function(d){
                                return d[1];
                            });

                            var time=series2[0][0];
                            var p=UtilityService.isSummer(time) ? $scope.price['s'] : $scope.price['ns'];
                            $scope.range2.stats=UtilityService.getAreaUnderCurve(series2,{partitions:true});
                            $scope.range2.charge={'h':$scope.range2.stats['h']*p['h'],'m':$scope.range2.stats['m']*p['m'],'l':$scope.range2.stats['l']*p['l']};
                        }

                        $scope.chartOptions1.series[0].data  = data1;
                        $scope.chartOptions1.series[1].data  = data2;

                    });
                }

                // Close Compare configuration Popup
                $scope.isCompareOpen = false;

                switch ($scope.compareConfig.mode) {
                    case 'day':
                        // start of day
                        pointStart=date1.startOf('day').valueOf();
                        pointStart2=date2.startOf('day').valueOf();
                      // tick interval
                        //tickInterval = 60 * 60 * 1000 * 4; // *2 to fit hours

                        // point interval
                        pointInterval = 60 * 60 * 1000/4;

                        // Serie name for Tooltip and Legend
                        name1 = date1.format('MMM DD, YYYY');
                        name2 = date2.format('MMM DD, YYYY');
                       // label format
                        format = '%H:%M'; // hour & minutes

                        break;
                    case 'week':
                        // start of week
                        pointStart = date1.startOf('isoweek').valueOf();
                        pointStart2=date2.startOf('isoweek').valueOf();
                        // tickInterval = 60 * 60 * 24 * 1000;
                        pointInterval = 60 * 60  * 1000/4;

                        // Serie name for Tooltip and Legend
                        name1 = 'Week ' + date1.week();
                        name2 = 'Week ' + date2.week();

                         // label format
                        format = '%A'; // Week number
                        break;
                    case 'month':
                        // start of month
                        pointStart = date1.startOf('month').valueOf();
                        pointStart2= date2.startOf('month').valueOf();
                        // tick interval
                        // tickInterval = 60 * 60  * 1000;

                        // point interval
                        pointInterval = 60 * 60 * 1000;

                        // Serie name for Tooltip and Legend
                        name1 = date1.format('MMMM YYYY');
                        name2 = date2.format('MMMM YYYY');

                        // label format
                        format = '%e'; // Month
                        break;
                }
               $scope.chartOptions1.options.xAxis.min = pointStart;

                // start of day
                $scope.chartOptions1.options.plotOptions.series.pointStart = pointStart;

                // tick interval
                $scope.chartOptions1.options.xAxis.tickInterval = tickInterval;
                // point interval
                $scope.chartOptions1.options.plotOptions.series.pointInterval = pointInterval;

                // Serie name for Tooltip and Legend
                $scope.chartOptions1.series[0].name = name1;
                $scope.chartOptions1.series[1].name = name2;

                displaySeries(pointStart,pointStart2,$scope.compareConfig.mode);

                $scope.chartOptions1.options.xAxis.labels.formatter = function () {
                    return Highcharts.dateFormat(format, this.value);
                };
            };

            $scope.getDatepickerClass = function (date, mode) {
                return '';
            }

            $timeout(function () {
                angular.element($window).triggerHandler('resize');
            });

            $scope.onCancelStrategy = function () {
                $rootScope.$state.go('root.home.unit.recommendations.strategies');
            }

            $scope.$on('$destroy', function () {
                cancelLoad.resolve();
            });
    }])