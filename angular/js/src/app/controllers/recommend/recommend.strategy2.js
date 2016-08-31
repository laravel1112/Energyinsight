angular.module('app.controllers.recommendations.strategies.strategy2', [])

    .controller('strategy2Ctrl', ['$scope', '$rootScope', 'FormService', 'uiGridConstants', '$http', '$q', 'AllMetersService', 'UtilityService', '$timeout', '$window', function ($scope, $rootScope, FormService, uiGridConstants, $http, $q, AllMetersService, UtilityService, $timeout, $window) {
        var cancelLoad = $q.defer();
        $scope.sliderConfig = {
            floor: 0, ceil: 4, onChange: function() { $scope.change(); }, showTicks: true, showTicksValues: true,
            translate: function (value) {
                switch (value) {
                    case 0: return '0h';
                    case 1: return '30m';
                    case 2: return '1h';
                    case 3: return '1:30';
                    case 4: return '2h';
                }
            }
        }


        $scope.highchartNG={
                    options: {
                    chart: { alignTicks: false },
                    title: null, //{ text: '_', style: { 'color': 'white' } },
                    xAxis: { type: 'datetime', labels: { align: 'left', x: 5, y: 14, format: '{value:%B}' } }, // long month
                    yAxis: [
                         {
                            // Energy
                            gridLineWidth: 1, minorGridLineWidth: 0,
                            title: { text: '总电费', style: { color: '#5AA5E9' } },
                            labels: { format: '{value} ￥', style: { color: '#5AA5E9' } }
                        }
                    ],
                    tooltip: {
                        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.2f}</b> ({point.percentage:.0f}%)<br/>',
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
                        type: 'column', name: '节省', id: 'save',
                        tooltip: { pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.2f}</b><br/>' },
                        data: [],
                    },
                    {
                        type: 'column', name: '能耗', id: 'realdata', color: '#5AA5E9',
                        tooltip: { pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.2f}</b><br/>' },
                        data: [],
                    }
                ]
        }
        $scope.time = 1;
        var p=UtilityService.getEnergyPrice()
        p.then(function(result){
            $scope.price=result;
        });
        $scope.change = function () {
            if (!$scope.highchartData) return;
            var groupedEnergy = [], savedEnergy = [];
            var stats= { usage: { h: 0, m: 0, l: 0 }, charge: { h: 0, m: 0, l: 0 }, change: { h: 0, m: 0, l: 0 }, priceDiff: { h: 0, m: 0, l: 0 } };
            for (key in $scope.highchartData){
                if($scope.highchartData.hasOwnProperty(key)) {
                    var d = $scope.highchartData[key];

                    var time = d[0];
                    var p = UtilityService.isSummer(time) ? $scope.price['s'] : $scope.price['ns'];
                    var peakHours = UtilityService.isSummer(time) ? 7 : 6;
                    var e = d[1];

                    //var eDiff = e['h'] * $scope.time / peakHours; <-- !!! WARNING: e['h'] is originaly written, but not defined
                    var eDiff = e['m'] * $scope.time / peakHours;

                    var total = e['h'] * p['h'] + e['m'] * p['m'] + e['l'] * p['l'];
                    var save = (e['h'] * $scope.time / peakHours) * (p['h'] - p['l']);
                    stats['usage']['h'] += e['h'] || 0;
                    stats['usage']['m'] += e['m'] || 0;
                    stats['usage']['l'] += e['l'] || 0;

                    stats['change']['h'] -= eDiff;
                    stats['change']['l'] += eDiff;

                    groupedEnergy.push([new Date(time).getTime(), total]);
                    savedEnergy.push([new Date(time).getTime(), save]);
                }
            }
            stats['charge']['h'] = stats['usage']['h'] * p['h'];
            stats['charge']['m'] = stats['usage']['m'] * p['m'];
            stats['charge']['l'] = stats['usage']['l'] * p['l'];
            stats['priceDiff']['h']=stats['change']['h']*p['h'];
            stats['priceDiff']['l']=stats['change']['l']*p['l'];
            $scope.stats = stats;

            $scope.chartGaugeOptions1.series[0].data = [{ name: '高峰能耗', y: (stats['usage'].h || 0) + (stats['change'].h || 0) }, { name: '平谷能耗', y: (stats['usage'].m||0) }, { name: '低谷能耗', y: (stats['usage'].l||0) + (stats['change'].l||0) }];

            $scope.chartGaugeOptions2.series[0].data = [{ name: '高峰费用', y: (stats['charge']['h']||0) + (stats['priceDiff']['h']||0) }, { name: '平谷费用', y: (stats['charge']['m']||0) }, { name: '低谷费用', y: (stats['charge']['l']||0) + (stats['priceDiff']['l']||0) }];

            var dataserie = _.find($scope.highchartNG.series, function (d) {
                return d.id == 'realdata'
            });
            var saveserie = _.find($scope.highchartNG.series, function(d) {
                return d.id == 'save'
            });

            dataserie.data=groupedEnergy;
            saveserie.data=savedEnergy;
        }
        $scope.load = function () {
            $scope.loading = true;
            var allPromises=[];
            allPromises.push($http.get('/api/stratege/0', { timeout: cancelLoad.promise }));
            if ($rootScope.$stateParams.id > 0) {
                var curtime = new Date();
                var lastyear=new Date(curtime);
                lastyear.setYear(lastyear.getFullYear()-1);
                allPromises.push(AllMetersService.load($rootScope.$stateParams.id, lastyear.getTime(),curtime.getTime()));
            }else{
                allPromises.push($q.reject({error:"no building selected"}));
            }
            $q.all(allPromises).then(function(result){
                // After this request is finished, then remove the "loading" view
                $scope.loading = false;

                //$scope.resultData = result[0];
                var points = ((result[1][0] || {}).points || []).reverse();

                var groupedData=_.groupBy(points,function(d){
                    var date=new Date(d[0]);
                    var day="0"+date.getDate();
                    var month="0"+(date.getMonth()+1);
                    var year = date.getFullYear();
                    return year + "/" + month.slice(-2); // ex: 2015/11
                });

                $scope.highchartData=[];

                for (key in groupedData){
                    if(groupedData.hasOwnProperty(key)){
                        var d=groupedData[key];
                        var energy=UtilityService.getAreaUnderCurve(d,{partitions:true});
                        $scope.highchartData.push([key,energy]);
                    }
                }

                $scope.change();

            },function(err){
                console.log("error",err);
            })
        }
        $scope.load();


        //TODO: Define chart options
        $scope.onCancelStrategy = function () {
            $rootScope.$state.go('root.home.unit.recommendations.strategies');
        }


        $scope.chartGaugeOptions1 = {
            options: {
                chart: {
                    type: 'pie'
                },
                title:'',
                // title:{text:'时间段能耗比例'},
                tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
                legend: {
                    enabled: true,
                    layout: 'vertical',
                    align: 'right',
                    width: 200,
                    verticalAlign: 'middle',
                    useHTML: true,
                    labelFormatter: function() {
                        return '<div style="width:150px;"><div style="margin-bottom: 5px;text-align: left; width:100px;float:left;">' + this.name + '</div><div style="width:40px; float:left;text-align:left;">' + this.y.toFixed(2) + '</div></div>';
                    }
                },
                plotOptions: {
                    pie: { allowPointSelect: false, cursor: 'pointer', showInLegend: true }
                },
                credits: { enabled: false },
            },
            series: [
                {
                    data: [],
                    type: 'pie', colorByPoint: true, size: '100%',
                    dataLabels: { enabled: false, color: '#6e6e6e', distance: 10, style: { "fontSize": "14px" }, format: '<b>{point.name}</b>: {point.percentage:.1f} %' }
                }
            ],
            loading: false
        };

        $scope.chartGaugeOptions2 = {
            options: {
                chart: { type: 'pie' },
                title: { text: '' },
                tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
                legend: {
                    enabled: true,
                    layout: 'vertical',
                    align: 'right',
                    width: 200,
                    verticalAlign: 'middle',
                    useHTML: true,
                    labelFormatter: function() {
                        return '<div style="width:150px;"><div style="margin-bottom: 5px;text-align: left; width:100px;float:left;">' + this.name + '</div><div style="width:40px; float:left;text-align:left;">' + this.y.toFixed(2) + '</div></div>';
                    }
                },
                plotOptions: {
                    pie: { allowPointSelect: false, cursor: 'pointer', showInLegend: true },
                },
                credits: { enabled: false }
            },
            series: [
                {
                    data: [],
                    type: 'pie', name: "Source", colorByPoint: true, size: '100%',
                    dataLabels: { enabled: false, color: '#6e6e6e', distance: 10, style: { "fontSize": "14px" }, format: '<b>{point.name}</b>: {point.percentage:.1f} %' }
                }
            ],
            loading: false
        };

        $scope.$on('$destroy', function () {
            cancelLoad.resolve();
        });

    }])