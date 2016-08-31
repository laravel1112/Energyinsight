angular.module('app.controllers.reports.summary', [])
    .controller('reportsSummaryCtrl', [
        '$scope', '$rootScope', '$http', 'AllMetersService', 'WeatherFactory', '$filter', 'EnergyUnitFactory', 'LanguageFactory', 'UtilityService', '$q', 'html2pdf', '$timeout', 'platform', '$window',
        function($scope, $rootScope, $http, AllMetersService, WeatherFactory, $filter, EnergyUnitFactory, LanguageFactory, UtilityService, $q, html2pdf, $timeout, platform, $window) {


            // Indicators binding variable
            $scope.stats = {};

            // Series: Hourly = 0, Daily = 1, Monthly = 2
            $scope.serieType = "1";
	    

            // Mockup data for properties panel
            // $scope.properties = [
            // { name: '地址', value: '121029' },
            // { name: '建筑类型', value: '酒店旅馆' },
            // { name: '建筑年限', value: '2005' },
            // { name: '建筑总面积', value: '20000平米' },
            // { name: '总房间数', value: '123间' },
            // { name: '会议厅间数',   value: '3' },
            // { name: '雇员人数', value: '533'},
            // { name: '制冷设备数', value: '3' },
            // { name: '厨房数量', value: '1' },
            // ];
            $scope.properties = {
                address: "121029",
                buildingType: "酒店旅馆",
                buildingYear: "2005"
            }

            // Switch between hourly / daily / monthly series
            $scope.switchSerie = function(data) {
		if ($rootScope.$stateParams.id > 0) {
			var now_moment=moment();
			var start_time;

			if($scope.serieType == "0"){
			     start_time = moment(now_moment).subtract(7, 'day').valueOf();
			}else if($scope.serieType == "1"){
			     start_time = moment(now_moment).subtract(1, 'month').valueOf();
			}else{
			     start_time = moment(now_moment).subtract(1, 'year').valueOf();
			}

		        
		        var p2 = WeatherFactory.get($rootScope.$stateParams.id);

		        $q.all([p2]).then(function(result) {

		            var seriesData = result[0] || [];
		            var weather = { temp: [], hum: [], date:[] };
		            
		            var weatherData = _.filter(seriesData || [], function(d) {
		                return new Date(d[0]) >= start_time;
		            });

		            var daily = _.groupBy(weatherData, function(d) {
				
				var date=moment(new Date(d[0]));
				date.utcOffset(480);
				var day="0"+date.date();
				var month="0"+(date.month()+1);
				var year = date.year();

				/*if($scope.serieType == 2){
					return year + "/" + month.slice(-2); // ex: 2015/11    
				}else{*/
					return year + "/" + month.slice(-2) + "/" + day.slice(-2); // ex: 2015/11/11
				//}

		            });
			    

		            angular.forEach(daily, function(v, k) {
		                var tempSum = 0.0;
		                var tempHum = 0;


		                for (var j = 0; j < daily[k].length; j++) {
				    if(daily[k][j][1] != null) 
		                    	tempSum += parseFloat(daily[k][j][1]);
				    if(daily[k][j][2] != null) 
		                    	tempHum += parseFloat(daily[k][j][2]);
		                }

				temp = Math.round(tempSum / daily[k].length);
				
				if(isNaN(temp) || temp == 0)
					weather.temp.push(null)
				else{
		                	weather.temp.push(temp);
				}
				
				temp = Math.round(tempHum / daily[k].length);
				if(isNaN(temp) || temp == 0)
					weather.hum.push(null)
				else
		                	weather.hum.push(temp);

				weather.date.push(k)
		            });
			    
			    $scope.chartOptions1.options.xAxis.categories = weather.date;
		            $scope.chartOptions1.series[1].data = weather.temp;
		            $scope.chartOptions1.series[2].data = weather.hum;

		        });

			var param = { "isExternalRequest": "False", "time_format": "ms", "interval": "auto", "operation": "mean(value)", "start_utc": Math.round(start_time/1000), "end_utc": Math.round(now_moment.valueOf()/1000)};

			$http.post("api/getseries/"+$rootScope.$stateParams.id+"/", param).then(function (result) {


			    if(result.data.length > 0){
				options = {}
				/*if($scope.serieType == 2){
					options = {"month": true}   
				}*/
				seriesData = result.data[0].points.reverse();
				seriesData = UtilityService.groupDataByTime(seriesData, options);	

				$scope.chartOptions1.options.xAxis.categories = _.pluck(seriesData, "time");

				$scope.chartOptions1.series[0].data = _.pluck(seriesData, "total")
			    }
			    else{
				$scope.chartOptions1.series[0].data = []
			    }
			},function(err){
			    console.log(err);
			});
            } else {
            }

	    /*$timeout(function(){
                    
                    $timeout(function(){
                        AllMetersService.calculate($rootScope.building || $rootScope.$stateParams, {}, data).then(function (result) {
                            $scope.stats = result;
                        });
                    }, 0);

                }, 0);*/

	}

	    var rect = null;
	    var rectH = null;
	    function drawRect(chart){

		
		$timeout(function(){
		    if (rect){
		        rect.element.remove();   
		    }
		    if (rectH){
		        rectH.element.remove();   
		    }

		    if(chart.chartHeight && chart.chartHeight){
		        

		        var chartWidth = $(chart.renderTo).width();
		        var chartHeight = $(chart.renderTo).height();

		        rect = chart.renderer.rect(chartWidth - 100, chart.margin[0], 100, chartHeight, 0)
		            .attr({
		                'stroke-width': 0,
		                fill: 'rgba(250, 250, 250, 0.5)',
		                zIndex: 2
		            })
		            .add();

		        rectH = chart.renderer.rect(0, 0, chartWidth, chart.margin[0] - 1, 0)
		            .attr({
		                'stroke-width': 0,
		                fill: 'rgba(250, 250, 250, 0.5)',
		                zIndex: 2
		            })
		            .add();
		    }
		})
            }

            if ($rootScope.$stateParams.id > 0) {

                $scope.switchSerie();
                
                $timeout(function(){
                    
                    $timeout(function(){
                        EnergyUnitFactory.getDetail($rootScope.$stateParams.id,{populate:true}).then(function(buildingDetail) {
                            var buildingParam = LanguageFactory.filterFields(buildingDetail.objects[0]);
                            var building = LanguageFactory.filterFields(buildingDetail.objects[0].super);
                            $scope.properties = buildingParam.concat(building);
                            $scope.stats.desc = (buildingDetail.objects[0] || {}).description;
                        })
                    }, 0);
                    
                }, 0);

            }

            $scope.getPropertyIcon = function(name) {
                switch(name) {
                    case 'GPSlocation':
                        return 'icon-satellite';
                    case 'category':
                        return 'icon-buildings';
                    case 'name':
                        return 'icon-briefcase';
                    case 'type':
                        return 'icon-building-5';
                    case 'value':
                        return 'icon-info';
                    default:
                        return 'icon-building';
                }
            }

            $scope.chartOptions1 = {
                options: {
                    chart: {
                        zoomType: 'xy',
                        
                    },
                    title: null,
                    xAxis: {
                        
                        gridLineWidth: 0,
                    },
                    yAxis: [{
                            // Energy usage
                            gridLineColor: "#eee",
                            title: null,
                            labels: {
                                format: '{value} kWh',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                        },{
                            // Temperature C
                            labels: {
                                format: '{value}°C',
                                style: {
                                    color: Highcharts.getOptions().colors[2]
                                }
                            },
                            title: null,
                            opposite: true,

                        },{
                            // Humidity
                            title: null,
                            labels: {
                                format: '{value} ％',
                                useHtml: true,
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            },
                            opposite: true,
                        }
                    ],
                    tooltip: {
                        // headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        // pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        //     '<td style="padding:0"><b>{point.y:.1f} </b></td></tr>',
                        // footerFormat: '</table>',
                        shared: true,
                        // useHTML: true
                    },
                },
                    exporting: {
                        buttons: {
                            customButton: {
                                x: -62,
                                onclick: function () {
                                   alert('Clicked');
                                },
                                symbol: 'circle'
                            }
                        }
                    },
                series: [
                    {
                        name: '能耗',
                        tooltip: {
                            valueSuffix: 'KWh'
                        },
                        type: 'column',
                        // showInLegend: false,
                        yAxis: 0,
                        data: []

                    }, {
                        name: '室外温度',
                        type: 'spline',
                        tooltip: {
                            valueSuffix: '°C'
                        },
                        // showInLegend: false,
                        yAxis: 1,
			color: Highcharts.getOptions().colors[2],
                        data: [],

                    }, {
                        name: '空气湿度',
                        type: 'spline',
                        tooltip: {
                            valueSuffix: ' %'
                        },
                        // showInLegend: false,
                        yAxis: 2,
			color: Highcharts.getOptions().colors[1],
                        data: []

                    }
                ],
		func: function(chart1){
                    $timeout(function(){
                    })

                }
            };

	    if(platform.isMobile()){

		// $scope.chartOptions1.options.chart.marginTop = 15;
                // $scope.chartOptions1.options.chart.marginTop = 15;
                // $scope.chartOptions1.options.xAxis.showFirstLabel = false;
                // $scope.chartOptions1.options.yAxis.showFirstLabel = false;
                // $scope.chartOptions1.options.backgroundColor = '#91c46b';

                // $scope.chartOptions1.options.xAxis.gridLineWidth = 0;
                // $scope.chartOptions1.options.yAxis.gridLineWidth = 1;
                // $scope.chartOptions1.options.yAxis[0].title = null;//labels = { align: 'left', x: 0, y: -2 };
                // $scope.chartOptions1.options.yAxis[0].labels = { align: 'left', x: -75, y: -2 };
                //$scope.chartOptions1.options.yAxis[0].labels.x = -35;//labels = { align: 'left', x: 0, y: -2 };

                // $scope.chartOptions1.options.yAxis[1].title = null;//labels = { align: 'left', x: 0, y: -2 };
                // $scope.chartOptions1.options.yAxis[1].labels = { align: 'left', x: 0, y: -2 };
                // $scope.chartOptions1.options.yAxis[1].labels.x = 0;//labels = { align: 'left', x: 0, y: -2 };
                
                // $scope.chartOptions1.options.yAxis[2].title = null;//labels = { align: 'left', x: 0, y: -2 };
                // $scope.chartOptions1.options.yAxis[2].labels = { align: 'left', x: -25, y: -2 };
                //$scope.chartOptions1.options.yAxis[2].labels.x = 40;//labels = { align: 'left', x: 0, y: -2 };

                // $scope.chartOptions1.series[0].showInLegend = false;
            }

            if ($rootScope.$stateParams.id > 0) {
                AllMetersService.calculate($rootScope.building || $rootScope.$stateParams).then(
                    function(result) {

                        //to bind in html
                        $scope.stats = result;
                        EnergyUnitFactory.getDetail($rootScope.$stateParams.id).then(function(buildingDetail) {
                            $scope.stats.desc = (buildingDetail.objects[0] || {}).description;
                        })

                        //set chart extreemes
                        //$scope.chartGaugeOptions1.options.yAxis.max = $scope.stats.dailyAverage * 1.5 || 8000;
                        //$scope.chartGaugeOptions2.options.yAxis.max = $scope.stats.peakAverage * 1.5 || 8000;
			console.log(JSON.stringify(result.data));

                        //update chart series
                        $scope.chartGaugeOptions1alt.series[0].data = [Math.floor($scope.stats.todayEnergy) || 0];
                        $scope.chartGaugeOptions2alt.series[0].data = [Math.floor($scope.stats.todayPeak) || 0];
                        //$scope.chartGaugeOptions1.series[0].data = [$scope.stats.todayEnergy || 0];
                        //$scope.chartGaugeOptions2.series[0].data = [$scope.stats.todayPeak || 0];

                        $rootScope.resize();

                    },
                    function(error) {

                    }
                );
            } else {
            }


           // middle big gauge
            $scope.chartGaugeOptions1alt = {
                options: {
                    chart: { type: 'gauge', plotBackgroundColor: null, plotBackgroundImage: null, plotBorderWidth: 0, plotShadow: false, spacingTop: 15, spacingBottom: 15, spacingLeft: 0, spacingRight: 0 },
                    title: null,
                    exporting: { enabled: false },
                    pane: { center: ['50px', '30px'], size: '50%', startAngle: 115, endAngle: -115, background: null },
                    plotOptions: {
                        gauge: {
                            dataLabels: { enabled: true, style: { 'fontSize': '20px' }, y: 60, borderWidth: 0 },
                            dial: { backgroundColor: '#c72424', borderColor: '#c72424', radius: '70%', baseLength: '0%' }, // dial arrow
                            pivot: { backgroundColor: '#c72424', radius: '4', } // dial arrow dot
                        }
                    },
                    yAxis: {
                        pane: 0,
                        min: 0,
                        max: 3000,
                        lineColor: null,
                        reversed: true,
                        //minorTickInterval: 1,
                        //tickPixelInterval: 10,
                        //minorTickPosition: 'outside',
                        //tickPosition: 'outside',
                        //tickWidth: 1,
                        //tickPositions: [0, 1000, 2000, 3000],
                        labels: { enabled:false, step: 1, distance: 15, rotation: 'auto' },
                        title: { text: 'kWh', align: 'middle', style: { 'fontSize': '12px' }, y: 7 }, // Y Title
                        plotBands: [
                            { innerRadius: '140%', outerRadius: '180%', from: 0, to: 1000, color: '#55BF3B' }, // green
                            { innerRadius: '140%', outerRadius: '180%', from: 1000, to: 2000, color: '#ffcc00' }, // yellow
                            { innerRadius: '140%', outerRadius: '180%', from: 2000, to: 3000, color: '#DF5353' } // red
                        ],
                        dataLabels: {
                            formatter: function () {
                                 var kmh = this.y,
                                 mph = Math.round(kmh * 0.621);
                            }
                        },
                    },
                    credits: false
                },
                series: [
                    {
                        name: 'kWh',
                        data: [0]
                    }
                ],

		func: function(chart1){
                    
                }

            };

            $scope.chartGaugeOptions2alt = {
                options: {
                    chart: { type: 'gauge', plotBackgroundColor: null, plotBackgroundImage: null, plotBorderWidth: 0, plotShadow: false, spacingTop: 15, spacingBottom: 15, spacingLeft: 0, spacingRight: 0 },
                    title: null,
                    exporting: { enabled: false },
                    pane: { center: ['50px', '30px'], size: '50%', startAngle: 115, endAngle: -115, background: null },
                    plotOptions: {
                        gauge: {
                            dataLabels: { enabled: true, style: { 'fontSize': '20px' }, y: 60, borderWidth: 0 },
                            dial: { backgroundColor: '#c72424', borderColor: '#c72424', radius: '90%', baseLength: '0%' }, // dial arrow
                            pivot: { backgroundColor: '#c72424', radius: '4', } // dial arrow dot
                        }
                    },
                    yAxis: {
                        pane: 0,
                        min: 0,
                        max: 3000,
                        lineColor: null,
                        reversed: true,
                        //minorTickInterval: 1,
                        //tickPixelInterval: 10,
                        //minorTickPosition: 'outside',
                        //tickPosition: 'outside',
                        //tickWidth: 1,
                        //tickPositions: [0, 1000, 2000, 3000],
                        labels: { enabled: false, step: 1, distance: 15, rotation: 'auto' },
                        title: { text: 'kWh', align: 'middle', style: { 'fontSize': '12px' }, y: 7 }, // Y Title
                        plotBands: [
                            { innerRadius: '140%', outerRadius: '180%', from: 0, to: 1000, color: '#55BF3B' }, // green
                            { innerRadius: '140%', outerRadius: '180%', from: 1000, to: 2000, color: '#ffcc00' }, // yellow
                            { innerRadius: '140%', outerRadius: '180%', from: 2000, to: 3000, color: '#DF5353' } // red
                        ],
                        dataLabels: {
                             formatter: function () {
                             var kmh = this.y,
                             mph = Math.round(kmh * 0.621);
                        }
                    },
                    },
                    credits: false
                },
                series: [
                    {
                        name: 'kWh',
                        data: [0]
                    }
                ],

		func: function(chart1){
                    
                }

            };

            $scope.chartGaugeOptions1 = {
                options: {
                    chart: {
                        type: 'solidgauge',
                        height: 250
                    },

                    title: { text: '当日总能耗指示' },

                    pane: {
                        center: ['50%', '50%'],
                        size: '100%', // over 100 makes gauge Gauges cut off on lower resolution
                        startAngle: -90,
                        endAngle: 90,
                        background: {
                            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                            innerRadius: '60%',
                            outerRadius: '100%',
                            shape: 'arc'
                        }
                    },

                    tooltip: {
                        enabled: false
                    },

                    plotOptions: {
                        solidgauge: {
                            dataLabels: {
                                y: 5,
                                borderWidth: 0,
                                useHTML: true
                            }
                        }
                    },

                    yAxis: {
                        min: 0,
                        max: 8000,
                        stops: [
                            [0.1, '#55BF3B'], // green
                            [0.5, '#DDDF0D'], // yellow
                            [0.9, '#DF5353'] // red
                        ],
                        labels: {
                            y: 16
                        }
                    },

                    credits: {
                        enabled: false
                    },
                },
                series: [
                    {
                        name: 'Consumption',
                        data: [0],
                        dataLabels: {
                            format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                                ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y:.1f}</span><br/>' +
                                '<span style="font-size:20px;color:orange">kwh</span></div>'
                        }
                    }
                ],

		exporting: {
		    buttons: {
		        customButton: {
		            x: -62,
		            onclick: function () {
		                alert('Clicked');
		            },
		            symbol: 'circle'
		        }
		    }
		},

		func: function(chart1){
                    
                }
            };

            $scope.chartGaugeOptions2 = {
                options: {
                    chart: {
                        type: 'solidgauge',
                        height: 250
                    },
                    title: { text: '当日高峰能耗指示' },
                    pane: {
                        center: ['50%', '50%'],
                        size: '100%', // over 100 makes gauge Gauges cut off on lower resolution
                        startAngle: -90,
                        endAngle: 90,
                        background: {
                            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                            innerRadius: '60%',
                            outerRadius: '100%',
                            shape: 'arc'
                        }
                    },

                    tooltip: {
                        enabled: false
                    },

                    plotOptions: {
                        solidgauge: {
                            dataLabels: {
                                y: 5,
                                borderWidth: 0,
                                useHTML: true
                            }
                        }
                    },

                    yAxis: {
                        min: 0,
                        max: 8000,
                        stops: [
                            [0.1, '#55BF3B'], // green
                            [0.5, '#DDDF0D'], // yellow
                            [0.9, '#DF5353'] // red
                        ],
                        labels: {
                            y: 16
                        }
                    },

                    credits: {
                        enabled: false
                    }
                },
                series: [
                    {
                        name: 'Consumption',
                        data: [0],
                        dataLabels: {
                            format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                                ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y:.1f}</span><br/>' +
                                '<span style="font-size:20px;color:orange">kwh</span></div>'
                        }
                    }
                ],

		func: function(chart1){
                    
                }
            }
            
        }
    ])
