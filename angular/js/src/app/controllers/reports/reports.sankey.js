angular.module('app.controllers.reports.sankey', [])
    .controller('reportsSankeyCtrl', [
        '$scope', '$rootScope', '$sce', '$timeout', '$window', 'html2pdf', 'AllMetersService', 'WeatherFactory', function($scope, $rootScope, $sce, $timeout, $window, html2pdf, AllMetersService, WeatherFactory) {
            $scope.year="1";
            $scope.bldg_id = $rootScope.$stateParams.id;

            var occupancy_config = {
                occupied_slots: [
                    {
                        dow: [1,2,3,4,5],
                        hod: [8,9,10,11,12,13,14,15,16,17]
                    }
                ]
            }

            var occupied = function (dow,hod){
                var occupied_slots_test = _.map(occupancy_config.occupied_slots,function(slot){
                    return slot.dow.indexOf(dow)>=0 & slot.hod.indexOf(hod)>=0;
                });
                return _.reduce(occupied_slots_test,function(a,b){
                    return a & b;
                },true);
            }

            //a sankey chart shows flow from first level meters to last level meters to (maybe subsegmentations) to following segmentation:
            //lighting': '照明用电',
            //'plug': '设备与插座',
            //'heating': '取暖用电',
            //'motor': '动力用电',
            //'cooling': '空调制冷',
            //'misc':特殊用电'
            $scope.updateChart = function(){
                var interval = "60m";
                var year=parseInt($scope.year)||1;
                var startDate = moment().subtract(year, 'y').startOf('day').valueOf(); // year ago
                var endDate = moment().subtract(year-1, 'y').add(1, 'd').startOf('day').valueOf(); // end of today
                AllMetersService.load($rootScope.$stateParams.id,startDate,endDate,{
                    interval:interval,
                    disagg: "all"
                }).then(function(data){
                    var consump_data = data[0].points;
                    WeatherFactory.get($rootScope.$stateParams.id,startDate,endDate,{
                        interval:interval,
                    }).then(function(data){
                        var temp_data = data;
                        //merging consumption data and temperature data together
                        var dayTemps = _.groupBy(temp_data,function(temp){
                            var d = new Date(temp[0]);
                            var dow = d.getDay();
                            var hod = d.getHours();
                            var day = "00" + d.getDate();
                            var month ="00"+ (d.getMonth() + 1);
                            var year = d.getFullYear();
                            return JSON.stringify({
                                d: year + "/" + month.slice(-2) + "/" + day.slice(-2),
                                o: occupied(dow,hod)
                            })
                        })
                        var dayConsumps = _.groupBy(consump_data,function(consump){
                            var d = new Date(consump[0]);
                            var dow = d.getDay();
                            var hod = d.getHours();
                            var day = "00" + d.getDate();
                            var month ="00"+ (d.getMonth() + 1);
                            var year = d.getFullYear();
                            return JSON.stringify({
                                d: year + "/" + month.slice(-2) + "/" + day.slice(-2),
                                o: occupied(dow,hod)
                            })
                        })
                        //calculate the [temperature,consumption] of each day and stired in a map
                        var dayTempConsumpMap = {}; //{{d:'2016/05/21',o:1}: [26, 4567], {d:'2016/05/22',o:1}: [27, 5676]}
                        _.forEach(dayTemps, function(v, k) {
                            var temp_avg = Math.round(_.reduce(v,function(sum,x){
                                return sum + x[1];
                            },0) / v.length);
                            dayTempConsumpMap[k] = [temp_avg,null];
                        });
                        _.forEach(dayConsumps, function(v, k) {
                            var consump_avg = Math.round(_.reduce(v,function(sum,x){
                                return sum + x[1];
                            },0) / v.length);
                            if(dayTempConsumpMap[k] != undefined){
                                //only update consump where temperature is available
                                dayTempConsumpMap[k][1] = consump_avg;
                            }
                        });
                        //plot dayTempConsump
                        //var x = dayTempConsumpMap;
                        $scope.highchartsNG.series[0].data=_.values(_.pick(dayTempConsumpMap,function(v,k){
                            var ko = JSON.parse(k);
                            return ko.o == 0;
                        }));
                        $scope.highchartsNG.series[1].data=_.values(_.pick(dayTempConsumpMap,function(v,k){
                            var ko = JSON.parse(k);
                            return ko.o == 1;
                        }));
                    })
                });
            }

/*$scope.highchartsNG = {
        options: {
            chart: {
                type: 'bar'
            }
        },
        series: [{
            data: [10, 15, 12, 8, 7]
        }],
        title: {
            text: 'Hello'
        },
        loading: false
    }*/

            $scope.highchartsNG = {
                options: {
                    chart: { 
                        type: 'scatter',
                    },
                    title: null, //{ text: '_', style: { 'color': 'white' } },
                        
                    xAxis: { 
                        opposite: false,
                        minorTickColor: '#eee',
                        //minorGridLineWidth: 0,
                        
                        //tickWidth: 1,
                        //tickLength: 10,
                        tickColor: '#ccc',
                        gridLineColor: "#eee",

                        lineWidth:0,
                        lineColor: "#ccc", 
                        plotBands: [
                            {color: 'lightblue', from: -100, to: 8},
                            {color: 'lightgray', from: 8, to: 20},
                            {color: 'pink', from: 20, to: 100}
                        ],
                        labels: { align: 'center', x: -10, y: -25, format: '{value}°C', style: { color: '#2C5384' } },
                        min: -10, max: 40, tickInterval: 5
                    },
                    yAxis: //[
                        {
                            // Consumption
                            //gridLineWidth: 0, minorGridLineWidth: 0,
                            title: null, // { text: '平均温度', style: { color: '#2C5384' } },
                            labels: { align: 'right', x: -10, y: -5, format: '{value}MWh', style: { color: '#2C5384' } },
                            opposite: true,
                            showLastLabel: false,
                            tickInterval: 100,
                        },
                    //],
                    tooltip: {
                        crosshairs: [true,true],
                        //pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
                        shared: true
                    },
                    plotOptions: {
                        scatter: {
                            marker: {
                                radius: 5,
                                states: {
                                    hover: {
                                        enabled: true,
                                        lineColor: 'rgb(100,100,100)'
                                    }
                                }
                            },
                            states: {
                                hover: {
                                    marker: {
                                        enabled: false
                                    }
                                }
                            },
                            tooltip: {
                                headerFormat: '<b>{series.name}</b><br>',
                                pointFormat: '{point.x} c, {point.y} kw'
                            }
                        }
                    },
                    credits: { enabled: false }
                },
                /*series: [{
                    data: [],
                }],*/
                series: [
                    {
                        name: '能耗-Unoccupied', id: 'nonoccupied_data', color: '#5AA5E9',
                        //tooltip: { pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.2f}</b><br/>' },
                        data: [],
                        showInLegend: true
                    },
                    {
                        name: '能耗-Occupied', id: 'occupied_data', color: 'red',
                        //tooltip: { pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.2f}</b><br/>' },
                        data: [],
                        showInLegend: true
                    },
                ]
            }

            if ($rootScope.$stateParams.id > 0) {
                //$scope.updateChart();
            }

            $scope.export = function(){
                html2pdf.export($("#export-container"), 'Report.Sankey');
            }
        }
    ])