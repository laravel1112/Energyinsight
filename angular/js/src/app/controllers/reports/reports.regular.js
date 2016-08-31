angular.module('app.controllers.reports.regular', [])
    .controller('reportsRegularCtrl', [
        '$scope', '$rootScope', '$timeout', '$window', 'html2pdf', function($scope, $rootScope, $timeout, $window, html2pdf) {
            // Set extremes with friendly label value and 10 gridlines
            //var values = _.pluck(result, "total");
            //var maxVal = Math.ceil(_.max(values));
            //var nextN0 = Math.pow(10, maxVal.toString().length - 1);
            //var extreme = Math.ceil(maxVal / nextN0) * nextN0;

            //$scope.chartOptions1.options.yAxis.tickInterval = Math.ceil(extreme / 10); // limit to 10 gridlines
            //$scope.chartOptions1.options.yAxis.max = extreme;

            $scope.chartOptions1 = {
                options: {
                    /*chart: {
                        type: 'column', panning: true, margin: [55, 0, 0, 0] 
                    },*/
                    title: null,
                    xAxis: {
                        categories: [
                            '1月',
                            '2月',
                            '3月',
                            '4月',
                            '5月',
                            '6月',
                            '7月',
                            '8月',
                            '9月',
                            '10月',
                            '11月',
                            '12月'
                        ],
                        crosshair: true,
                        // opposite: true,
                        gridLineWidth: 0
                    },
                    yAxis: {
                        lineWidth: 0,
                        lineColor: '#fff',
                        gridLineWidth: 0,
                        minorGridLineWidth: 0, 
                        min: 0,
                        //labels: { align: 'left', x: 10, y: -5 },
                        title: null,//{ text: '能源效率' },
                        tickInterval: 25, // TODO: WARNING: HARDCODED use principle commented above once live
                        max: 250,
                        showLastLabel: false
                    },
                    tooltip: {
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
                        footerFormat: '</table>',
                        shared: true,
                        useHTML: true
                    },
                    plotOptions: {
                        column: {
                            pointPadding: 0.2,
                            borderWidth: 0
                        },
			spline: {
				
				marker: {
				    enabled: false
				}
			    }
                    }
                },
                series: [
                    {
			type: "column",
                        name: '当前楼宇',
                        showInLegend: false,
                        data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

                    }, {
			type: "column",
                        name: '行业平均',
                        showInLegend: false,
                        data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]

                    }, {
			type: "column",
                        name: '优质楼宇',
                        showInLegend: false,
                        data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0, 59.6, 52.4, 65.2, 59.3, 51.2]

                    }, {
		        type: 'spline',
		        name: '目标值',
		        data: [38.9, 40.8, 42.3, 41.4, 57.0, 68.3, 79.0, 69.6, 52.4, 55.2, 49.3, 31.2],
		        marker: {
			    lineWidth: 2,
			    lineColor: Highcharts.getOptions().colors[5],
			    fillColor: 'white'
		        }
		    }, {
		        type: 'spline',
		        name: '基准值',
		        data: [28.9, 32.8, 35.3, 31.4, 47.0, 55.3, 69.0, 59.6, 42.4, 35.2, 39.3, 21.2],
		        marker: {
			    lineWidth: 2,
			    lineColor: Highcharts.getOptions().colors[6],
			    fillColor: 'white'
		        }
		    }
                ]
            };

            $timeout(function(){
                $rootScope.resize();
            });

        }
    ])
