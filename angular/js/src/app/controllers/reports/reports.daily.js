angular.module('app.controllers.reports.daily', ['ui.bootstrap'])
    .controller('reportsDailyCtrl', [
        '$scope', '$rootScope', '$http', 'AllMetersService', 'WeatherFactory', 'EnergyUnitFactory', 'LanguageFactory', 'html2pdf', '$timeout', 'platform',
        function($scope, $rootScope, $http, AllMetersService, WeatherFactory, EnergyUnitFactory, LanguageFactory, html2pdf, $timeout, platform) {

            $scope.colorPeak = 'rgba(255, 0, 0, .1)';
            $scope.colorShoulder = 'rgba(0, 255, 0, .1)';
            $scope.colorValley = 'rgba(0, 0, 255, .1)';

            $scope.colorElectric = ['rgba(125, 0, 255, 1)', 'rgba(255, 0, 255, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 128, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 128, 128, 1)'];
            $scope.colorWeather = 'rgba(125, 125, 255, 1)';
            $scope.colorHumidity = 'rgba(50, 200, 152, 1)';
            
            // Indicators binding variable
            $scope.stats = {};
            // $scope.dt = Date.now();
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth(); //January is 0!
            var yyyy = today.getFullYear();
            $scope.dt = new Date(yyyy, mm, dd, 0, 0, 0, 0);
            // Series: Hourly = 0, Daily = 1, Monthly = 2
            $scope.serieType = 1;
            $scope.totalUsageToday = 55.23;
            $scope.percentFromYesterday = 3.0;
            $scope.upDownImage = "up";

            $scope.setupConfigBasedOnMonths = function (month)
            {
                if(month >=6 && month < 9)
                {// If Summer, July to Sep
                    $scope.hoursPeak = [8, 9, 10, 13, 14, 18, 19, 20];
                    $scope.hoursShoulder = [6, 7, 11, 12, 15, 16, 17, 21];
                    $scope.hoursValley = [0, 1, 2, 3, 4, 5, 22, 23];
                    $scope.dollarRatioPeak = 1.231;
                    $scope.dollarRatioShoulder = 0.769;
                    $scope.dollarRatioValley = 0.292;

                    $scope.backgroundColorsForChart1 = [{ from: -0.5, to: 5.5, color: $scope.colorValley },
                                { from: 5.5, to: 7.5, color: $scope.colorShoulder },
                                { from: 7.5, to: 10.5, color: $scope.colorPeak },
                                { from: 10.5, to: 12.5, color: $scope.colorShoulder},
                                { from: 12.5, to: 14.5, color: $scope.colorPeak },
                                { from: 14.5, to: 17.5, color: $scope.colorShoulder},
                                { from: 17.5, to: 20.5, color: $scope.colorPeak},
                                { from: 20.5, to: 21.5, color: $scope.colorShoulder},
                                { from: 21.5, to: 23.5, color: $scope.colorValley}];
                }
                else
                {
                    $scope.hoursPeak = [8, 9, 10, 18, 19, 20];
                    $scope.hoursShoulder = [6, 7, 11, 12, 13, 14, 15, 16, 17, 21];
                    $scope.hoursValley = [0, 1, 2, 3, 4, 5, 22, 23];

                    $scope.dollarRatioPeak = 1.196;
                    $scope.dollarRatioShoulder = 0.734;
                    $scope.dollarRatioValley = 0.357;

                    $scope.backgroundColorsForChart1 = [{ from: -0.5, to: 5.5, color: $scope.colorValley },
                                { from: 5.5, to: 7.5, color: $scope.colorShoulder },
                                { from: 7.5, to: 10.5, color: $scope.colorPeak },
                                { from: 10.5, to: 17.5, color: $scope.colorShoulder},
                                { from: 17.5, to: 20.5, color: $scope.colorPeak},
                                { from: 20.5, to: 21.5, color: $scope.colorShoulder},
                                { from: 21.5, to: 23.5, color: $scope.colorValley}];

                }
            };

            $scope.setupConfigBasedOnMonths(mm);

            //


            // Mockup data for properties panel
            $scope.properties = [
            { name: '日内最低小时能耗(Hourly Min)：', alias: '日内最低小时能耗(Hourly Min)', value: "" },
            { name: '日内最高小时能耗(Hourly Max):', alias: '日内最高小时能耗(Hourly Max)', value: "" },
            { name: '显示时段日平均能耗(Daily Average)', alias: '显示时段日平均能耗(Daily Average)', value: "" },
            { name: '系统负载因数 (Load Factor):', alias: '系统负载因数 (Load Factor)', value: "" },
            { name: '高峰用电百分比(Peak Energy %):', alias: '高峰用电百分比(Peak Energy %)', value: "" },
            ];

            $scope.dateChanged = function()
            {
                console.log($scope.dt);
                $scope.switchSerie($scope.dt);
            };



            $scope.seriesData = [];
            $scope.seriesElectric = [];
            $scope.seriesWeather = {
                        name: 'Temperature',
                        type: 'spline',
                        tooltip: {
                            valueSuffix: '°C'
                        },
                        color:$scope.colorWeather,
                        yAxis: 1,
                        data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3, 83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]

                    };
            $scope.seriesHumidity = {
                        name: 'Humidity',
                        type: 'spline',
                        tooltip: {
                            valueSuffix: ' %'
                        },
                        color:$scope.colorHumidity,
                        yAxis: 2,
                        data: [106.6, 92.3, 83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3, 83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5]
                    };

            // Switch between hourly / daily / monthly series
            $scope.switchSerie = function(date) {
                var params = { hour: false, month: false };

                var todayTime = date.getTime();
                var startTime = todayTime - 3600 * 24 * 1000;// / 1000;
                var endTime = todayTime + 3600 * 24 * 1000;

                var mmm = date.getMonth();

                // if(mmm >=6 && mmm < 9)
                // {// If Summer, July to Sep
                //     $scope.hoursPeak = [8, 9, 10, 13, 14, 18, 19, 20];
                //     $scope.hoursShoulder = [6, 7, 11, 12, 15, 16, 17, 21];
                //     $scope.hoursValley = [0, 1, 2, 3, 4, 5, 22, 23];
                //     $scope.dollarRatioPeak = 1.231;
                //     $scope.dollarRatioShoulder = 0.769;
                //     $scope.dollarRatioValley = 0.292;
                //
                //     $scope.backgroundColorsForChart1 = [{ from: -0.5, to: 5.5, color: $scope.colorValley },
                //                 { from: 5.5, to: 7.5, color: $scope.colorShoulder },
                //                 { from: 7.5, to: 10.5, color: $scope.colorPeak },
                //                 { from: 10.5, to: 12.5, color: $scope.colorShoulder},
                //                 { from: 12.5, to: 14.5, color: $scope.colorPeak },
                //                 { from: 14.5, to: 17.5, color: $scope.colorShoulder},
                //                 { from: 17.5, to: 20.5, color: $scope.colorPeak},
                //                 { from: 20.5, to: 21.5, color: $scope.colorShoulder},
                //                 { from: 21.5, to: 23.5, color: $scope.colorValley}];
                // }
                // else
                // {
                //     $scope.hoursPeak = [8, 9, 10, 18, 19, 20];
                //     $scope.hoursShoulder = [6, 7, 11, 12, 13, 14, 15, 16, 17, 21];
                //     $scope.hoursValley = [0, 1, 2, 3, 4, 5, 22, 23];
                //
                //     $scope.dollarRatioPeak = 1.196;
                //     $scope.dollarRatioShoulder = 0.734;
                //     $scope.dollarRatioValley = 0.357;
                //
                //     $scope.backgroundColorsForChart1 = [{ from: -0.5, to: 5.5, color: $scope.colorValley },
                //                 { from: 5.5, to: 7.5, color: $scope.colorShoulder },
                //                 { from: 7.5, to: 10.5, color: $scope.colorPeak },
                //                 { from: 10.5, to: 17.5, color: $scope.colorShoulder},
                //                 { from: 17.5, to: 20.5, color: $scope.colorPeak},
                //                 { from: 20.5, to: 21.5, color: $scope.colorShoulder},
                //                 { from: 21.5, to: 23.5, color: $scope.colorValley}];
                //
                // }
                $scope.setupConfigBasedOnMonths(mmm);

                $timeout(function(){

                    AllMetersService.load($rootScope.$stateParams.id,todayTime,endTime,{interval:"60m","disagg":"all"}).then(function(data) {

                        if(data && data.length > 0)
                        {
                            var seriesData = [];

                            var todayEnergy = 0;
                            var peakDemandOfDay = 0;

                            var energyPeak = 0;
                            var energyShoulder = 0;
                            var energyValley = 0;

                            var energyPeakDollar = 0;
                            var energyShoulderDollar = 0;
                            var energyValleyDollar = 0;

                            var k = 0;
                            $scope.seriesElectric = [];
                            $scope.seriesDollar = [];

                            var chart3SeriesData = [];

                            var totalSeries = [];
                            var minEnergy = 1000000;
                            var maxEnergy = 0;
                            var avgEnergy = 0;

                            for(var i = 0; i < data.length; i++)
                            {
                                var points = data[i].points;
                                var tm = 0;
                                var singleData = [];
                                var singleDataDollar = [];

                                var subTotal = 0;

                                for(k = points.length - 1; k >= 0; k--)
                                {
                                    tm = points[k][0];
                                    var curIndex = singleData.length;

                                    if($scope.hoursPeak.includes(curIndex))
                                    {
                                        energyPeak += points[k][1];
                                        energyPeakDollar += points[k][1] * $scope.dollarRatioPeak;
                                        singleDataDollar.push(points[k][1] * $scope.dollarRatioPeak);
                                    }
                                    if($scope.hoursShoulder.includes(curIndex))
                                    {
                                        energyShoulder += points[k][1];
                                        energyShoulderDollar += points[k][1] * $scope.dollarRatioShoulder;
                                        singleDataDollar.push(points[k][1] * $scope.dollarRatioShoulder);
                                    }
                                    if($scope.hoursValley.includes(curIndex))
                                    {
                                        energyValley += points[k][1];
                                        energyValleyDollar += points[k][1] * $scope.dollarRatioValley;
                                        singleDataDollar.push(points[k][1] * $scope.dollarRatioValley);
                                    }

                                    singleData.push(points[k][1]);
                                    todayEnergy += points[k][1];
                                    subTotal += points[k][1];



                                    if(i == 0)
                                    {
                                        totalSeries.push(points[k][1]);
                                    }
                                    else
                                    {
                                        if(totalSeries.length > k)
                                        {
                                            totalSeries[curIndex] = totalSeries[curIndex] + points[k][1];
                                        }

                                    }

                                    if(i == (data.length - 1))
                                    {
                                        if(maxEnergy < totalSeries[curIndex])
                                        {
                                            maxEnergy = totalSeries[curIndex];
                                        }
                                        if(minEnergy > totalSeries[curIndex])
                                        {
                                            minEnergy = totalSeries[curIndex];
                                        }
                                        avgEnergy += totalSeries[curIndex];
                                    }
                                }
                                avgEnergy = avgEnergy / data[0].points.length;

                                chart3SeriesData.push({name: data[i].usage, color: $scope.colorElectric[seriesData.length], y: subTotal});

                                var singleSerie = {name: data[i].usage, color: $scope.colorElectric[seriesData.length], tooltip: { valueSuffix: 'KW'}, type: 'column', yAxis: 0, data: singleData};
                                var dollarSerie = {name: data[i].usage, color: $scope.colorElectric[seriesData.length], tooltip: { valueSuffix: '$$'}, type: 'column', yAxis: 0, data: singleDataDollar};

                                seriesData.push(singleSerie);
                                $scope.seriesElectric.push(singleSerie);
                                $scope.seriesDollar.push(dollarSerie);
                            }

                            $scope.properties = [
                            { name: '日内最低小时能耗(Hourly Min)：', alias: '日内最低小时能耗(Hourly Min)', value: minEnergy.toFixed(2) },
                            { name: '日内最高小时能耗(Hourly Max):', alias: '日内最高小时能耗(Hourly Max)', value: maxEnergy.toFixed(2) },
                            { name: '显示时段日平均能耗(Daily Average)', alias: '显示时段日平均能耗(Daily Average)', value: avgEnergy.toFixed(2) },
                            { name: '系统负载因数 (Load Factor):', alias: '系统负载因数 (Load Factor)', value: (avgEnergy / maxEnergy).toFixed(2) },
                            { name: '高峰用电百分比(Peak Energy %):', alias: '高峰用电百分比(Peak Energy %)', value: (energyPeak / todayEnergy).toFixed(2) },
                            ];
                            $scope.totalUsageToday = todayEnergy;

                            $scope.seriesData = seriesData;
                            $scope.seriesData.push($scope.seriesWeather);
                            $scope.seriesData.push($scope.seriesHumidity);

                            $scope.chartOptions1.series = $scope.seriesData;
                            $scope.chartOptions1.options.xAxis.plotBands = $scope.backgroundColorsForChart1;

                            $scope.chartOptions2.series[0].data = [energyShoulder, 0];
                            $scope.chartOptions2.series[1].data = [0, energyShoulderDollar];// using 0.89 as fixed conversion rate for now
                            $scope.chartOptions2.series[2].data = [energyPeak, 0];
                            $scope.chartOptions2.series[3].data = [0, energyPeakDollar];// using 0.89 as fixed conversion rate for now
                            $scope.chartOptions2.series[4].data = [energyValley, 0 ];
                            $scope.chartOptions2.series[5].data = [0, energyValleyDollar];// using 0.89 as fixed conversion rate for now


                            $scope.chartOptions3.series[0].data = chart3SeriesData;// using 0.89 as fixed conversion rate for now
                        }
                        
                    });

                    WeatherFactory.get($rootScope.$stateParams.id,todayTime,endTime).then(function(data) {
                        // return;
                        // var series1Data = [];
                        if(data && data.length > 0)
                        {
                            var series1Data = [];
                            var series2Data = [];
                            var points = data;
                            for (var k = 0; k < points.length; k++) {
                                series1Data.push(points[k][1]);
                                series2Data.push(points[k][2]);
                            }

                            $scope.seriesWeather.data = series1Data;
                            $scope.seriesHumidity.data = series2Data;

                            $scope.seriesData = [];
                            for(var j=0; j < $scope.seriesElectric.length; j++)
                            {
                                $scope.seriesData.push($scope.seriesElectric[j]);
                            }

                            $scope.seriesData.push($scope.seriesWeather);
                            $scope.seriesData.push($scope.seriesHumidity);
                            $scope.chartOptions1.series = $scope.seriesData;
                        }
                    });

                }, 0);

            }


            $scope.chartOptions1 = {
                options: {
                    chart: {
                        zoomType: 'xy'
                        // type: 'column', panning: true, margin: [55, 0, 0, 0]
                    },
                    title: null,
                    xAxis: {
                        categories: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
                            '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'
                        ],
                        crosshair: true,
                        gridLineWidth: 0,
                        plotBands: $scope.backgroundColorsForChart1
                    },
                    yAxis: [{
                        lineColor: '#00ffff',
                        labels: { format: '{value} KW', style: { color: Highcharts.getOptions().colors[1]} },//x: 10, y: -5,
                        title: { text: 'Electricity', style: { color: Highcharts.getOptions().colors[1] } },//{ text: '能源效率' },
                        opposite: false,
                    },
                        {
                        // lineWidth: 0,
                        lineColor: '#fff',
                        labels: { format: '{value}°C',  style: { color: Highcharts.getOptions().colors[1]} },//x: 10, y: -5,
                        title: { text: 'Temperature', style: { color: Highcharts.getOptions().colors[1] } },//{ text: '能源效率' },
                        opposite: true,visible:false
                    },{
                        // lineWidth: 0,
                        lineColor: '#fff',
                        labels: { format: '{value} %',  style: { color: Highcharts.getOptions().colors[1]} },//x: 10, y: -5,
                        title: { text: 'Humidity', style: { color: Highcharts.getOptions().colors[1] } },//{ text: '能源效率' },
                        opposite: true, visible: false
                    }
                    ],

                    legend: {
                        layout: 'vertical',
                        align: 'left',
                        x: 120,
                        verticalAlign: 'top',
                        y: 20,
                        floating: true,
                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                    },
                    tooltip: {
                        // headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        // pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        //     '<td style="padding:0"><b>{point.y:.1f} </b></td></tr>',
                        // footerFormat: '</table>',
                        shared: true,
                        // useHTML: true
                    },
                    plotOptions: {
                        column: {
                            pointPadding: 0.2,
                            borderWidth: 0,
                            stacking: 'normal',
                        }
                    }
                },
                series: [
                    {
                        name: 'A',
                        tooltip: {
                            valueSuffix: 'KW'
                        },
                        type: 'column',
                        yAxis: 0,
                        data: [144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4, 49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4, 49.9, 71.5, 106.4, 129.2]

                    },
                    {
                        name: 'B',
                        tooltip: {
                            valueSuffix: 'KW'
                        },
                        type: 'column',
                        yAxis: 0,
                        data: [135.6, 148.5, 216.4, 194.1, 95.6, 54.4, 49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4, 49.9, 71.5, 106.4, 129.2, 144.0, 176.0]

                    },
                    {
                        name: 'C',
                        tooltip: {
                            valueSuffix: 'KW'
                        },
                        type: 'column',
                        yAxis: 0,
                        data: [129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4, 49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4, 49.9, 71.5, 106.4]

                    },
                    {
                        name: 'Electricity',
                        tooltip: {
                            valueSuffix: 'KW'
                        },
                        type: 'column',
                        yAxis: 0,
                        data: [216.4, 194.1, 95.6, 54.4, 49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4, 49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5]
                    },
                    {
                        name: 'Temperature',
                        type: 'spline',
                        tooltip: {
                            valueSuffix: '°C'
                        },
                        // showInLegend: false,
                        yAxis: 1,
                        data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3, 83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]

                    }, {
                        name: 'Humidity',
                        type: 'spline',
                        tooltip: {
                            valueSuffix: ' %'
                        },
                        // showInLegend: false,
                        yAxis: 2,
                        data: [106.6, 92.3, 83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3, 83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5]

                    }
                ]
            };

            $scope.chartOptions2 = {

                chart: {
                    type: 'column',
                },


                title: {
                    text: 'Electricity Usage in Peak, Shoulder, Valley'
                },

                xAxis: {
                        categories: ['KWH', '$$'],crosshair: true
                },
                yAxis: [{
                    lineColor: '#00ffff',
                    labels: { format: '{value} KW',  style: { color: Highcharts.getOptions().colors[1]} },x: 10, y: -5,
                    title: { text: 'Electricity', style: { color: Highcharts.getOptions().colors[1] } },//{ text: '能源效率' },
                    opposite: false,
                    // showLastLabel: false,
                    // maxPadding:10.0
                },{
                    lineColor: '#fff',
                    labels: { format: '{value} $', style: { color: Highcharts.getOptions().colors[1]} },//x: 10, y: -5,
                    title: { text: 'Dollar', style: { color: Highcharts.getOptions().colors[1] } },//{ text: '能源效率' },
                    opposite: true,
                    // showLastLabel: false,
                    // maxPadding:10.0
                }
                ],

                tooltip: {
                    formatter: function () {
                        return '<b>' + this.series.xAxis.categories[this.point.x] + '</b> sold <br><b>' +
                            this.point.value + '</b> items on <br><b>' + this.series.yAxis.categories[this.point.y] + '</b>';
                    }
                },
                legend: {
                    // floating: true,
                    enabled: false
                },
                series: [
                    {
                    name: 'Shoulder',
                    type: 'column',
                    data: [149.9, 0],
                        yAxis: 0,
                        showInLegend: false,
                        pointWidth: 30
                },
                    {
                    name: 'Shoulder',
                    type: 'column',
                    data: [0, 53.0],
                        yAxis: 1,
                        showInLegend: false,
                        pointWidth: 30
                },
                    {
                    name: 'Peak',
                    type: 'column',
                    data: [183.6, 0],
                        yAxis: 0,
                        showInLegend: false,
                        pointWidth: 30

                },
                    {
                    name: 'Peak',
                    type: 'column',
                    data: [0, 78.8],
                        yAxis: 1,
                        showInLegend: false,
                        pointWidth: 30

                },
                    {
                    name: 'Valley',
                    type: 'column',
                    data: [148.9,0],
                        yAxis: 0,
                        showInLegend: false,
                        pointWidth: 30

                },
                    {
                    name: 'Valley',
                    type: 'column',
                    data: [0, 78.8],
                        yAxis: 1,
                        showInLegend: false,
                        pointWidth: 30
                },
                ]

            };


            $scope.chartOptions3 = {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'Energy usage for the day'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        },
                series: [{
                    name: 'Electricity Usage(%)',
                    type: 'pie',
                    colorByPoint: true,
                    data: [{
                        name: 'Computer',
                        y: 56.33
                    }, {
                        name: 'Air Conditioner',
                        y: 24.03,
                        sliced: true,
                        selected: true
                    }, {
                        name: 'Freezer',
                        y: 10.38
                    }, {
                        name: 'Water boiler',
                        y: 4.77
                    }, {
                        name: 'Light',
                        y: 0.91
                    }, {
                        name: 'Other',
                        y: 0.2
                    }]
                }]
            };
        }
    ])
