angular.module('app.controllers.recommendations.strategies.strategy4', [])

    .controller('strategy4Ctrl', ['$scope', '$rootScope', 'FormService', 'uiGridConstants', '$http', '$q', '$timeout', '$window', 'seriesService', 'UtilityService', function ($scope, $rootScope, FormService, uiGridConstants, $http, $q, $timeout, $window, seriesService, UtilityService) {

        var cancelLoad = $q.defer();

        // dateConfig altered by "angular.daterange.js" at runtime
        $scope.dateConfig = { selected: null, maxDate: moment() };

        var pointStart = moment().subtract(1, 'week').valueOf();
        var pointInterval = 3600 * 1000;

        $scope.time = 0;



        // $scope.sliderConfig = {
        //     floor: 0, ceil: 3, onChange: function () { $scope.change(); }, showTicks: true, showTicksValues: true,
        //     translate: function(value) {
        //         switch (value) {
        //             case 0: return '1m';
        //             case 1: return '3m';
        //             case 2: return '6m';
        //             case 3: return '12m';
        //         }
        //     }
        // }


        $scope.slider1Config = { id: 1, value: 0, floor: 0, ceil: 30, onChange: function () {onSliderChange(this);}, showTicks: true, showTicksValues: true, translate: function(value) { return value + ''; } }
        $scope.slider2Config = { id: 2, value: 0, floor: 0, ceil: 30, onChange: function () { onSliderChange(this); }, showTicks: true, showTicksValues: true, translate: function(value) { return value + ''; } }
        $scope.slider3Config = { id: 3, value: 0, floor: 0, ceil: 30, onChange: function () { onSliderChange(this); }, showTicks: true, showTicksValues: true, translate: function(value) { return value + ''; } }
        $scope.slider4Config = { id: 4, value: 0, floor: 0, ceil: 30, onChange: function () { onSliderChange(this); }, showTicks: true, showTicksValues: true, translate: function(value) { return value + ''; } }
        $scope.slider5Config = { id: 5, value: 0, floor: 0, ceil: 30, onChange: function () { onSliderChange(this); }, showTicks: true, showTicksValues: true, translate: function(value) { return value + ''; } }
        $scope.slider6Config = { id: 6, value: 0, floor: 0, ceil: 30, onChange: function () { onSliderChange(this); }, showTicks: true, showTicksValues: true, translate: function(value) { return value + ''; } }


        var onSliderChange = function(slider){
            // $scope.$apply(function(){
            var data = _.map($scope.chartOptions1.series[slider.id].data, function(d) {
                var lastPerc = $scope.chartOptions1.series[slider.id].lastValue; // last selected percentage

                if(lastPerc)
                    d[1] = d[1] * 100 / (100 - lastPerc); // restore original value
                d[1]=d[1] - (d[1]* slider.value / 100); // substruct original value with selected percentage
                return d;
            });
            $scope.stats[slider.id].modifiedEnergy=$scope.stats[slider.id].originalEnergy*(1-slider.value/100);
            $scope.chartOptions1.series[slider.id].data = data;
            $scope.chartOptions1.series[slider.id].lastValue = slider.value;
            // });
        }


        $scope.load = function () {
            $timeout(function(){

                $scope.dateConfig.setRange(moment().subtract(1, 'week'),
                    moment());

                $scope.applyDateRange();

            })
        }
        $scope.load();


        $scope.chartOptions1 = {
            options: {
                chart: {
                    alignTicks: true, spacingBottom: 15, spacingTop: 0, spacingLeft: 0, spacingRight: 0,
                    type: 'area'
                },
                title: null,
                legend: {
                    enabled: true,
                    layout: 'horizontal',
                },
                tooltip: {},
                plotOptions: {
                    area: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: false,
                            format: '{point.y:.1f}', // one decimal
                            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                            style: {
                                textShadow: '0 0 3px black'
                            }
                        },
                        tooltip: {
                            format: '{point.y:.1f}', // one decimal
                            valueDecimals: 2
                        },
                        marker: { enabled: false }
                    },
                    series: {
                            pointStart: pointStart,
                            pointInterval: pointInterval
                    }
                },
                xAxis: {
                    min: pointStart,
                    tickWidth: 0,
                    startOnTick: false, endOnTick: false, type: 'datetime',
                    tickInterval: 60 * 60 * 1000 * 2,
                    labels: {
                        rotation: 0,
                        align: 'center'
                    }
                },
                yAxis: {
                    title: { text: '' }, gridLineWidth: 1, minorGridLineWidth: 0, min: 0, labels: { align: 'left', x: 5, y: -5 }, showFirstLabel: false, showLastLabel: false
                },
                tooltip: {
                    shared: true, followPointer: true, crosshairs: {
                        color: 'rgba(0,0,0,0.05)',
                        dashStyle: 'dash'
                    },
                },
                credits: false
            },
            series: [
                // {
                //     name: "照明用电",
                //     data: [65.16, 77.00, 67.46, 47.12, 19.29, 12.42, 13.22],
                //     zIndex: 6,
                //     fillOpacity: 0.5,
                //     lineWidth: 1
                // }, {
                //     name: "设备与插座",
                //     data: [60.16, 72.00, 67.46, 47.12, 19.29, 12.42, 13.22],
                //     zIndex: 5,
                //     fillOpacity: 0.5,
                //     lineWidth: 1
                // }, {
                //     name: "取暖用电",
                //     data: [55.16, 68.00, 67.46, 47.12, 19.29, 12.42, 13.22],
                //     zIndex: 4,
                //     fillOpacity: 0.5,
                //     lineWidth: 1
                // }, {
                //     name: "动力用电",
                //     data: [30.16, 40.00, 50.46, 40.12, 35.29, 25.42, 30.22],
                //     zIndex: 3,
                //     fillOpacity: 0.5,
                //     lineWidth: 1
                // }, {
                //     name: "空调制冷",
                //     data: [40.16, 50.00, 60.46, 50.12, 46.29, 30.42, 40.22],
                //     zIndex: 2,
                //     fillOpacity: 0.5,
                //     lineWidth: 1
                // }, {
                //     name: "特殊用电",
                //     data: [50.16, 60.00, 70.46, 60.12, 57.29, 35.42, 50.22],
                //     zIndex: 1,
                //     fillOpacity: 0.5,
                //     lineWidth: 1
                // }
            ]
        }

        var colors=['purple','blue','green','yellow','orange','red'];
        $scope.displaySeries=function(startTime,endTime){
                    var interval=60*24; // one month
                    pointInterval="auto";

                    $q.all([seriesService.load($rootScope.$stateParams.id,startTime,endTime,{interval:pointInterval}),
                        seriesService.load($rootScope.$stateParams.id,startTime,endTime,{interval:pointInterval,disagg:"all"})])
                    .then(function(result){
                        var series=result[1];
                        $scope.chartOptions1.series=[];
                        $scope.sliders=[];
                        $scope.stats=[];
                        for(var i=0;i<series.length;i++){
                            var sdata=series[i];
                            var data=(sdata.points||[]).reverse();
                            $scope.chartOptions1.series[i]={
                                name: sdata.usage||"",
                                data: data,
                                fillOpacity: 0.5,
                                color:colors[i%colors.length],
                                lineWidth: 1
                            }
                            var energy=UtilityService.getAreaUnderCurve(data);
                            $scope.stats.push({
                                id:i,
                                name:sdata.usage||"",
                                originalEnergy:energy,
                                modifiedEnergy:energy
                            })
                            $scope.sliders[i]={id: i, value: 0, name:sdata.usage,color:colors[i%colors.length],floor: 0, ceil: 30, step: 5, onChange: function () { onSliderChange(this); }, showTicks: true, showTicksValues: true, translate: function(value) { return value + ''; } };
                        }


                        $timeout(function(){
                            angular.element($window).triggerHandler('resize');
                        });

                    });
        }

        $scope.applyDateRange = function () {
            var data1, data2;

            //TODO: Use this daterange for API requests
            //TODO: Fine tune daterange picker
            var dateStart = $scope.dateConfig.getStart();
            var dateEnd = $scope.dateConfig.getEnd();

            var pointStart = dateStart.clone().valueOf();
            var pointEnd = dateEnd.clone().valueOf();

            // Close Compare configuration Popup
            $scope.isCompareOpen = false;


            $scope.chartOptions1.options.xAxis.min = pointStart;
            $scope.chartOptions1.options.xAxis.max = pointEnd;

            // start of day
            $scope.chartOptions1.options.plotOptions.series.pointStart = pointStart;
            $scope.chartOptions1.options.plotOptions.series.pointEnd = pointEnd;

            // tick interval
            $scope.chartOptions1.options.xAxis.tickInterval = 3600 * 1000 * 24;
            // point interval
            $scope.chartOptions1.options.plotOptions.series.pointInterval = 3600 * 1000;

            $scope.displaySeries(pointStart, pointEnd);
        }

        $scope.setRange = function(mode){
            switch(mode){
                case "past week":

                    $timeout(function(){
                        $scope.dateConfig.setRange(moment().subtract(1, 'week'),
                            moment());
                    });

                    break;
                case "last month":

                    $timeout(function(){
                        $scope.dateConfig.setRange(moment().subtract(1, 'month').startOf('month'),
                            moment().subtract(1, 'month').endOf('month'));
                    });

                    break;
                case "this month":

                    $timeout(function(){
                        $scope.dateConfig.setRange(moment().startOf('month'),
                            moment());
                    });

                    break;
                case "this quarter":

                    $timeout(function(){
                        $scope.dateConfig.setRange(moment().startOf('quarter'),
                            moment());
                    });

                    break;
                case "this year":

                    $timeout(function(){
                        $scope.dateConfig.setRange(moment().startOf('year'),
                            moment());
                    });

                    break;
            }
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