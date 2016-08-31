angular.module('app.controllers.charts.summary', [])

    .controller('chartsCtrl', ['$scope', '$rootScope', '$filter', 'seriesService', 'EnergyUnitFactory', 'uiGridConstants', '$q', '$window', '$http', '$timeout', '$interval', 'csv2json', 'LanguageFactory', function ($scope, $rootScope, $filter, seriesService, EnergyUnitFactory, uiGridConstants, $q, $window, $http, $timeout, $interval, csv2json,LanguageFactory) {
        $scope.formData = null;

        $scope.startDate = moment().subtract(1, 'M').valueOf();
        $scope.endDate = moment().valueOf();

        $scope.minDate = moment().subtract(2, 'y').valueOf();
        $scope.maxDate = moment().valueOf();

        // auto refresh feature
        var stopRefresh, stopCountdown;
        $scope.countdown = 15;
        $scope.toggleRefresh = false;
        $scope.$watch('toggleRefresh', function(newVal){
            if ($scope.toggleRefresh)
            {
                $scope.countdown = 15;
                stopCountdown = $interval(function() {
                    $scope.countdown--;
                }, 1000);

                stopRefresh = $interval(function() {
                    $scope.countdown = 15;
                    if(!$rootScope.isBusy){
                        var chart = $scope.chartOptions1.getHighcharts();
                        var extremes = chart.xAxis[0].getExtremes();
                        chart.xAxis[0].setExtremes(moment(extremes.min).add(15, 'seconds'), moment(extremes.max).add(15, 'seconds'));
                    }
                }, 15000);
            }
            else
            {
                if(angular.isDefined(stopCountdown)){
                    $interval.cancel(stopCountdown);
                    stopCountdown = undefined;
                }
                if(angular.isDefined(stopRefresh)){
                    $interval.cancel(stopRefresh);
                    stopRefresh = undefined;
                }
            }
        });

        $scope.meters = [];

        /* CHART RELATED */

        // Initial chart extremes
        // $timeout(function(){
        //     var chart = $scope.chartOptions1.getHighcharts();
        //     chart.xAxis[0].setExtremes($scope.startDate, $scope.endDate);
        //     $scope.redraw();
        // });

        // Chart redraw
        $scope.redraw = function () {
            var chart = $scope.chartOptions1.getHighcharts();
            if(chart){
                chart.redraw();
                chart.reflow();
                $timeout(function () {
                    angular.element($window).triggerHandler('resize');
                });
            }
        };
        $timeout($scope.redraw);

        var minLimit, maxLimit;

        var unbindSerieChecked = $rootScope.$on('chart-serie-checked', function (event, node) {

            // Find meter on chart by id
            var items = $scope.chartOptions1.series.filter(function(item) {
                return item.cachedID == node.id;
            });

            // Plot or remove meter from the chart, influxKey param must be present
            if (items.length == 0 && node.influxKey) {

                //Load data for navigator and init main series
        		var seriesOptions={interval:"auto"};
        		if(node.disagg) seriesOptions.disagg=node.disagg;
        		        
            	seriesService
                    .load(node.euid, $scope.minDate, $scope.maxDate, seriesOptions)
                    .then(function (data) {
                        data=data[0]||{};
                        var points=data.points||[];
                        points = points.reverse();

                        var chartSeries = { id: node.id, name: node.name, color: node.color, data: [], cachedID: node.id, influxKey: node.influxKey, yAxis: 0, euid: node.euid, disagg: node.disagg, nodetype: node.type };
                        var navSeries = { name: node.name, xAxis: 1, yAxis: 3, data: points, color: node.color, cachedID: node.id, euid: node.euid, disagg: node.disagg, enableMouseTracking: false };

                        if(node.type == 4) // occupancy rate
                        {
                            $scope.chartOptions1.options.yAxis[1].visible = true;                            
                            chartSeries.yAxis = 1
                        }

                        if(node.type == 7) // temp
                        {
                            $scope.chartOptions1.options.yAxis[2].visible = true;                            
                            chartSeries.yAxis = 2
                        }

                        // Init main data serie with no data
                        $scope.chartOptions1.series.push(chartSeries);

                        // Add retrived data to navigator
                        $scope.chartOptions1.series.push(navSeries);

                        var _minLimit = _.min(points, function(item) { return item[0]; } )[0];
                        var _maxLimit = _.max(points, function(item) { return item[0]; } )[0];

                        //minLimit = minLimit < _minLimit ? minLimit : _minLimit;
                        //maxLimit = maxLimit > _maxLimit ? maxLimit : _maxLimit;
                        


                        // HACK: fake serie to fix chart panning 
                        $scope.chartOptions1.series.push({ 
                            data:[{ x: _maxLimit, y: 0}, { x: _minLimit, y: 0}], 
                            color: 'rgba(0,0,0,1)',
                            enableMouseTracking:false,
                            fake: true
                        });

                        // Add retrived data to navigator
                        $scope.chartOptions1.series.push(navSeries);
                        //console.log('$scope.chartOptions1.series ' , $scope.chartOptions1.series);

                        // Add table column
                        var fieldName = 'field' + node.id;
                        $scope.addColumn(fieldName, node.name, node.color, {
                            dailyavg: '-',
                            dailymax: '-',
                            dailymin: '-',
                            hourlymax: '-',
                            hourlymin: '-',
                            peakPercent: '-'
                        });

                        // Trigger AfterSetExtremes event
                        $timeout(function(){
                            var chart = $scope.chartOptions1.getHighcharts();
                            var ax=chart.xAxis[0].getExtremes();
                            var startDate=ax.min;
                            var endDate=ax.max;

                            // [ minLimit [min max] maxLimit ]
                            //if(ax.min > _maxLimit || ax.max < _minLimit){
                                endDate = _maxLimit;// - (ax.max - ax.min) / 2; // 
                                startDate = endDate - (ax.max - ax.min);
                            //}

                            chart.xAxis[0].setExtremes(startDate+1, endDate+1);
                            //afterSetExtremes(null,{chart:chart,startDate:startDate,endDate:endDate});
                            //chart.xAxis[0].setExtremes(moment(startTick).subtract(1, 'M'), moment(startTick));
                        });
                    });

            } else if (items.length > 0) {

                // remove chart and nav series
                for (var i = 0; i < items.length; i++) {
                    var index = $scope.chartOptions1.series.indexOf(items[i]);
                    if (index > -1){

                        
                        if($scope.chartOptions1.series[index].nodetype == 4) // occupancy rate
                        {
                            $scope.chartOptions1.options.yAxis[1].visible = false;
                        }

                        if($scope.chartOptions1.series[index].nodetype == 7) // temp
                        {
                            $scope.chartOptions1.options.yAxis[2].visible = true;                            
                        }

                        $scope.chartOptions1.series.splice(index, 1);

                    }
                }

                // remove table column
                $scope.removeColumn('field' + node.id);

                // hide meter details
                meterDetails = null;

            }
        });

        var onLayoutResize = $rootScope.$on('layout-resize', function () {
            $scope.redraw();
        });

        //Highstock chart options
        $scope.chartOptions1 = {
            options: {
                chart: { margin: [50, 0, 0, 0], panning: true, panKey: 'shift' },
                title:  null,
                legend: { enabled: false },
                navigator: {
                    enabled: true,
                    adaptToUpdatedData:false,
                    xAxis: {
                        min: $scope.minDate,
                        max: $scope.maxDate,
                        ordinal: false
                    },
                    series:{
                        name:'Navigator',
                        enableMouseTracking: false,
                        data: []
                    },
                },
                scrollbar: { enabled: false, liveRedraw: false },
                rangeSelector: {
                    enabled: false,
                    buttons: null,
                    // {
                    //     type: 'day',
                    //     count: 1,
                    //     text: '1d'
                    // },{
                    //     type: 'week',
                    //     count: 1,
                    //     text: '1w'
                    // }, {
                    //     type: 'week',
                    //     count: 6,
                    //     text: '6w'
                    // }, {
                    //     type: 'month',
                    //     count: 1,
                    //     text: '1M'
                    // },{
                    //     type: 'month',
                    //     count: 3,
                    //     text: '3M'
                    // },{
                    //     type: 'month',
                    //     count: 6,
                    //     text: '6M'
                    // },{
                    //     type: 'year',
                    //     count: 1,
                    //     text: '1year'
                    // },{
                    //     type: 'all',
                    //     text: 'All',
                    //     count: 0
                    // }],
                    //selected: 3, 
                    inputEnabled: false, 
                    //inputDateFormat: '%Y-%m-%d'
                },
                xAxis:{
                    ordinal: false,
                    type: 'datetime',
                    minorGridLineWidth: 0,
                    min: $scope.startDate,
                    max: $scope.endDate,
                    events : {
                        afterSetExtremes : afterSetExtremes
                    },
                    opposite: true,
                },
                yAxis: [
                    {
                        // Meter
                        title: null, //{ text: '能耗有效功率(kW)' },
                        minorGridLineWidth: 0, tickPixelInterval: 100, opposite: false, labels: { align: 'left', x: 5, y: -3 }
                    },
                    {
                        // Occupancy rate
                        visible: false,
                        title: { text: '入住率' }, endOnTick: true,
                        minorGridLineWidth: 0, gridLineWidth: 0, opposite: true, min: 0, max: 150, tickInterval: 25,  tickPosition: 'outside',
                        labels: { format: '{value}', align: 'right', x: -15, style: { color: '#2C5384' } },
                    },
                    {
                        // Temperature
                        visible: false,
                        title: { text: '平均温度' },
                        minorGridLineWidth: 0, gridLineWidth: 0, opposite: true, min: -20, max: 90, tickInterval: 5, tickPosition: 'outside',
                        labels: { format: '{value}°C', align: 'right', x: -75, style: { color: '#2C5384' } },
                    }
                ],
                plotOptions: {
                    areaspline: { fillOpacity: 0.0 },
                    series: {
                        lineWidth:2,
                        states:{
                            hover:{
                                enable:false,
                                lineWidth:2
                            }
                        },
                        fillOpacity: 0.1, 
                        marker: { enabled: false, symbol: 'triangle' }
                    },
                    line: { marker: { enabled: false, symbol: 'triangle' }, gapSize:2 }
                },
                tooltip: {
                    crosshairs: false
                },
                // tooltip: {
                //     shared: false,
                //     valueSuffix: '',
                //     pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                //     valueDecimals: 2
                // },
                credits: { enabled: false }
            },
            series: [],
            useHighStocks: true
        };

        function afterSetExtremes(e,options) {
            e=e||{};
            e.target=e.target||{}
            var charts=e.target.chart||options.chart;

            // load threshold 
            if($scope.t)
                $timeout.cancel($scope.t);

            $scope.t = $timeout(function () {
                loadData(e,options)
            },500);
            

            function loadData(ev,option) {
                if(!option && !ev.min && !ev.max) return;


                $scope.startDate = Math.round(ev.min)||option.startDate;
                $scope.endDate = Math.round(ev.max)||option.endDate;

                if (!$scope.startDate || !$scope.endDate) return;

                charts.showLoading('Loading...');


                var promises = _.map($scope.chartOptions1.series, function (serie) {
                    
                    if (!serie.influxKey) return;
                    
                    var loadOptions={interval:"auto"};
                    if(serie.disagg)
                        loadOptions.disagg=serie.disagg; 
                    

                    return seriesService.load(serie.euid, $scope.startDate, $scope.endDate,loadOptions).then(function (data) {
                            data=data[0]||{};
                            var points=data.points||[];
                            points = points.reverse();

                            serie.data = points;

                            seriesService.summaryStats(points).then(function (result) {
                                var fieldName = 'field' + serie.cachedID;
                                var info = $scope.gridOptions1.data;
                                info[0][fieldName] = result['dailyavg']
                                info[1][fieldName] = result['dailymax']
                                info[2][fieldName] = result['dailymin']
                                info[3][fieldName] = result['hourlymax']
                                info[4][fieldName] = result['hourlymin']
                                info[5][fieldName] = result['peakPercent']
                                info[6][fieldName] = result['loadingFactor']
                            });
                        });

                });

                $q.all(promises).then(
                    function(data){

                        //charts.xAxis[0].setExtremes(e.min, e.max);
                        charts.hideLoading();

                        loadedItems = [];

                        $timeout(function(){
                            $scope.redraw();
                        })

                    },
                    function(reason){
                        charts.hideLoading();
                        $timeout(function(){
                            //$scope.redraw();
                        })
                    }
                )
            }
        }


        /* FILTER BAR */

        $scope.showMeterDetails = function(meter){
            $scope.meterDetails = !$scope.meterDetails;// == meter ? null : meter;
            $timeout(function () {
                angular.element($window).triggerHandler('resize');
            });
        }

        $scope.removeMeter = function(evt, meter){
            $rootScope.$broadcast('remove-meter', meter);
        }

        $scope.resetMeters = function(){
            $rootScope.setActiveView('subnav');
            $rootScope.$broadcast('reset-meters');
        }

        // on hover/blur
        $scope.highlightSeries = function(meter, highlight){

            // var meterIndex = $scope.chartOptions1.series.indexOf(meter);
            // if(meterIndex > -1){
            //     $scope.chartOptions1.series[meterIndex].lineWidth = highlight ? 3 : 2;
            // }
            // changing lineheight is slow
            // _.each($scope.chartOptions1.series, function(series) {
            //     if(series == meter)
            //         series.shadow = series == meter && highlight ? true : false
            // //     if(!series.influxKey) return;

            // //     var lineWidth = 1;
            // //     if(highlight)
            // //         lineWidth = series == meter ? 3 : 1;
            // //     else
            // //         lineWidth = 2;

            // //     series.lineWidth = lineWidth;
            // //     //series.dashStyle = series == meter ? 'Solid' : 'Dash';
            // })
        }

        /* SUMMARY STATISTICS */

        $scope.removeColumn = function (fieldName) {
            // find field name
            var columns = $scope.gridOptions1.columnDefs.filter(function (col) {
                return col.field == fieldName;
            });

            //find field index and remove column
            var colIndex = $scope.gridOptions1.columnDefs.indexOf(columns[0]);
            $scope.gridOptions1.columnDefs.splice(colIndex, 1);
        }

        $scope.addColumn = function (fieldName, displayName, color, seriesResult) {
            var col = { field: fieldName, displayName: displayName, width: "160", resizable: true,  headerCellTemplate: headerCellTemplate, cellTemplate: cellTemplate, cellStyle: { color: color, 'font-weight': 'bold' }, headerCellStyle: { 'background-color': color }, enableColumnMenu: false, };
            $scope.gridOptions1.columnDefs.push(col);

            var info = $scope.gridOptions1.data;
            info[0][fieldName] = seriesResult['dailyavg']
            info[1][fieldName] = seriesResult['dailymax']
            info[2][fieldName] = seriesResult['dailymin']
            info[3][fieldName] = seriesResult['hourlymax']
            info[4][fieldName] = seriesResult['hourlymin']
            info[5][fieldName] = seriesResult['peakPercent']
            info[6][fieldName] = seriesResult['loadingFactor']
        }

        var headerCellTemplate = '';
            // '<div role="columnheader" ng-class="{ \'sortable\': sortable }" ui-grid-one-bind-aria-labelledby-grid="col.uid + \'-header-text \' + col.uid + \'-sortdir-text\'" aria-sort="{{col.sort.direction == asc ? \'ascending\' : ( col.sort.direction == desc ? \'descending\' : (!col.sort.direction ? \'none\' : \'other\'))}}">' +
            //     '<div role="button" tabindex="0" class="ui-grid-cell-contents ui-grid-header-cell-primary-focus" col-index="renderIndex" ng-style="col.colDef.headerCellStyle">' +
            //         '<span class="ui-grid-header-cell-label" ui-grid-one-bind-id-grid="col.uid + \'-header-text\'">{{ col.displayName }}</span> ' +
            //         '<span ui-grid-one-bind-id-grid="col.uid + \'-sortdir-text\'" ui-grid-visible="col.sort.direction" aria-label="{{getSortDirectionAriaLabel()}}">' +
            //         '   <i ng-class="{ \'ui-grid-icon-up-dir\': col.sort.direction == asc, \'ui-grid-icon-down-dir\': col.sort.direction == desc, \'ui-grid-icon-blank\': !col.sort.direction }" title="{{col.sort.priority ? i18n.headerCell.priority + \' \' + col.sort.priority : null}}" aria-hidden="true"></i>' +
            //         '   <sub class="ui-grid-sort-priority-number">{{col.sort.priority}}</sub>' +
            //         '</span>' +
            //     '</div>' +
            //     '<div ui-grid-filter></div>' +
            // '</div>';

        var cellTemplate =
            '<div class="ui-grid-cell-contents" ng-style="col.colDef.cellStyle">{{COL_FIELD }}</div>';

        $scope.gridOptions1 = {
            rowHeight: 40,
            headerRowHeight: 0,
            showHeader: false,
            headerTemplate: headerCellTemplate,
            enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
            enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER,
            columnDefs: [
                { field: 'field1', id: "used", displayName: '统计数据', width: "250", resizable: true, pinnedLeft:true, enableColumnMenu: false, sort: { direction: uiGridConstants.ASC } }
            ],
            data:[
                {"field1":"显示时段日平均能耗(Daily Average)"},
                {"field1":"显示时段每日最高能耗(Daily Max)："},
                {"field1":"显示时段每日最低能耗(Daily Min)："},
                {"field1":"日内最高小时能耗(Hourly Max):"},
                {"field1":"日内最低小时能耗(Hourly Min)："},
                {"field1":"高峰用电百分比(Peak Energy %):"},
                {"field1":"系统负载因数 (Load Factor):"},
            ]
        }

        $scope.gridOptions1.onRegisterApi = function (gridApi) {

            $scope.gridApi1 = gridApi;
        }

        $scope.closeConfig = function(){

            $scope.formData = null;
        }

        // Send node edit event
        $scope.edit = function (node, evt) {
            evt.preventDefault();
            evt.stopPropagation();
            $rootScope.$broadcast('chart-serie-edit', node);
        };

        //Unsubscribe from broadcast on controller destroy event
        $scope.$on('$destroy', function () {
            unbindSerieChecked();
            onLayoutResize();
        });

    }])
