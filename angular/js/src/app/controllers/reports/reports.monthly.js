angular.module('app.controllers.reports.monthly', [])
    .controller('reportsMonthlyCtrl', [
        '$scope', '$rootScope', '$http', 'AllMetersService', 'WeatherFactory', 'HelperService', '$filter', '$q', 'html2pdf', function($scope, $rootScope, $http, AllMetersService, WeatherFactory, HelperService, $filter, $q, html2pdf) {
            $scope.stats = {};

            if ($rootScope.$stateParams.id > 0) {
                //var p1 = AllMetersService.partitionedEnergyUse($rootScope.$stateParams.id, { month: true });
                var p2 = WeatherFactory.get($rootScope.$stateParams.id);
                $q.all([p2]).then(
                    function(result) {
			//to bind in html
                        //$scope.stats = result;
                        //set chart extreemes
                        var seriesData = result[0];
			
                        // var seriesData = result[0]['points'][0];
                        //$scope.chartOptions1.options.xAxis.categories = _.pluck(seriesData, "time");
                        var dataserie = _.find($scope.chartOptions1.series, function(d) {
                            return d.id == 'realdata'
                        });


                        //TODO: OPTIMIZE TEMP AND HUMIDITY MONTHLY GROUPING
                        //var monthly = $filter('groupBy')(result, function (record) { return new Date(record.date).getMonth(); });
                        // underscore groupby method for some reason works much faster
                        var condition = result[1] || [];
                        var monthly = _.groupBy(condition, function(d) {
                            var date = new Date(d[0]);
                            var month ="00"+ (date.getMonth() + 1);
                            var year = date.getFullYear();
                            return year + "/" + month.slice(-2); // ex: 2015/11

                        });
                        var weather = { temp: [], hum: [] };
                        angular.forEach(monthly, function(v, k) {
                            var tempSum = 0.0;
                            var tempHum = 0;

                            for (var j = 0; j < monthly[k].length; j++) {
                                tempSum += parseFloat(monthly[k][j][1]);
                                tempHum += parseFloat(monthly[k][j].hum);
                            }
                            weather.temp.push([new Date(k).getTime(),Math.round(tempSum / monthly[k].length)]);
                            weather.hum.push([new Date(k).getTime(),Math.round(tempHum / monthly[k].length)]);
                        });

                        var tempSerie = _.find($scope.chartOptions1.series, function(d) {
                            return d.id == 'temperature'
                        });

                        var humSerie = _.find($scope.chartOptions1.series, function(d) {
                            return d.id == 'humidity'
                        });

                        // Temperature series data
                        tempSerie.data = weather.temp;

                        // Humidity series data
                        humSerie.data = weather.hum;
			
   			
	
                    },
                    function(error) {
                        console.log(error);
                    }
                );

		var start = HelperService.toPyTime(moment().subtract(1, 'year').valueOf());
        	var end = HelperService.toPyTime(moment().valueOf());
		var data = { "isExternalRequest": "False", "time_format": "ms", "interval": "auto", "operation": "mean(value)", "building_id": $rootScope.$stateParams.id, "start_utc": start, "end_utc": end}

		$http.post("api/reports/monthly/"+$rootScope.$stateParams.id+"/", data).then(function (result) {
		    seriesData = result.data[0].points;

		    var dataserie = _.find($scope.chartOptions1.series, function(d) {
		            return d.id == 'realdata'
		        });
		
		    // Energy series data
                        var maxVal = 0;
                        dataserie.data = _.map(seriesData, function(d) {
                            var time = new Date(d[0]).getTime();
                            var value = d[1];
                            maxVal = maxVal > Math.ceil(value) ? maxVal : Math.ceil(value)
                            return [time, value];
                        });

			console.log(maxVal);
                        // Energy series friendly extremes
                        var nextN0 = Math.pow(10, maxVal.toString().length - 1);
                        var extreme = Math.ceil(maxVal / nextN0) * nextN0;

                        $scope.chartOptions1.options.yAxis[1].tickInterval = Math.ceil(extreme / 10); // limit to 10 gridlines
                        $scope.chartOptions1.options.yAxis[1].max = extreme;

			$scope.totalKWh = result.data[0].total_energy[0]
			$scope.totalCost = result.data[0].total_energy[1]
			$scope.totalKWh_m2 = result.data[0].energy_unit[0]
			$scope.totalCost_m2 = result.data[0].energy_unit[1]

			$scope.promote = result.data[0].promot[1]
			$scope.last_30_days = result.data[0].promot[0]
			if($scope.promote < 0)
				$scope.promote_icon = "down"

		},function(err){
		    console.log(err);
		});
                // WeatherFactory.get().then(
                //     function (result) {

                //         //TODO: OPTIMIZE TEMP AND HUMIDITY MONTHLY GROUPING
                //         //var monthly = $filter('groupBy')(result, function (record) { return new Date(record.date).getMonth(); });
                //         // underscore groupby method for some reason works much faster
                //         var monthly=_.groupBy(result,function(d){
                //             var date=new Date(d.date);
                //             var day=date.getDate();
                //             var month=(date.getMonth()+1);
                //             var year = date.getFullYear();
                //             return year + "/" + month; // ex: 2015/11

                //         });


                //         var weather = { temp: [], hum: [] };

                //         angular.forEach(monthly, function (v, k) {
                //             var tempSum = 0.0;
                //             var tempHum = 0;

                //             for (var j = 0; j < monthly[k].length; j++) {
                //                 tempSum += parseFloat(monthly[k][j].tempm);
                //                 tempHum += parseFloat(monthly[k][j].hum);
                //             }
                //             weather.temp.push(Math.round(tempSum / monthly[k].length));
                //             weather.hum.push(Math.round(tempHum / monthly[k].length));
                //         });

                //         var tempSerie = _.find($scope.chartOptions1.series, function (d) {
                //             return d.id == 'temperature'
                //         });

                //         var humSerie = _.find($scope.chartOptions1.series, function (d) {
                //             return d.id == 'humidity'
                //         });

                //         tempSerie.data = weather.temp;
                //         humSerie.data = weather.hum;
                //     },
                //     function(error) {
                //         console.log(error);
                //     }
                // );

            } else {
		
		$scope.chartOptions1 = $scope.chartDetailBar
		$scope.chartOptions2 = $scope.chartDetailPie

            }

	    // get Total KWh and Total cost
	    $scope.totalKWh = 0	
	    $scope.totalCost = 0		

	    // get Total KWh/m2 and Total cost/m2
	    $scope.totalKWh_m2 = 0	
	    $scope.totalCost_m2 = 0

	    $scope.promote = 0
	    $scope.last_30_days = 0
	    $scope.promote_icon = "up"

	    $scope.chartOptions1 = {
                options: {
                    chart: { alignTicks: false, panning: true, margin: [55, 0, 0, 0] },
                    title: null, //{ text: '_', style: { 'color': 'white' } },
                        
                    xAxis: { 
                        type: 'datetime', 
                        opposite: true,
                        minorTickWidth: 1,
                        minorTickLength: 5,
                        minorTickColor: '#eee',
                        minorGridLineWidth: 0,
                        
                        tickWidth: 1,
                        tickLength: 10,
                        tickColor: '#ccc',
                        gridLineColor: "#eee",

                        lineWidth:0,
                        lineColor: "#ccc", 
                        labels: { 
                            align: 'center', y: -25,
                            //format: '{value:%B}',
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
                            }
                        } 
                    }, // long month
                    yAxis: [
                        {
                            // Temperature
                            gridLineWidth: 0, minorGridLineWidth: 0,
                            title: null, // { text: '平均温度', style: { color: '#2C5384' } },
                            labels: { align: 'right', x: -10, y: -5, format: '{value}°C', style: { color: '#2C5384' } },
                            opposite: true,
                            showLastLabel: false,
                            min: -20, max: 40, tickInterval: 5

                        }, {
                            // Energy
                            showLastLabel: false,
                            gridLineWidth: 1, minorGridLineWidth: 0,
                            title: null,//{ text: '总用电量', style: { color: '#5AA5E9' } },
                            labels: { align: 'left', x: 10, y: -5, format: '{value} KWh', style: { color: '#2C5384' } }
                        }, {
                            // Humidity
                            showLastLabel: false,
                            gridLineWidth: 0, minorGridLineWidth: 0,
                            title: null, //{ text: '空气湿度', style: { color: '#C0504D' } },
                            labels: { align: 'right', x: -10, y: -5, format: '{value} ％', style: { color: '#2C5384' } },
                            opposite: true,
                            min: 20, tickInterval: 10
                        }
                    ],
                    tooltip: {
                        crosshairs: [true,true],
                        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
                        shared: true
                    },
                    plotOptions: {
                        column: {
                            stacking: 'normal'
                        }
                    },
                    credits: { enabled: false }
                },
                series: [
                    {
                        type: 'column', name: '能耗', id: 'realdata', yAxis: 1, color: '#5AA5E9',
                        tooltip: { pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.2f}</b><br/>' },
                        data: [],
                        showInLegend: false
                    },
                    {
                        type: 'spline', name: '空气湿度', id: 'humidity', yAxis: 2, color: '#C0504D', gridLineWidth: 0, dashStyle: 'shortdot', showInLegend: false,
                        marker: { enabled: false },
                        tooltip: { valueSuffix: ' mb' },
                        data: [],
                    },
                    {
                        type: 'spline', name: '室外温度', gridLineWidth: 0, id: 'temperature', showInLegend: false,
                        tooltip: { valueSuffix: ' °C' },
                        data: []
                    }
                ]
            }

	    $scope.chartOptions2 = {
                options: {
                    chart: {
			    type: 'pie'
			},
                    title: null, //{ text: '_', style: { 'color': 'white' } },
                    tooltip: {
			    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
			    pointFormat: '<span style="color:{point.color}">{point.name}</span>: 占总能耗的<b>{point.y:.2f}%</b><br/>'
			},
                    plotOptions: {
			    pie: {
				    allowPointSelect: true,
				    cursor: 'pointer',
				    dataLabels: {
				        enabled: false
				    },
				    showInLegend: true
				}
			}
                },
                series: [{
			    name: '1号总表',
			    colorByPoint: true,
			    data: [{
				name: '1号总表',
				y: 100
			    }]
			}]
            }

	    $scope.chartDetailBar = {
                options: {
                    chart: {
			    type: 'column',
			},
                    title: null, //{ text: '_', style: { 'color': 'white' } },
                        
                    xAxis: {
			    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Dec', 'Nov'],
			    title: {
				text: 'Month'
			    },
			}, // long month
                    yAxis: {
			    allowDecimals: false,
			    min: 0,
			    title: {
				text: 'Number of fruits'
			    }
			},
                    tooltip: {
                        headerFormat: '<b>{point.key}</b><br>',
            		pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: {point.y} / {point.stackTotal}'
                    },
                    plotOptions: {
                        column: {
				stacking: 'normal',
				depth: 40
			    }
                    },
		    legend: {
			    layout: 'vertical',
			    align: 'right',
			    verticalAlign: 'middle',
			    borderWidth: 0
			},
                    credits: { enabled: false }
                },
                series: [{
			    name: 'Type1',
			    data: [5, 3, 4, 7, 2, 3, 4, 4, 2, 5, 2, 5],
			    stack: 'type1'
			},
			{
			    name: 'Type2',
			    data: [5, 3, 4, 7, 2, 3, 4, 4, 2, 5, 2, 5],
			    stack: 'type1'
			}, {
			    name: 'Type3',
			    data: [3, 4, 4, 2, 5, 5, 3, 4, 7, 2, 3, 4],
			    stack: 'type1'
			}, {
			    name: 'Type4',
			    data: [2, 5, 6, 2, 1, 3, 4, 4, 2, 5, 5, 3],
			    stack: 'type1'
			}, {
			    name: 'Type5',
			    data: [3, 0, 4, 4, 3, 6, 2, 1, 3, 4, 4, 2],
			    stack: 'type1'
			}]
            }

            $scope.chartDetailPie = {
                options: {
                    chart: {
			    type: 'pie'
			},
                    title: null, //{ text: '_', style: { 'color': 'white' } },
                        
                    tooltip: {
			    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
			    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
			},
                    plotOptions: {
			    pie: {
				    allowPointSelect: true,
				    cursor: 'pointer',
				    dataLabels: {
				        enabled: false
				    },
				    showInLegend: true
				}
			}
                },
                series: [{
			    name: 'Brands',
			    colorByPoint: true,
			    data: [{
				name: 'Type1',
				y: 56.33
			    }, {
				name: 'Type2',
				y: 24.03
			    }, {
				name: 'Type3',
				y: 10.38
			    }, {
				name: 'Type4',
				y: 4.77
			    }, {
				name: 'Type5',
				y: 0.91
			    }]
			}]
            }

            $scope.export = function(){
                html2pdf.export($("#export-container"), 'Report.Monthly');
            }
        }
    ])
