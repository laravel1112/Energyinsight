angular.module('app.controllers.reports.heatmap', [])

    .controller('reportsHeatmapCtrl', [
        '$scope', '$rootScope', 'AllMetersService', 'UtilityService', 'WeatherFactory', '$q', 'html2pdf', '$timeout', function($scope, $rootScope, AllMetersService, UtilityService, WeatherFactory, $q, html2pdf, $timeout) {


            $scope.highchartsNG = {
                options: {
                    chart: { animation: true, panning: true,  plotBorderWidth: 0,  margin: [55, 0, 0, 0], backgroundColor: '#fff',
                                events: { 
                                    redraw: function(){
                                        console.log('redraw');
                                    }
                                } 
                    },
                    title: { text: '' },
                    xAxis: {
                        animation: true,
                        type: 'datetime',
                        // min: Date.UTC(2013, 0, 1),
                        // max: Date.UTC(2016, 0, 1),

                        minorTickWidth: 1,
                        minorTickLength: 5,
                        minorTickColor: '#ccc',
                        minorGridLineWidth: 0,
                        
                        tickWidth: 1,
                        tickLength: 10,
                        tickColor: '#ccc',
                        gridLineWidth: 0,

                        lineWidth:0,
                        lineColor: "#ccc",

                        opposite: true,


                        labels: {
                            rotation: 0, 
                            align: 'center', 
                            y: -25, 
                            autoRotation: false,                            
                            //format: '{value:%B}', // long month
                            formatter: function(args)
                            {
                                var min = this.axis.min;
                                var max = this.axis.max;

                                var diffHours = moment(max).diff(moment(min), 'hours');

                                if(diffHours < 24 * 90)
                                {
                                    this.value = moment(this.value).format('MMM<br /><br />D');
                                }
                                else
                                {
                                    this.value = moment(this.value).format('MMM');
                                }

                                return this.value; 
                            },
                        },

                        showFirstLabel:true,
                        showLastLabel: true,
                        //tickLength: 16,
                        //tickInterval: 30 * 24 * 3600 * 1000
                    },

                    yAxis: [
                        {
                            minorGridLineWidth: 0,

                            showLastLabel: false,
                            labels: {
                                align: 'left', x: 10, y: -5,
                            },
                            title: null,
                            height: '35%',
                            //offset: 0,
                            title: "HDD/CDD",
                            startOnTick: true,
                            endOnTick: true,
                            align: 'right', x: 0, y: -3                            
                        }, {

                            minorGridLineWidth: 0,
                            animation: true,
                            minorGridLineWidth: 0,
                            opposite: false,
                            showFirstLabel: false,
                            height: '65%',
                            top: '35%',
                            title: {
                                text: "Time"
                            },
                            labels: {
                                align: 'left', x: 10, y: -5,
                                format: '{value}:00'
                            },
                            // tooltip: {
                            //     headerFormat: 'Energy Usage<br/>',
                            //     formatter: function() {
                            //         return '{point.x:%e %b, %Y} {point.y}:00: <b>' +
                            //             this.y == null ? 'null' : '{point.value:.2f} kWh' +
                            //             '</b>';
                            //     }
                            // },
                            minPadding: 0,
                            maxPadding: 0,
                            startOnTick: false,
                            endOnTick: false,
                            tickPositions: [0, 6, 12, 18, 23], // <-- heat max serie data value 23:00, 24 creates whitespace
                            tickWidth: 1,
                            min: 0,
                            max: 23, // <-- see comment above
                            reversed: true
                        }
                    ],

                    legend: { symbolWidth: 300 },
                    
                    colorAxis: {
                        stops: [
                            [0, '#0077FF'],
                            [0.5, '#F3FF00'],
                            //[0.9, '#c4463a'],
                            [1, '#FF0000']
                        ],
                        min: 0,
                        max: 25,
                        startOnTick: false,
                        endOnTick: false,
                        labels: {
                            format: '{value} kWh'
                        }
                    },
                    
                    plotOptions: {
                        areaspline: {
                            marker: { enabled : false }
                        }
                    },

                    // Individual series tooltip formatter doesn't work for some reason, here is workaround
                    tooltip: {
                        crosshairs: [true,true],
                        headerFormat: 'Energy Usage<br/>',
                        formatter: function() {
                            if (this.series.name == 'heatmap') {
                                var val = this.point.value == null ? '0' : Highcharts.numberFormat(this.point.value, '.2f');

                                return 'Energy Usage<br/>' + Highcharts.dateFormat('%e %b, %Y', this.point.x) + ' ' + this.point.y + ':00 <b>' + val + ' kWh</b>';
                            }
                            else
                                return this.series.name + '<br/><span style="color:' + this.point.series.color + '">\u25CF</span>: value: ' + this.point.y;
                        }
                    },
                    credits: false
                },
                series: [
                    {
                        type: 'heatmap',
                        name: 'heatmap',
                        yAxis: 1,
                        borderWidth: 0,
                        // tooltip: {
                        //     headerFormat: 'Temperature<br/>',
                        //     pointFormat: '{point.x:%e %b, %Y} {point.y}:00: <b>{point.value} ℃</b>'
                        // },
                        nullColor: '#EFEFEF',
                        colsize: 24 * 36e5, // one day
                        data: [],
                        turboThreshold: Number.MAX_VALUE // #3404, remove after 4.0.5 release
                    }, {
                        type: 'areaspline',
                         name: 'CDD',
                         yAxis: 0,
                         showInLegend: false,
                         color: 'blue',
                        data: []
                        //data:[[new Date('2015-01-01').getTime(),1],[new Date('2015-01-02').getTime(),9],[new Date('2015-02-01').getTime(),2],[new Date('2015-03-01').getTime(),15],[new Date('2015-011-01').getTime(),20]]
                    }, {
                        type: 'areaspline',
                         name: 'HDD',
                         yAxis: 0,
                         showInLegend: false,
                         color: 'red',
                        // showInLegend: false,
                        data: []
                        //data:[[new Date('2015-01-01').getTime(),1],[new Date('2015-01-02').getTime(),9],[new Date('2015-02-01').getTime(),2],[new Date('2015-03-01').getTime(),15],[new Date('2015-011-01').getTime(),20]]
                    }
                ]
            }
            $scope.year="1";

            var ticking = false;


            function update(data, summary){
                $scope.$apply(function(){
                    $scope.highchartsNG.series[0].data = data;
                    $scope.highchartsNG.series[1].data = summary.cdd;
                    $scope.highchartsNG.series[2].data = summary.hdd;
                    ticking = false;
                })

            };

            $scope.render = function (data, summary) {
                if(!ticking) {
                    requestAnimationFrame(function(){
                        return update(data, summary);
                    });
                    ticking = true;
                }
            }

            $scope.updateChart=function(){
                var year=parseInt($scope.year)||1;
                var startDate = moment().subtract(year, 'y').startOf('day').valueOf(); // year ago
                var endDate = moment().subtract(year-1, 'y').add(1, 'd').startOf('day').valueOf(); // end of today

                $q.all(
                    [
                        AllMetersService.load($rootScope.$stateParams.id, startDate, endDate,{interval:'30m'}),
                        WeatherFactory.get($rootScope.$stateParams.id,startDate, endDate)
                    ]
                ).then(function (result) {

                    var summary = WeatherFactory.hdd(20, result[1]);

                    result = result[0][0] || {};
                    var points = result.points || [];
                    points = points.reverse();

                    var monthlyEnergy = UtilityService.groupDataByTime(points, { hour: true }),
                        data = [],
                        min,
                        max;

                    var lastDate, totalMissing = 0;

                    monthlyEnergy.forEach(function(d) {
                        var token = d['time'].split(":");
                        var date = new Date(token[0]).getTime();
                        var time = parseInt(token[1]);

                        // Support for irregular interval
                        // Add null values for missing hours
                        if (!lastDate){
                            lastDate = moment(date).add(time, 'hours');
                        } else {
                            var current = moment(date).add(time, 'hours');
                            var diff = current.diff(lastDate, 'hours');
                            if (diff > 1) {
                                for (var i = 0; i < diff; i++) {
                                    lastDate.add({hours: 1});
                                    data.push([lastDate.clone().startOf('day').valueOf(), lastDate.hours(), null]);
                                }
                            }
                            lastDate = current;
                        }


                        data.push([date, time, d['total']]);

                        // Upper and lower extremes
                        if (!min || d['total'] < min) min = d['total'];
                        if (!max || d['total'] > max) max = d['total'];

                    })

                    var zoomStartDate = moment(endDate).subtract(3, 'month');
                    var canZoom = moment(zoomStartDate).isAfter(startDate);

                    $scope.highchartsNG.options.xAxis.min = canZoom ? zoomStartDate.valueOf() : startDate;
                    $scope.highchartsNG.options.xAxis.max = endDate;

                    //heatmap extremes
                    min = min || 0;
                    max = max || 25;

                    //Heatmap
                    $scope.highchartsNG.options.yAxis[1].min = 0;
                    $scope.highchartsNG.options.yAxis[1].max = 23;
                    $scope.highchartsNG.options.colorAxis.min = min;
                    $scope.highchartsNG.options.colorAxis.max = max;


                    $timeout(function(){

                        $scope.render(data, summary);
                    
                        
                    });

                })
            }
            if ($rootScope.$stateParams.id > 0) {
                $scope.updateChart();
            }

        }
    ]);


