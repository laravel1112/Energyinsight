angular.module('app.controllers.recommendations.summary', [])

    .controller('recommendationsSummaryCtrl', ['$scope', '$rootScope', 'uiGridConstants', 'RecommendationFactory', '$timeout', '$injector', '$timeout', '$window', 'html2pdf',
        function ($scope, $rootScope, uiGridConstants, RecommendationFactory, $timeout, $injector, $timeout, $window, html2pdf) {

            var chartCapsuleBarOptions =  { max: 3, capsules: 10, value: 0, title: '难度系数', titlePosition: 'right' };

            $scope.progressMax1 = 3000;
            $scope.progressMax2 = 3;
            $scope.progressMax3 = 3;
            $scope.progressCurrent1 = 0;
            $scope.progressCurrent2 = 0;
            $scope.progressCurrent3 = 0;
            // $scope.description = '安装冷机群控系统 器检测温度分层线位置，以调整，供同冷时主需机在开温启度台梯数度及垂水直泵等频距率离。上布置温度传 其水次机组蓄与冷，冰均用蓄可水冷直系池接统往用相于比可水以，蓄水和冷蓄消，冷防因系水而统池即一等使般共在投用蓄资，冷因较阶而低段可，也首以可先节以因省保为水持一池较般结高用构的于部制空分冷调及效的占率冷地； 道的单即可独。投资。如下图，按照酒店现有冷机配置，只需新增左侧蓄冷水池和相应';
            $scope.description = '';

            $scope.export = function(){
                html2pdf.export($("#export-container"), 'Recommendations.Summary');
            }

            $scope.getStatus = function(row, col) {
                var status = row.entity.status + "";
                switch (status) {
                    case "1":
                        return "效果核实";
                    case "2":
                        return "实施中";
                    case "3":
                        return "开始审批";
                    case "4":
                        return "未读";
                    case "5":
                        return "已完成";
                    case "6":
                        return "不可用";
                }
                return '---';

            };


            // Alert type color 
            $scope.getCategoryColor = function(categ){
                switch(categ){
                    case 1: return 'rgb(255, 204, 0)';
                    case 2: return 'rgb(255, 204, 0)';
                    case 3: return 'rgb(255, 204, 0)';
                    case 4: return 'rgb(1, 185, 195)';
                    case 5: return 'rgb(1, 185, 195)';
                    default: return '#dfdfdf';
                }
            }

            // var statusCellTemplate =
            //     '<div class="ui-grid-cell-contents">' +
            //         '   <div uib-dropdown dropdown-append-to-body>' +
            //         '       <a class="dropdown-toggle" uib-dropdown-toggle role="menu" aria-labelledby="single-button" ng-click="grid.appScope.onStatusClick($event)">' +
            //         '           <span ng-class="{cred: row.entity.status == 1, cgreen: row.entity.status == 2, corange: row.entity.status == 3, cyellow: row.entity.status == 4}" ng-bind="grid.appScope.getStatus(row, col)">---</span> <i class="icon-down-open fs8" style="color: #333"></i>' +
            //         '       </a>' +
            //         '       <ul class="dropdown-menu uib-dropdown-menu">' +
            //         '           <li>' +
            //         '               <a class="cyellow" ng-click="grid.appScope.setStatus(row, col, \'4\')">未读</a>' +
            //         '           </li>' +
            //         '           <li>' +
            //         '               <a class="corange" ng-click="grid.appScope.setStatus(row, col, \'3\')">开始审批</a>' +
            //         '           </li>' +
            //         '           <li>' +
            //         '               <a class="cgreen" ng-click="grid.appScope.setStatus(row, col, \'2\')">实施中</a>' +
            //         '           </li>' +
            //         '           <li>' +
            //         '               <a class="cred" ng-click="grid.appScope.setStatus(row, col, \'1\')">效果核实</a>' +
            //         '           </li>' +
            //         '           <li>' +
            //         '               <a class="cblue" ng-click="grid.appScope.setStatus(row, col, \'5\')">已完成</a>' +
            //         '           </li>' +
            //         '       </ul>' +
            //         '   </div>'
            // '</div>';

            var rowTemplate = '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'new-entry\': row.entity.status == 4 }"  ui-grid-cell></div>'


            var statusCellTemplate =
                '<div class="ui-grid-cell-contents jcc">' +
                    ' <span ng-class="{cred: row.entity.status == 1, cgreen: row.entity.status == 2, corange: row.entity.status == 3, cyellow: row.entity.status == 4}" ng-bind="grid.appScope.getStatus(row, col)">---</span>' +
                '</div>';

            var categoryCellTemplate =
                    '<div class="ui-grid-cell-contents icon-contents">' +
                        '<button class="btn btn-link flex flex-center flex-noresize jcc p0 tac" style="width: 50px; height: 50px; border-radius: 100%; text-align: center;" ng-style="{background: grid.appScope.getCategoryColor(row.entity.category)}">' +
                        '   <i class="svg-light-bulb svg-30 svg-white" ng-show="row.entity.category == \'1\'"></i>' +
                        '   <i class="svg-light-bulb svg-30 svg-white" ng-show="row.entity.category == \'2\'"></i>' +
                        '   <i class="svg-light-bulb svg-30 svg-white" ng-show="row.entity.category == \'3\'"></i>' +
                        '   <i class="svg-snowflake svg-30 svg-white" ng-show="row.entity.category == \'4\'"></i>' +
                        '   <i class="svg-snowflake svg-30 svg-white" ng-show="row.entity.category == \'5\'"></i>' +
                        '</button>' +
                    '</div>';

            var descriptionCellTemplate =
                '<div class="ui-grid-cell-contents desc">' +
                    '<h3 class="m0">{{row.entity.title}}</h3>' + 
                    '<div ng-bind="row.entity.description | stripTags">...</div>' + 
                '</div>';

            var ePotentialCellTemplate =
                '<div class="ui-grid-cell-contents">' +
                    '<h3 class="m0"><sub>¥</sub>{{row.entity.saving_potential}} <sub>/月</sub></h3>' + 
                '</div>';


            var field5CellTemplate =
                '<div class="ui-grid-cell-contents">' +
                    '   <span ng-bind="row.entity.complexityText" ng-class="{cred: row.entity.complexityText == \'高\', cgreen: row.entity.complexityText == \'低\', cyellow: row.entity.complexityText == \'中\'}"></i>' +
                    '</div>';

            var paginationTemplate =
                    '<div ui-grid-pager class="table-footer ui-grid-pager-panel" ng-show="grid.options.enablePaginationControls">' +
                    '    <div class="pull-left pagination-info">Showing {{ grid.api.pagination.getPage() }} to {{ grid.api.pagination.getTotalPages() }} of {{grid.api.grid.options.totalItems}} entries</div>' +
                    '        <div class="pull-right">' +
                    '            <ul class="pagination">' +
                    '                <li>' +
                    '                    <a href="#" aria-label="Previous" ng-click="pagePreviousPageClick()">' +
                    '                        <span aria-hidden="true"><i class="icon-left-open"></i></span>' +
                    '                    </a>' +
                    '                </li>' +
                    '                <li ng-repeat="i in grid.appScope.getNumber(grid.api.pagination.getTotalPages()) track by $index" ng-class="{active: grid.api.pagination.getPage() == $index + 1}"><a ng-click="grid.api.pagination.seek($index + 1)" ng-bind="$index + 1"></a></li>' +
                    '                <li>' +
                    '                    <a href="#" aria-label="Next" ng-click="pageNextPageClick()">' +
                    '                        <span aria-hidden="true"><i class="icon-right-open"></i></span>' +
                    '                    </a>' +
                    '                </li>' +
                    '            </ul>' +
                    '        </div>' +
                    '    </div>';
                    '</div>';

            $scope.toggleCompleted = function() {

                if ($scope.completedRecommendationToggle) {
                    $scope.gridApi1.grid.clearAllFilters(undefined,true);
                } else {
                    $scope.gridApi1.grid.columns[0].filters[0].noTerm=true;
                    $scope.gridApi1.grid.columns[0].filters[0].condition = function(term,cellValue){
                        if(cellValue==5) return false;
                        return true;
                    };
                    $scope.gridApi1.grid.queueGridRefresh();
                }

            }

            // Load

            $scope.load = function(start, end){

                if ($rootScope.$stateParams.id > 0) {
                    RecommendationFactory.getByDateRange($rootScope.$stateParams.id, start, end).then(function(result) {
                        $scope.gridOptions1.data = _.map(result, function(d) {
                            d.saving_potentialText = "¥" + d.saving_potential + " /月";
                            switch (d.complexity) {
                                case 1:
                                    d.complexityText = "低";
                                    break;
                                case 2:
                                    d.complexityText = "中";
                                    break;
                                case 3:
                                    d.complexityText = "高";
                                    break;
                            }
                            switch (d.paybacktime) {
                                case 1:
                                    d.paybacktimeText = '短期';
                                    break;
                                case 2:
                                    d.paybacktimeText = '中期';
                                    break;
                                case 3:
                                    d.paybacktimeText = '中长期';
                                    break;
                            }
                            return d;
                        });
                        $scope.toggleCompleted();

                        $timeout(function () {
                            //$scope.gridApi1.selection.selectRowByVisibleIndex(0);
                        });
                    });

                }

            }



            // Main table config
            $scope.gridOptions1 = {
                enableFiltering: true,
                enableRowSelection: true,
                enablePaging: false,
                enablePaginationControls: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                enableSelectAll: false,
                rowTemplate: rowTemplate,
                rowHeight: 75,
                enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
                enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER,
                columnDefs: [
                    { field: 'status', displayName: '当前状态', width: "100", resizable: true, cellClass: 'tac', headerCellClass: 'tac', enableColumnMenu: false, cellTemplate: statusCellTemplate },
                    { field: 'category', displayName: '分类', width: "100", resizable: true, cellClass: 'cell-icon tac', headerCellClass: 'tac', enableColumnMenu: false, cellTemplate: categoryCellTemplate },
                    { field: 'title', displayName: '建议描述概述', width: "*", resizable: true, enableColumnMenu: false, cellClass: '', cellTemplate: descriptionCellTemplate },
                    { field: 'saving_potentialText', id: "used", displayName: '节能潜力', width: "120", resizable: true, cellClass: 'fs24', enableColumnMenu: false, cellTemplate: ePotentialCellTemplate, sort: { direction: uiGridConstants.ASC } },
                    { field: 'complexityText', displayName: '难度系数', width: "100", resizable: true, cellClass: 'tac', enableColumnMenu: false, cellTemplate: field5CellTemplate },
                    { field: 'paybacktimeText', displayName: '回收周期', width: "100", resizable: true, cellClass: 'tac', enableColumnMenu: false, },
                    { field: 'date_of_creation', displayName: '提交时间', width: "150", resizable: true, cellClass: 'tac', type: 'date', cellFilter: 'date:"yyyy-MM-dd"', enableColumnMenu: false, },
                ],
                data: [
                    // { "field1": "¥ 1237 / 月", "field2": "1", "field3": "1", "field4": "过渡季节冷却塔直接供冷回风控制", 'field5': '高', 'field6': '长期', 'field7': { max1: 20000, max2: 20000, max3: 20000, current1: 17000, current2: 13000, current3: 4000 }, 'field8': { money: 5250, co2: 2950 } },
                    // { "field1": "¥ 2672 / 月", "field2": "2", "field3": "2", "field4": "安装冷机群控系统器", 'field5': '低', 'field6': '中长期', 'field7': { max1: 20000, max2: 20000, max3: 20000, current1: 10000, current2: 3000, current3: 9000 }, 'field8': { money: 8310, co2: 4510 } },
                    // { "field1": "¥ 3450 / 月", "field2": "1", "field3": "2", "field4": "二次水泵变频调试", 'field5': '中', 'field6': '短期', 'field7': { max1: 20000, max2: 20000, max3: 20000, current1: 7000, current2: 19000, current3: 15000 }, 'field8': { money: 3750, co2: 2380 } },
                    // { "field1": "¥ 4450 / 月", "field2": "1", "field3": "2", "field4": "二次水泵变频调试", 'field5': '中', 'field6': '短期', 'field7': { max1: 20000, max2: 20000, max3: 20000, current1: 6000, current2: 3000, current3: 8000 }, 'field8': { money: 13285, co2: 8735 } },
                ]
            };

            $scope.dateConfig = { selected: null, maxDate: moment() };
            $timeout(function(){

                $scope.dateConfig.setRange(moment().subtract(1, 'year'), moment());
                $scope.applyDateRange();

            })

            $scope.applyDateRange = function () {
                var data1, data2;

                var dateStart = $scope.dateConfig.getStart();
                var dateEnd = $scope.dateConfig.getEnd();

                var pointStart = dateStart.clone().valueOf();
                var pointEnd = dateEnd.clone().valueOf();

                $scope.isCompareOpen = false;


                $scope.load(moment(dateStart).startOf('day'), moment(dateEnd).endOf('day'));
                // 
                // AlertService.getByDateRange($rootScope.$stateParams.id, moment(dateStart).startOf('day'), moment(dateEnd).endOf('day')).then(function(data){
                //     $scope.gridOptions1.data = data;
                // });
            }



            var gridDetailsHeaderCellTemplate =
                '<div role="columnheader" style="border-bottom: solid 1px #eee;">' +
                '    <div class="ui-grid-cell-contents plr15" style="background: #91c46b; color: #fff;" col-index="renderIndex" title="TOOLTIP">' +
                '        <span class="ui-grid-header-cell-label fwn">' +
                '          {{ col.displayName CUSTOM_FILTERS }}' +
                '        </span>' +
                '    </div>' +
                '</div>';

            $scope.gridDetailsOptions = {
                enableFiltering: false,
                enableRowSelection: false,
                enablePaging: false,
                enablePaginationControls: false,
                enableRowHeaderSelection: false,
                multiSelect: false,
                enableSelectAll: false,
                rowHeight: 50,
                paginationPageSize: 1,
                showHeader: true,
                enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
                enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER,
                columnDefs: [
                    { headerCellTemplate: gridDetailsHeaderCellTemplate, field: 'status', displayName: '当前状态', width: "100", resizable: true, cellClass: 'fwb tac ptb10 plr15', enableColumnMenu: false, cellTemplate: statusCellTemplate },
                    { headerCellTemplate: gridDetailsHeaderCellTemplate, field: 'category', displayName: '分类', width: "100", resizable: true,  cellClass: 'fwb icon ptb10 plr15', enableColumnMenu: false, cellTemplate: categoryCellTemplate },
                    { headerCellTemplate: gridDetailsHeaderCellTemplate, field: 'title', displayName: '建议描述概述', width: "*", resizable: true, enableColumnMenu: false, },
                    { headerCellTemplate: gridDetailsHeaderCellTemplate, field: 'saving_potentialText', id: "used", displayName: '节能潜力', width: "120", resizable: true, cellClass: 'fwb', enableColumnMenu: false, sort: { direction: uiGridConstants.ASC } },
                    { headerCellTemplate: gridDetailsHeaderCellTemplate, field: 'complexityText', displayName: '难度系数', width: "100", resizable: true, cellClass: 'fwb tac', enableColumnMenu: false, cellTemplate: field5CellTemplate },
                    { headerCellTemplate: gridDetailsHeaderCellTemplate, field: 'paybacktimeText', displayName: '回收周期', width: "100", resizable: true, cellClass: 'fwb tac', enableColumnMenu: false, },
                    { headerCellTemplate: gridDetailsHeaderCellTemplate, field: 'date_of_creation', displayName: '提交时间', width: "200", resizable: true, cellClass: 'fwb tac', enableColumnMenu: false, },
                ],
                data: []
            };

            // Main table
            $scope.gridOptions1.onRegisterApi = function(gridApi) {
                $scope.gridApi1 = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {

                    /* capsule bars, this use be a middle bar */
                    //var values = _.pluck($scope.gridOptions1.data, 'energy_saved');
                    //var maxVal = Math.ceil(_.max(values, function(obj) { return Math.ceil(obj); }));
                    //var nextN0 = Math.pow(10, maxVal.toString().length - 1);
                    //var extreme = Math.ceil(maxVal / nextN0) * nextN0;
                    //$scope.chartCapsuleBarOptions = { max: extreme, value: row.entity.energy_saved, capsules: 10, title: '节能能力' }

                    /* OBSOLETE: capsule progress bar */
                    //$scope.chartCapsuleBarOptions = angular.extend({}, chartCapsuleBarOptions, { value: row.entity.paybacktime });

                    /* OBSOLETE: circle bar */
                    //$scope.progressCurrent1 = row.entity.energy_saved;

                    //$scope.selectedRow = row;
                    $rootScope.$state.go('root.home.unit.recommendations.details', { rid: row.entity.id } );

                    // $scope.gridDetailsOptions.data = [row.entity];

                    // $scope.chartGaugeOptions0.series[0].data[0] = [row.entity.energy_saved];
                    // $scope.chartGaugeOptions1.series[0].data[0] = row.entity.paybacktime;
                    // $scope.chartGaugeOptions2.series[0].data[0] = row.entity.complexity;

                    // $scope.money = row.entity.saving_potential * 12;
                    // $scope.co2 = row.entity.energy_saved * 12 * 0.527;

                    // $scope.description = row.entity.description;
                    // //$scope.comment = row.entity.comment;

                    // //Load comments
                    // refreshHistory(row.entity.id);

                    // //$rootScope.resize();
                });

            }

            // Main table individual row details
            $scope.hideDetails = function(){
                $scope.selectedRow = null;
                $scope.isLogRowSelected = false;
                $timeout(function(){
                    $rootScope.resize();
                },100);
            }

            // Prevent main table row selection for status column
            $scope.onStatusClick = function($event){
                $event.preventDefault();
                $event.stopPropagation();
            }

            // History log table
            $scope.statusLogGrid={
                enableFiltering: true,
                enableRowSelection: true,
                enablePaging: true,
                enablePaginationControls: true,
                enableRowHeaderSelection: false,
                paginationTemplate: paginationTemplate,
                multiSelect: false,
                enableSelectAll: false,
                paginationPageSize: 3,
                enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
                enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER,
                columnDefs:[
                    { field: 'date_of_change', displayName: '修改日期', width: "125", resizable: true, headerCellClass: 'pl15', cellClass: 'plr15 fs14', enableColumnMenu: false },
                    //{ field: 'old_status', displayName: '前状态', width: "*", resizable: true, headerCellClass: 'pl15', cellClass: 'plr15 fs14', enableColumnMenu: false },
                    { field: 'new_status', displayName: '修改后状态', width: "*", resizable: true, headerCellClass: 'pl15', cellClass: 'plr15 fs14', enableColumnMenu: false },
                    { field: 'comment', displayName: '进展描述', width: "*", resizable: true, headerCellClass: 'pl15', cellClass: 'plr15 fs14', enableColumnMenu: false, visible: true },
                ],
                data:[]
            }

            // History log table
            $scope.statusLogGrid.onRegisterApi = function (gridApi) {
                $scope.gridApi2 = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, function(row) {

                    // Fix Status columns width to stretch Comment column
                   // gridApi.grid.getColumn('old_status').width = '150';
                    gridApi.grid.getColumn('new_status').width = '150';

                    // Show Comment column
                    //$scope.statusLogGrid.columnDefs[2].visible = true;

                    // Stretch Comments panel
                    $scope.isLogRowSelected = true;

                    // Apply changes to grid
                    gridApi.grid.queueGridRefresh();

                    // Trigger window resize event
                    $timeout(function () {
                        angular.element($window).triggerHandler('resize');
                    });

                });
            };

            $scope.hideLog = function() {
                // Stratch Status columns width
                //$scope.gridApi2.grid.getColumn('old_status').width = '*';
                $scope.gridApi2.grid.getColumn('new_status').width = '*';

                // Hide Comment column
                //$scope.statusLogGrid.columnDefs[2].visible = false;

                // Restore Comments panel
                $scope.isLogRowSelected = false;

                // Apply changes to grid
                $scope.gridApi2.grid.queueGridRefresh();

                // Trigger window resize event
                $rootScope.resize();
            }

            var refreshHistory = function(recommendationID){
                return RecommendationFactory.getStatusLog(recommendationID).then(function (result) {

                    // //TODO: Remove this once "commment" available
                    // result.objects = _.map(result.objects, function (d) {
                    //     d.comment = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
                    //     return d;
                    // });

                    $scope.statusLogGrid.data = result.objects;
                    $rootScope.resize();
                });
            }


            $scope.getNumber = function(num) {
                return new Array(num);
            }

            $scope.setStatus = function(row, col, status) {
                var id = row.entity.id;

                // Popup for Comment on Status change
                var modalService = $injector.get('modalService');
                modalService.show({}, {
                    templateUrl: '/static/views/recommendations/templates/status.comment.html'
                }).then(function (data) {

                    //TODO: Save comment, keeping it in memory meantime
                    row.entity.comment = data.comment;

                    //Saving status
                    RecommendationFactory.update({ status: status, id: id, comment:data.comment }).then(function (data) {
                        row.entity.status = status;
                        refreshHistory(id);
                        $timeout(function () {
                            $scope.gridApi1.grid.modifyRows($scope.gridOptions1.data);
                        });
                    });

                });

            };


            /*

            Indicators

            */

            // middle big gauge
            $scope.chartGaugeOptions0 = {
                options: {
                    chart: { type: 'gauge', plotBackgroundColor: null, plotBackgroundImage: null, plotBorderWidth: 0, plotShadow: false, spacingTop: 15, spacingBottom: 15, spacingLeft: 0, spacingRight: 0 },
                    title: null,
                    exporting: { enabled: false },
                    pane: { center: ['50%', '50%'], size: '100%', startAngle: 115, endAngle: -115, background: null },
                    plotOptions: {
                        gauge: {
                            dataLabels: { enabled: true, style: { 'fontSize': '20px' }, y: 20, borderWidth: 0 },
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
                        minorTickInterval: 1,
                        tickPixelInterval: 10,
                        minorTickPosition: 'outside',
                        tickPosition: 'outside',
                        tickWidth: 1,
                        tickPositions: [0, 1000, 2000, 3000],
                        labels: { step: 1, distance: 15, rotation: 'auto' },
                        title: { text: 'kWh', align: 'middle', style: { 'fontSize': '12px' }, y: 7 }, // Y Title
                        plotBands: [
                            { innerRadius: '90%', outerRadius: '100%', from: 0, to: 1000, color: '#55BF3B' }, // green
                            { innerRadius: '90%', outerRadius: '100%', from: 1000, to: 2000, color: '#ffcc00' }, // yellow
                            { innerRadius: '90%', outerRadius: '100%', from: 2000, to: 3000, color: '#DF5353' } // red
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

            };

            // left small gauge
            $scope.chartGaugeOptions1 = {
                options: {
                    chart: { type: 'gauge', plotBackgroundColor: null, plotBackgroundImage: null, plotBorderWidth: 0, plotShadow: false, spacingTop: 15, spacingBottom: 15 },
                    title: null,
                    exporting: { enabled: false },
                    pane: { center: ['50%', '60%'], size: '75%', startAngle: 115, endAngle: -115, background: null },
                    plotOptions: {
                        gauge: {
                            dataLabels: {
                                borderWidth: 0,
                                enabled: true,
                                 formatter: function () {
                                    switch(this.y) {
                                        case 1:
                                            return 'EASY';
                                        case 2:
                                            return 'NORMAL';
                                        case 3:
                                            return 'HARD';
                                    }
                                }
                            },
                            dial: { backgroundColor: '#c72424', borderColor: '#c72424', radius: '90%', baseLength: '0%' }, // dial arrow
                            pivot: { backgroundColor: '#c72424', radius: '4', } // dial arrow dot
                        }
                    },
                    yAxis: {
                        pane: 0,
                        min: 0,
                        max: 3,
                        lineColor: null,
                        reversed: true,
                        minorTickInterval: 1,
                        tickPixelInterval: 10,
                        minorTickPosition: 'outside',
                        tickPosition: 'outside',
                        tickWidth: 1,
                        tickPositions: [0, 1, 2, 3],
                        labels: { step: 1, distance: 15, rotation: 'auto' },
                        title: { text: '回收周期', align: 'left', align: 'middle', style: { 'fontSize': '12px' }, y: 7, style:  { 'color': '#aaa' } }, // Y Title
                        plotBands: [
                            { innerRadius: '90%', outerRadius: '100%', from: 0, to: 1, color: '#55BF3B' }, // green
                            { innerRadius: '90%', outerRadius: '100%', from: 1, to: 2, color: '#ffcc00' }, // yellow
                            { innerRadius: '90%', outerRadius: '100%', from: 2, to: 3, color: '#DF5353' } // red
                        ]
                    },
                    credits: false
                },
                series: [
                    {
                        name: '回收周期',
                        data: [0]
                    }
                ],

            };

            // right small gauge
            $scope.chartGaugeOptions2 = {
                options: {
                    chart: { type: 'gauge', plotBackgroundColor: null, plotBackgroundImage: null, plotBorderWidth: 0, plotShadow: false, spacingTop: 15, spacingBottom: 15 },
                    title: null,
                    exporting: { enabled: false },
                    pane: { center: ['50%', '60%'], size: '75%', startAngle: 115, endAngle: -115, background: null },
                    plotOptions: {
                        gauge: {
                            dataLabels: {
                                borderWidth: 0,
                                enabled: true,
                                formatter: function () {
                                    switch(this.y) {
                                        case 1:
                                            return 'EASY';
                                        case 2:
                                            return 'NORMAL';
                                        case 3:
                                            return 'HARD';
                                    }
                                }
                            },
                            dial: { backgroundColor: '#c72424', borderColor: '#c72424', radius: '90%', baseLength: '0%' }, // dial arrow
                            pivot: { backgroundColor: '#c72424', radius: '4', } // dial arrow dot
                        }
                    },
                    yAxis: {
                        pane: 0,
                        min: 0,
                        max: 3,
                        lineColor: null,
                        reversed: true,
                        minorTickInterval: 1,
                        tickPixelInterval: 10,
                        minorTickPosition: 'outside',
                        tickPosition: 'outside',
                        tickWidth: 1,
                        tickPositions: [0, 1, 2, 3],
                        labels: { step: 1, distance: 15, rotation: 'auto' },
                        title: { text: '回收周期', align: 'left', align: 'middle', style: { 'fontSize': '12px' }, y: 7, style:  { 'color': '#aaa' } }, // Y Title
                        plotBands: [
                            { innerRadius: '90%', outerRadius: '100%', from: 0, to: 1, color: '#55BF3B' }, // green
                            { innerRadius: '90%', outerRadius: '100%', from: 1, to: 2, color: '#ffcc00' }, // yellow
                            { innerRadius: '90%', outerRadius: '100%', from: 2, to: 3, color: '#DF5353' } // red
                        ]
                    },
                    credits: false
                },
                series: [
                    {
                        name: '回收周期',
                        data: [0]
                    }
                ],

            };

            $scope.chartCapsuleBarOptions = chartCapsuleBarOptions;

            // $scope.chartGaugeOptions2 = {
            //     options: {
            //         chart: { type: 'gauge', plotBackgroundColor: null, plotBackgroundImage: null, plotBorderWidth: 0, plotShadow: false, spacingTop: 15, spacingBottom: 15 },
            //         title: null,
            //         exporting: { enabled: false },
            //         pane: { center: ['10px', '50%'], size: '140%', startAngle: 0, endAngle: 180, background: null },
            //         plotOptions: {
            //             gauge: {
            //                 dataLabels: { enabled: false },
            //                 dial: { backgroundColor: '#c72424', borderColor: '#c72424', radius: '90%', baseLength: '0%' }, // dial arrow
            //                 pivot: { backgroundColor: '#c72424', radius: '4', } // dial arrow dot
            //             }
            //         },
            //         yAxis: {
            //             pane: 0,
            //             min: 0,
            //             max: 3,
            //             lineColor: null,
            //             reversed: true,
            //             minorTickInterval: 1,
            //             tickPixelInterval: 10,
            //             minorTickPosition: 'outside',
            //             tickPosition: 'outside',
            //             tickWidth: 1,
            //             tickPositions: [0, 1, 2, 3],
            //             labels: { step: 1, distance: 15, rotation: 'auto' },
            //             title: { text: '难<br/>度<br/>系<br/>数', align: 'left', x: -15, align: 'middle' },
            //             plotBands: [
            //                 { innerRadius: '90%', outerRadius: '100%', from: 0, to: 1, color: '#55BF3B' }, // green
            //                 { innerRadius: '90%', outerRadius: '100%', from: 1, to: 2, color: '#ffcc00' }, // yellow
            //                 { innerRadius: '90%', outerRadius: '100%', from: 2, to: 3, color: '#DF5353' } // red
            //             ]
            //         },
            //         credits: false
            //     },
            //     series: [
            //         {
            //             name: 'Difficulty',
            //             data: [0]
            //         }
            //     ],

            // };


        }
    ])
