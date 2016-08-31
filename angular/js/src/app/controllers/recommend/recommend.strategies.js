angular.module('app.controllers.recommendations.strategies', [])

    .controller('recommendationsStrategiesCtrl', [
        '$scope', '$rootScope', 'FormService', 'uiGridConstants', '$http', function ($scope, $rootScope, FormService, uiGridConstants, $http) {

            $scope.info = function(row) {
                console.log(row);
            };

            var imageCellTemplate =
                '<div class="ui-grid-cell-contents p0">' +
                    '   <div  style="width: 130px; height: 80px; background: url({{row.entity.image}}) no-repeat center center; background-size: cover;"></div>' +
                    '</div>';

            var titleCellTemplate =
                '<div class="ui-grid-cell-contents p0">' +
                    '   <h4 ng-bind="row.entity.name"></h4>' +
                    '   <p ng-bind="row.entity.description"></p>' +
                    '</div>';

            var categoryCellTemplate =
                '<div class="ui-grid-cell-contents p0">' +
                    '   <h4 ng-bind="row.entity.category"></h4>' +
                    '</div>';


            var actionCellTemplate =
                '<div class="ui-grid-cell-contents p0">' +
                    '   <button class="btn btn-default btn-blue" ng-click="grid.appScope.execute(row.entity)">进入分析结果</button>' +
                    '</div>';


            $scope.execute = function(entity) {
                $rootScope.$state.go(entity.route);
            }

            $scope.gridOptions1 = {
                enableRowSelection: false,
                enablePaginationControls: false,
                enableRowHeaderSelection: false,
                multiSelect: false,
                enableSelectAll: false,
                paginationPageSize: 3,
                rowHeight: 100,
                enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
                enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER,
                columnDefs: [
                    { field: 'image', displayName: '策略图', width: "150", resizable: true, headerCellClass: 'green', enableColumnMenu: false, cellTemplate: imageCellTemplate },
                    { field: 'description', displayName: '详情描述', width: "*", resizable: true, headerCellClass: 'green', enableColumnMenu: false, cellTemplate: titleCellTemplate },
                    { field: 'category', displayName: '类别', width: "150", resizable: true, headerCellClass: 'green', enableColumnMenu: false, sort: { direction: uiGridConstants.ASC }, cellTemplate: categoryCellTemplate },
                    { field: 'action', displayName: '执行行动', width: "150", resizable: true, headerCellClass: 'green', cellClass: 'fwb tac', enableColumnMenu: false, cellTemplate: actionCellTemplate },
                ],
                data: [
                    { id: '1', 'name': '分时段对比', 'description': '比较在同一楼宇在两个不同是时间段的用电量以及用电规律，可以直观的发现用电异常时段。选择比较的时段可以是一天，一周或者一月。比较两个时段的分时用电量以及用电费用。', 'category': '节能试验室', route: 'root.home.unit.tools.strategies.strategy1', image: 'static/image/strategy1.png' },
                    { id: '2', 'name': '削峰填谷', 'description': '通常情况下，用电高峰通常在白天，晚上则是低谷。但是高峰期的电价是低谷的四倍之多，致使一个企业在高峰用电成本很高。通过模拟找出一部分或者不必要的高峰负荷挪到晚上低谷期，从而就利用了晚上多余的电力，也就达到了节约能源的目的。', 'category': '节能试验室', route: 'root.home.unit.tools.strategies.strategy2', image: 'static/image/strategy2.png' },
                    { id: '3', 'name': '晚间与周末分析', 'description': '大部分用电组成是与楼宇的使用行为相关。晚间于周末的行为用电应为低谷，也是节能的必要。该策略对比在选择时间区域内用户周中，周末以及节假日用电的组成，从中发现潜在问题。', 'category': '节能试验室', route: 'root.home.unit.tools.strategies.strategy3', image: 'static/image/strategy3.png' },
                    { id: '4', 'name': '节能目标分析', 'description': '定期设定合理的节能目标至关重要。用户可以在同一楼宇可选的的时间范围内，调整六组分类能耗的节能潜力，从而看到相应的潜力对整体能耗的影响。', 'category': '策划与分析', route: 'root.home.unit.tools.strategies.strategy4', image: 'static/image/strategy4.png' },
                    { id: '5', 'name': '能耗表现', 'description': '实时的了解能耗进展对节能起到最有效的监督与督促。该工具可以使用户随时查看任意选择时段内的能耗。工具提供灵活的选择，用户可以与从一周上至一年的历史数据进行比较，自动去除了天气和人为因素，从而实时的监视能效进展。', 'category': '策划与分析', route: 'root.home.unit.tools.strategies.strategy5', image: 'static/image/strategy5.png' }
                ]
            };

            //TODO: Keep it DRY, getNumber appeared for second time
            $scope.getNumber = function (num) {
                return new Array(num);
            }

            $scope.gridOptions1.onRegisterApi = function(gridApi) {
                $scope.gridApi1 = gridApi;
            };

        }
    ]).controller('analysisCtrl', [
        '$scope', '$rootScope', 'FormService', 'uiGridConstants', '$http', function ($scope, $rootScope, FormService, uiGridConstants, $http) {

            $scope.info = function(row) {
                console.log(row);
            };

            var imageCellTemplate =
                '<div class="ui-grid-cell-contents p0">' +
                    '   <div  style="width: 130px; height: 80px; background: url({{row.entity.image}}) no-repeat center center; background-size: cover;"></div>' +
                    '</div>';

            var titleCellTemplate =
                '<div class="ui-grid-cell-contents p0">' +
                    '   <h4 ng-bind="row.entity.name"></h4>' +
                    '   <p ng-bind="row.entity.description"></p>' +
                    '</div>';

            var categoryCellTemplate =
                '<div class="ui-grid-cell-contents p0">' +
                    '   <h4 ng-bind="row.entity.category"></h4>' +
                    '</div>';


            var actionCellTemplate =
                '<div class="ui-grid-cell-contents p0">' +
                    '   <button class="btn btn-default btn-blue" ng-click="grid.appScope.execute(row.entity)">进入分析结果</button>' +
                    '</div>';


            $scope.execute = function(entity) {
                $rootScope.$state.go(entity.route);
            }

            $scope.gridOptions1 = {
                enableRowSelection: false,
                enablePaginationControls: false,
                enableRowHeaderSelection: false,
                multiSelect: false,
                enableSelectAll: false,
                paginationPageSize: 3,
                rowHeight: 100,
                enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
                enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER,
                columnDefs: [
                    { field: 'image', displayName: '诊断图', width: "150", resizable: true, headerCellClass: 'green', enableColumnMenu: false, cellTemplate: imageCellTemplate },
                    { field: 'description', displayName: '详情描述', width: "*", resizable: true, headerCellClass: 'green', enableColumnMenu: false, cellTemplate: titleCellTemplate },
                    { field: 'category', displayName: '类别', width: "150", resizable: true, headerCellClass: 'green', enableColumnMenu: false, sort: { direction: uiGridConstants.ASC }, cellTemplate: categoryCellTemplate },
                    { field: 'action', displayName: '执行措施', width: "150", resizable: true, headerCellClass: 'green', cellClass: 'fwb tac', enableColumnMenu: false, cellTemplate: actionCellTemplate },
                ],
                data: [
                    { id: '4', 'name': '能耗透析', 'description': '通过实时的数据采集，采用不同的颜色显示出不同时段下用电负荷的变化情况，可以较为直观的看出任意时段的用能情况。', 'category': '实时分析', route: 'root.home.unit.tools.heatmap', image: 'static/image/strategy7.png' }
                ]
            };

            //TODO: Keep it DRY, getNumber appeared for second time
            $scope.getNumber = function (num) {
                return new Array(num);
            }

            $scope.gridOptions1.onRegisterApi = function(gridApi) {
                $scope.gridApi1 = gridApi;
            };

        }
    ]);
