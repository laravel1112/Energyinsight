angular.module('app.controllers.reports.disagg', [])
    .controller('reportsDisaggCtrl', [
        '$scope', '$rootScope', '$http', 'EnergyUnitFactory', '$window', '$timeout', 'html2pdf','seriesService','UtilityService', function($scope, $rootScope, $http, EnergyUnitFactory, $window, $timeout, html2pdf,seriesService,UtilityService) {
            
            $scope.indicators = {}

	    var month_indicators= { "lighting":{max:100,min:0,value:50, label:"照明用电"}, "plug": {max:100,min:0,value:50, label:"设备与插座"}, "heating": {max:120,min:0,value:50, label:"取暖用电"}, "motor": {max:100,min:0,value:50, label:"动力用电"}, "cooling": {max:241,min:0,value:50, label:"空调制冷"}, "misc": {max:60,min:0,value:50, label:"特殊用电"}};

	    var year_indicators = { "lighting":{max:300,min:200,value:50, label:"照明用电"}, "plug": {max:300,min:200,value:50, label:"设备与插座"}, "heating": {max:300,min:100,value:50, label:"取暖用电"}, "motor": {max:100,min:0,value:50, label:"动力用电"}, "cooling": {max:241,min:0,value:50, label:"空调制冷"}, "misc": {max:600,min:0,value:300, label:"特殊用电"}};

            $scope.year= "0";
	    $scope.items = [[], [], []]

            var ready;
	    var temp_hash = {
		"mechanics": "motor",
		"hvac": "heating",
		"misc": "misc",
		"lighting_plug": "lighting",
		"plug": "plug",
		"cooling": "cooling"
	    }
            var hash={ '照明用电': 'lighting',
                       '设备与插座': 'plug',
                       '取暖用电': 'heating',
                       '动力用电': 'motor',
                       '空调制冷': 'cooling',
                       '特殊用电': 'misc'}
            
            if ($rootScope.$stateParams.id > 0) {
                ready=EnergyUnitFactory.getDetail($rootScope.$stateParams.id).then(function(buildingDetail) {
                    $scope.energysystemintro = (buildingDetail.objects[0] || {}).energysystemintro;
                    $scope.buildingDetail = buildingDetail.objects[0]||{};
                    //highcharts-redraw directive doesn't trigger for some reason, re-sizing this way for now
                    $timeout(function() { $scope.highchartsNG.getHighcharts().reflow(); });
                })
            }

            $scope.updateChart=function(){
		var startDate;
		var endDate = moment();
		
		$scope.indicators = year_indicators
		if($scope.year == "0"){ 	// past 30 days
		    var startDate = moment(moment()).subtract(1, 'month').valueOf();
		    $scope.indicators = month_indicators
		}else if($scope.year == "1"){	// year to date
		    var date = new Date(endDate);
		    var startDate = Math.round(new Date(date.getFullYear() + "/01/01 00:00:00").getTime())
		    console.log(date.getFullYear() + "/01/01 00:00:00")
		}else if($scope.year == "2"){	// past 12 months
		    var startDate = moment(moment()).subtract(1, 'year').valueOf();
		}else{				// past 12~24 months
		    var startDate = moment(moment()).subtract(2, 'year').valueOf();
		    var endDate = moment(moment()).subtract(1, 'year').valueOf();
		}

                $scope.items = [[], [], []]
                ready.then(function(){
                    seriesService.load($rootScope.$stateParams.id,startDate,endDate,{interval:"auto",disagg:"all"}).then(function(result){
                        var series=result;
                        topLevelData=[];

			$scope.item_index = 1

                        if(result.length==1){
                            topLevelData=[];
                            $scope.indicators={
                               'lighting': {value:0},
                               'plug': {value:0},
                               'heating':{value:0},
                               'motor': {value:0},
                               'cooling': {value:0},
                               'misc': {value:0}
                            }

                        }else{
			    angular.forEach($scope.indicators, function(v, k) {
				$scope.indicators[k]["value"] = 0
			    })

                            for(var i=0;i<series.length;i++){

                                var sdata=series[i];
                                if(sdata['name']=='总能耗')continue;
                                var data=(sdata.points||[]).reverse();
                                var energy= UtilityService.getAreaUnderCurve(data);
                                var progress=temp_hash[sdata.usage||""];
                                if(progress){
                                    var area=parseInt($scope.buildingDetail.buildingarea);
                                    if(area&&$scope.indicators[progress]){
                                        $scope.indicators[progress]['value']=(energy/area-$scope.indicators[progress]['min'])/($scope.indicators[progress]['max']-$scope.indicators[progress]['min'])*100;
                                    }

                                }
                                topLevelData.push({
                                name: sdata.usage||"",
                                y: energy,
                                //id: i,
                                //color: data[i].color
                                });
                            }

			    var index = 0
			    angular.forEach($scope.indicators, function(v, k) {
				if($scope.indicators[k]["value"] != 0){
				    console.log($scope.items[Math.floor(index/2)])
				    $scope.items[Math.floor(index/2)].push($scope.indicators[k])
				    index += 1
				}
			    })

			    console.log(JSON.stringify($scope.items))
                        }


                        $timeout(function(){
                            //angular.element($window).triggerHandler('resize');
                            $scope.highchartsNG.series[0].data=topLevelData;
                            $rootScope.resize();
                        },1000);

                    })
                });

            }


            $scope.highchartsNG = {
                options: {
                    chart: {
                        type: 'pie',
                        margin: 0,
                        spacing: 0,
                        padding: 0,
                        options3d: {
                            enabled: true,
                            alpha: 45,
                            beta: 0
                        },
                    },
                    title: { text: '' },
                    tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
                    legend: { enabled: false }, 
                    dataLabels: { enabled: false },
                    plotOptions: {
                        labels: { enabled: false },
                        pie: { size: '100%', innerSize: '50%', depth: 45, allowPointSelect: true, cursor: 'pointer', showInLegend: false, dataLabels: { enabled: false } },
                        series: {
                            point: {
                                events: {
                                    click: function(){
                                        var that = this;
                                        var data = $scope.highchartsNG.series[0].data;
                                            $.each(data, function(i, point) {
                                                $scope.$apply(function(){

                                                    point.selected = false;
                                                    if(point.name == that.name){
                                                        point.selected = true;
                                                        point.selectedColor = that.color;
                                                    }
                                                    

                                                });

                                            });

                                    },
                                    // legendItemClick: function() {
                                    //     var id = this.id;
                                    //     var data = this.series.chart.series[1].data;
                                    //     $.each(data, function(i, point) {

                                    //         if (point.parentId == id) {
                                    //             if (point.visible)
                                    //                 point.setVisible(false);
                                    //             else
                                    //                 point.setVisible(true);
                                    //         }

                                    //     });
                                    // }
                                }
                            }

                        }
                    },

                    credits: {
                        enabled: false
                    }
                },
                series: [
                    {
                        type: 'pie',
                        name: "Source",
                        colorByPoint: true,
                        size: '100%',
                        data: [],
                        dataLabels: { enabled: false, style: { width: '150px' }, color: '#6e6e6e', distance: 10, style: { "fontSize": "14px" }, format: '<b>{point.name}</b>: {point.percentage:.1f} %' }
                    }
                    //, {
                    //    type: 'pie',
                    //    name: "Sub-source",
                    //    colorByPoint: true,
                    //    size: '80%',
                    //    innerSize: '60%',
                    //    data: subLevelData,
                    //    showInLegend: false
                    //}
                ],
                loading: false
            };

            $scope.updateChart();

        }
    ])
