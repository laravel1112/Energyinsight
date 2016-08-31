angular.module('app.controllers.recommendations.strategies.strategy5', [])

    .controller('strategy5Ctrl', ['$scope', '$rootScope', 'FormService', 'uiGridConstants', '$http', '$q', '$timeout', '$window', 'seriesService', 'UtilityService', function ($scope, $rootScope, FormService, uiGridConstants, $http, $q, $timeout, $window, seriesService, UtilityService) {

        var cancelLoad = $q.defer();

        $scope.compareWith = 1; // 1 month

        // Start with utc offset 8 hours to match Highcharts global configuration
        $scope.pointStart = moment().utc().utcOffset(-480).startOf('day').valueOf();
        $scope.pointEnd = moment().utc().utcOffset(-480).startOf('day').valueOf();
        var pointInterval = 3600 * 1000;

        // dateConfig altered by "angular.daterange.js" at runtime
        $scope.dateConfig = { selected: null, maxDate: moment() };


        $scope.load = function () {
            $timeout(function(){
                $scope.dateConfig.setRange(moment().subtract(1, 'week'), moment());
                $scope.applyDateRange();
            })
        }
        $scope.load();

        // DEMO: TODO: Ensure datasource and transformation valid
        $scope.displaySeries=function(startTime,endTime){
            var interval=60*60*1000*24; // one day
            var pointInterval="60m";

            // if(mode=="week"){
            //     interval*=7;
            // }else if(mode=="month"){
            //     interval*=30;
            //     pointInterval="60m";
            // }
            $q.all([seriesService.load($rootScope.$stateParams.id,startTime,endTime,{interval:pointInterval}), // This is building series.
                    seriesService.load($rootScope.$stateParams.id,startTime,endTime,{interval:pointInterval,predict:true}), // This is predicted building
                    seriesService.load($rootScope.$stateParams.id,startTime,endTime,{interval:pointInterval,disagg:"all"}), // This is the aggregated series;
                    seriesService.load($rootScope.$stateParams.id,startTime,endTime,{interval:pointInterval,predict:true,disagg:"all"}) // This is aggregated predicted series
                        ]).then(function(result){
                var series1=((result[0][0]||{}).points||[]).reverse();
                var series2=((result[1][0]||{}).points||[]).reverse();
                var original=UtilityService.getAreaUnderCurve(series1);
                var predict=UtilityService.getAreaUnderCurve(series2);
                // calculate the stats of each
                $scope.stats=[];
                var matching={};
                result[2].forEach(function(s){
                        var e=UtilityService.getAreaUnderCurve(s.points.reverse());
                        matching[s.usage]={name:s.usage,original:e};
                })
                result[3].forEach(function(s){
                        var e=UtilityService.getAreaUnderCurve(s.points.reverse());
                        if(!matching[s.usage]) matching[s.usage]={name:s.usage};
                        matching[s.usage]['predict']=e;
                })
                var chart2Data={categories:[],data1:[],data2:[]};
                for (var key in matching){
                    $scope.stats.push(matching[key]);
                    chart2Data.categories.push(matching[key]['name']);
                    chart2Data.data1.push(matching[key]['original']);
                    chart2Data.data2.push(matching[key]['predict']);
                }

                $scope.chartOptions1.series[0].data = series1;
                $scope.chartOptions1.series[1].data = series2;
                $scope.chartOptions3.series[0].data = [
                    { y: original, color: Highcharts.getOptions().colors[0] },
                    { y: predict, color: Highcharts.getOptions().colors[1] },
                ];
                $scope.chartOptions2.options.xAxis.categories=chart2Data.categories;
                $scope.chartOptions2.series[0].data=chart2Data.data1;
                $scope.chartOptions2.series[1].data=chart2Data.data2;

                //$scope.range1.stats=UtilityService.getAreaUnderCurve(series1,{partitions:true});
                //var p=UtilityService.isSummer(time) ? $scope.price['s'] : $scope.price['ns'];

                // $scope.range1.charge={'h':$scope.range1.stats['h']*p['h'],'m':$scope.range1.stats['m']*p['m'],'l':$scope.range1.stats['l']*p['l']};
                // var series2=result[1][0]||{}
                // series2=(series2.points||[]).reverse();
                // var time=series2[0][0];
                // $scope.chartOptions1.series[1].data =_.map(series2,function(d){
                //     return d[1];
                // })
                //$scope.range2.stats=UtilityService.getAreaUnderCurve(series2,{partitions:true});
                //var p=UtilityService.isSummer(time) ? $scope.price['s'] : $scope.price['ns'];

                //$scope.range2.charge={'h':$scope.range2.stats['h']*p['h'],'m':$scope.range2.stats['m']*p['m'],'l':$scope.range2.stats['l']*p['l']};
            });
        }

        $scope.applyDateRange = function () {
            var data1, data2;

            var dateStart = $scope.dateConfig.getStart();
            var dateEnd = $scope.dateConfig.getEnd();

            $scope.pointStart = dateStart.clone().valueOf();
            $scope.pointEnd = dateEnd.clone().valueOf();

            // Close Compare configuration Popup
            $scope.isCompareOpen = false;

            $scope.chartOptions1.options.xAxis.min = $scope.pointStart;
            $scope.chartOptions1.options.xAxis.max = $scope.pointEnd;

            // start of day
            $scope.chartOptions1.options.plotOptions.series.pointStart = $scope.pointStart;
            $scope.chartOptions1.options.plotOptions.series.pointEnd = $scope.pointEnd;

            // tick interval
            $scope.chartOptions1.options.xAxis.tickInterval = 3600 * 1000 * 24;

            // point interval
            $scope.chartOptions1.options.plotOptions.series.pointInterval = 3600 * 1000;

            $scope.displaySeries($scope.pointStart, $scope.pointEnd);
        }

        $scope.onCompare = function(){
            switch($scope.compareWith)
            {
                case 1:
                    break;
                case 3:
                    break;
                case 6:
                    break;
                case 12:
                    break;
            }
        }

        $scope.chartOptions1 = {
            options: {
                chart: { type: 'areaspline', alignTicks: true, spacingBottom: 15, spacingTop: 0, spacingLeft: 0, spacingRight: 0 },
                title: null,
                legend: {
                    enabled: true,
                    layout: 'horizontal',
                },
                plotOptions: {
                    series: { pointStart: $scope.pointStart, pointEnd: $scope.pointEnd, pointInterval: pointInterval },
                    areaspline: {
                        fillOpacity: 0.2, states: { hover: { enabled: false } }
                    }
                },
                xAxis: {
                    type: 'datetime',
                    min: $scope.pointStart, max: $scope.pointEnd,
                    showFirstLabel: true, showLastLabel: false, startOnTick: false, endOnTick: false, tickWidth: 0, tickInterval: 60 * 60 * 1000 * 2,
                    labels: {
                        rotation: 0,
                        y: -5,
                        x: 5,
                        align: 'left',
                        formatter: function () {
                            return Highcharts.dateFormat('%e %b', this.value);
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
                    name: 'before',
                    data: [],
                    dashStyle: 'dash',
                    lineWidth: 0.5
                },
                {
                    name: 'after',
                    data: [],
                    lineWidth: 1
                }
            ]
        }


        $scope.chartOptions2 = {
            options: {
                chart: { polar: true, type: 'area' },
                title: null,
                pane: { size: '80%' },
                xAxis: { categories: ["照明用电", "设备与插座", "取暖用电", "动力用电", "空调制冷", "特殊用电"], tickmarkPlacement: 'on', lineWidth: 0 },
                yAxis: { gridLineInterpolation: 'polygon', minorGridLineWidth: 0, lineWidth: 0, min: 0 },
                tooltip: { shared: true, pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f} kWh</b><br/>' },
                plotOptions: { area: { marker: { enabled: false } } },
                legend: { enabled: false }
            },
            series: [
                {
                    name: 'Before',
                    data: [20, 15, 17, 13, 18, 22],
                    dashStyle: 'longdash',
                    pointPlacement: 'on',
                    lineWidth: 1.5,
                    fillOpacity: 0.2,
                    lineWidth: 0.5
                }, {
                    name: 'After',
                    data: [19, 13, 14, 12, 14, 15],
                    pointPlacement: 'on',
                    fillOpacity: 0.2,
                    lineWidth: 1
                }
            ]
        }

        $scope.chartOptions3 = {
            options: {
                chart: {
                    type: 'bar', colorByPoint: true
                },
                title: null,
                legend: {
                    enabled: false,
                    layout: 'horizontal',
                },
                plotOptions: {
                    bar: { states: { hover: { enabled: false } } }
                },
                xAxis: {
                    categories: ['Before', 'After'],
                },
                yAxis: {
                    min: 0, title: null, labels: { overflow: 'justify' }
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y:.2f}kW</b><br>' ,
                    shared: true, followPointer: true
                },
                credits: false
            },
            series: [
                {
                    data: []
                }
            ]
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
