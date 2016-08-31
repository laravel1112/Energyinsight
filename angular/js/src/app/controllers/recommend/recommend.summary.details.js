angular.module('app.controllers.recommendations.summary.details', [])

    .controller('recommendationsSummaryDetailsCtrl', ['$scope', '$rootScope', 'RecommendationFactory', 'uiGridConstants', '$timeout', '$ionicPopup', '$ionicPopover', function($scope, $rootScope, RecommendationFactory, uiGridConstants, $timeout, $ionicPopup, $ionicPopover){
        

        /********************************************************************
         *
         *
         *  Recommendation status
         *
         *
        *********************************************************************/

        $scope.getStatusName = function(id){
            switch(id)
            {
                case 1: return '效果核实';
                case 2: return '实施中';
                case 3: return '开始审批';
                case 4: return '未读';
                case 5: return '已完成';
            }
            return '---';
        }

        $scope.onSetStatus = function(){

                $scope.status = {
                    comment: '',
                    newStatus: $scope.selectedRow.status
                }

                // TODO: Translate popup text
                $scope.statusPopup = $ionicPopup.show({
                    template:   
                                '<button ng-click="popover.show($event)" ng-bind="getStatusName(status.newStatus)"></button>' +
                                '<textarea ng-model="status.comment" style="min-height: 150px; border: solid 1px #eee; padding: 10px;" placeholder="Status change reason..."></textarea>',
                    title:      'Change status',
                    // subTitle: 'Sub time',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel', onTap: function(e) { return; } },
                        {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                return $scope.status;
                            }
                        }
                    ]
                });

                // Once closed
                $scope.statusPopup.then(function(res) {
                    $scope.setStatus(res.newStatus, res.comment);
                });
        }

        
        //Saving status
        $scope.setStatus = function(status, comment) {
            RecommendationFactory.update({ status: status, id: $rootScope.$stateParams.rid, comment: comment }).then(function (data) {
                $scope.statusPopup.close();
                $scope.refreshHistory($rootScope.$stateParams.rid);
                $scope.selectedRow.status = status; 
            });
        };

        var statusPopoverTemplate = '<ion-popover-view>' +
                                    '   <ion-content> ' +
                                    '       <button class="cyellow" ng-click="status.newStatus = 4; popover.hide()" ng-class="{pressed: selectedRow.status == 4}">未读</button>' +
                                    '       <button class="corange" ng-click="status.newStatus = 3; popover.hide()" ng-class="{pressed: selectedRow.status == 3}">开始审批</button>' +
                                    '       <button class="cgreen" ng-click="status.newStatus = 2; popover.hide()" ng-class="{pressed: selectedRow.status == 2}">实施中</button>' +
                                    '       <button class="cred" ng-click="status.newStatus = 1; popover.hide()" ng-class="{pressed: selectedRow.status == 1}">效果核实</button>' +
                                    '       <button class="cblue" ng-click="status.newStatus = 5; popover.hide()" ng-class="{pressed: selectedRow.status == 5}">已完成</button>' +
                                    '   </ion-content>'+
                                    '</ion-popover-view>';
        $scope.popover = $ionicPopover.fromTemplate(statusPopoverTemplate, { scope: $scope });



        /********************************************************************
         *
         *
         *  Initial load
         *
         *
        *********************************************************************/
        
        $scope.chartOptions1 = { options: { title: null } }

        $scope.load = function(){

            RecommendationFactory.getByBuilding($rootScope.$stateParams.id).then(function(result) {
                var recommendations = _.map(result, function(d) {
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

                $scope.selectedRow = _.find(recommendations, function(item) {
                    return item.id == $rootScope.$stateParams.rid;
                })


                //$scope.gridDetailsOptions.data = [$scope.selectedRow];
                // $scope.chartGaugeOptions0.series[0].data[0] = [$scope.selectedRow.energy_saved];
                // $scope.chartGaugeOptions1.series[0].data[0] = $scope.selectedRow.paybacktime;
                // $scope.chartGaugeOptions2.series[0].data[0] = $scope.selectedRow.complexity;

                $scope.money = $scope.selectedRow.saving_potential * 12;
                $scope.co2 = $scope.selectedRow.energy_saved * 12 * 0.527;

                $scope.description = $scope.selectedRow.description;
                //$scope.comment = row.entity.comment;

                //Load comments
                $scope.refreshHistory($scope.selectedRow.id);

                if($scope.selectedRow.highchart_plot && $scope.selectedRow.highchart_plot.length > 0)
                    $scope.chartOptions1 = $scope.$eval($scope.selectedRow.highchart_plot);

            });

        }


        $scope.load();



        /********************************************************************
         *
         *
         *  History log table
         *
         *
        *********************************************************************/


        $scope.statusLogGrid={
            enableFiltering: true,
            enableRowSelection: true,
            enablePaging: false,
            // enablePaginationControls: true,
            enableRowHeaderSelection: false,
            // paginationTemplate: paginationTemplate,
            multiSelect: false,
            enableSelectAll: false,
            // paginationPageSize: 3,
            enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
            // enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER,
            columnDefs:[
                { field: 'date_of_change', displayName: '修改日期', width: "125", resizable: true, headerCellClass: 'pl15', cellClass: 'plr15 fs14', type: 'date', enableColumnMenu: false, sort: { direction: uiGridConstants.DESC } },
                { field: 'old_status', displayName: '前状态', width: "*", resizable: true, headerCellClass: 'pl15', cellClass: 'plr15 fs14', enableColumnMenu: false, visible: false },
                { field: 'new_status', displayName: '修改后状态', width: "*", resizable: true, headerCellClass: 'pl15', cellClass: 'plr15 fs14', enableColumnMenu: false },
                { field: 'comment', displayName: '进展描述', width: "*", resizable: true, headerCellClass: 'pl15', cellClass: 'plr15 fs14', enableColumnMenu: false, visible: true },
            ],
            data:[]
        }

        $scope.statusLogGrid.onRegisterApi = function (gridApi) {
            $scope.gridApi2 = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function(row) {

                // Fix Status columns width to stretch Comment column
               // gridApi.grid.getColumn('old_status').width = '150';
                gridApi.grid.getColumn('new_status').width = '150';

                // Show Comment column
                $scope.statusLogGrid.columnDefs[2].visible = true;

                // Stretch Comments panel
                $scope.isLogRowSelected = true;

                // Apply changes to grid
                gridApi.grid.queueGridRefresh();

                // Trigger window resize event
                $rootScope.resize();


                $scope.selectedLogRow = row;
                console.log('$scope.selectedLogRow', $scope.selectedLogRow);

                $scope.statusPopup = $ionicPopup.show({
                    template:   
                                '<button class="flex flex-row jcc">'+
                                '   <span class="flex-resize tal" ng-bind="selectedLogRow.entity.old_status"></span>' +
                                '   <span class="flex-noresize svg-arrow-right svg-25 svg-blue"></span>' +
                                '   <span class="flex-resize tar" ng-bind="selectedLogRow.entity.new_status"></span>' +
                                '</button>' +
                                '<div class="b1eee" ng-bind="selectedLogRow.entity.comment" style="background: #fff; min-height: 150px; max-width: 100%; padding: 10px;"></div>',
                    title:      'History log',
                    // subTitle: 'Sub time',
                    scope: $scope,
                    buttons: [
                        { text: 'close', onTap: function(e) { return; } },
                    ]
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

        $scope.refreshHistory = function(recommendationID){
            return RecommendationFactory.getStatusLog(recommendationID).then(function (result) {

                // //TODO: Remove this once "commment" available
                // result.objects = _.map(result.objects, function (d) {
                //     d.comment = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
                //     return d;
                // });

                $scope.statusLogGrid.data = result.objects;
                $scope.statusLogGrid.minRowsToShow = result.objects.length;

                $rootScope.resize();
            });
        }


        $scope.getNumber = function(num) {
            return new Array(num);
        }


        /********************************************************************
         *
         *
         *  Sample recommendation chart
         *
         *
        *********************************************************************/

        // $scope.chartOptions1 = {
        //     options: {
        //         chart: {
        //             type: 'column', panning: true, margin: [55, 0, 0, 0] 
        //         },
        //         title: null,
        //         xAxis: {
        //             categories: [
        //                 'Jan',
        //                 'Feb',
        //                 'Mar',
        //                 'Apr',
        //                 'May',
        //                 'Jun',
        //                 'Jul',
        //                 'Aug',
        //                 'Sep',
        //                 'Oct',
        //                 'Nov',
        //                 'Dec'
        //             ],
        //             crosshair: true,
        //             opposite: true,
        //             gridLineWidth: 0
        //         },
        //         yAxis: {
        //             lineWidth: 0,
        //             lineColor: '#fff',
        //             gridLineWidth: 0,
        //             minorGridLineWidth: 0, 
        //             min: 0,
        //             labels: { align: 'left', x: 10, y: -5 },
        //             title: null,//{ text: '能源效率' },
        //             tickInterval: 25, // TODO: WARNING: HARDCODED use principle commented above once live
        //             max: 250,
        //             showLastLabel: false
        //         },
        //         tooltip: {
        //             headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        //             pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        //                 '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
        //             footerFormat: '</table>',
        //             shared: true,
        //             useHTML: true
        //         },
        //         plotOptions: {
        //             column: {
        //                 pointPadding: 0.2,
        //                 borderWidth: 0
        //             }
        //         }
        //     },
        //     series: [
        //         {
        //             name: '当前楼宇',
        //             showInLegend: false,
        //             data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

        //         }, {
        //             name: '行业平均',
        //             showInLegend: false,
        //             data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]

        //         }, {
        //             name: '优质楼宇',
        //             showInLegend: false,
        //             data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0, 59.6, 52.4, 65.2, 59.3, 51.2]

        //         }
        //     ]
        // };

        $timeout(function(){
            $rootScope.resize();
        });
}])








        // TEMP


        /********************************************************************
         *
         *
         *  Indicators
         *
         *
        *********************************************************************/


        // // middle big gauge
        // $scope.chartGaugeOptions0 = {
        //     options: {
        //         chart: { type: 'gauge', plotBackgroundColor: null, plotBackgroundImage: null, plotBorderWidth: 0, plotShadow: false, spacingTop: 15, spacingBottom: 15, spacingLeft: 0, spacingRight: 0 },
        //         title: null,
        //         exporting: { enabled: false },
        //         pane: { center: ['50%', '50%'], size: '100%', startAngle: 115, endAngle: -115, background: null },
        //         plotOptions: {
        //             gauge: {
        //                 dataLabels: { enabled: true, style: { 'fontSize': '20px' }, y: 20, borderWidth: 0 },
        //                 dial: { backgroundColor: '#c72424', borderColor: '#c72424', radius: '90%', baseLength: '0%' }, // dial arrow
        //                 pivot: { backgroundColor: '#c72424', radius: '4', } // dial arrow dot
        //             }
        //         },
        //         yAxis: {
        //             pane: 0,
        //             min: 0,
        //             max: 3000,
        //             lineColor: null,
        //             reversed: true,
        //             minorTickInterval: 1,
        //             tickPixelInterval: 10,
        //             minorTickPosition: 'outside',
        //             tickPosition: 'outside',
        //             tickWidth: 1,
        //             tickPositions: [0, 1000, 2000, 3000],
        //             labels: { step: 1, distance: 15, rotation: 'auto' },
        //             title: { text: 'kWh', align: 'middle', style: { 'fontSize': '12px' }, y: 7 }, // Y Title
        //             plotBands: [
        //                 { innerRadius: '90%', outerRadius: '100%', from: 0, to: 1000, color: '#55BF3B' }, // green
        //                 { innerRadius: '90%', outerRadius: '100%', from: 1000, to: 2000, color: '#ffcc00' }, // yellow
        //                 { innerRadius: '90%', outerRadius: '100%', from: 2000, to: 3000, color: '#DF5353' } // red
        //             ],
        //             dataLabels: {
        //                  formatter: function () {
        //                  var kmh = this.y,
        //                  mph = Math.round(kmh * 0.621);
        //             }
        //         },
        //         },
        //         credits: false
        //     },
        //     series: [
        //         {
        //             name: 'kWh',
        //             data: [0]
        //         }
        //     ],

        // };

        // // left small gauge
        // $scope.chartGaugeOptions1 = {
        //     options: {
        //         chart: { type: 'gauge', plotBackgroundColor: null, plotBackgroundImage: null, plotBorderWidth: 0, plotShadow: false, spacingTop: 15, spacingBottom: 15 },
        //         title: null,
        //         exporting: { enabled: false },
        //         pane: { center: ['50%', '60%'], size: '75%', startAngle: 115, endAngle: -115, background: null },
        //         plotOptions: {
        //             gauge: {
        //                 dataLabels: {
        //                     borderWidth: 0,
        //                     enabled: true,
        //                      formatter: function () {
        //                         switch(this.y) {
        //                             case 1:
        //                                 return 'EASY';
        //                             case 2:
        //                                 return 'NORMAL';
        //                             case 3:
        //                                 return 'HARD';
        //                         }
        //                     }
        //                 },
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
        //             title: { text: '回收周期', align: 'left', align: 'middle', style: { 'fontSize': '12px' }, y: 7, style:  { 'color': '#aaa' } }, // Y Title
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
        //             name: '回收周期',
        //             data: [0]
        //         }
        //     ],

        // };

        // // right small gauge
        // $scope.chartGaugeOptions2 = {
        //     options: {
        //         chart: { type: 'gauge', plotBackgroundColor: null, plotBackgroundImage: null, plotBorderWidth: 0, plotShadow: false, spacingTop: 15, spacingBottom: 15 },
        //         title: null,
        //         exporting: { enabled: false },
        //         pane: { center: ['50%', '60%'], size: '75%', startAngle: 115, endAngle: -115, background: null },
        //         plotOptions: {
        //             gauge: {
        //                 dataLabels: {
        //                     borderWidth: 0,
        //                     enabled: true,
        //                     formatter: function () {
        //                         switch(this.y) {
        //                             case 1:
        //                                 return 'EASY';
        //                             case 2:
        //                                 return 'NORMAL';
        //                             case 3:
        //                                 return 'HARD';
        //                         }
        //                     }
        //                 },
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
        //             title: { text: '回收周期', align: 'left', align: 'middle', style: { 'fontSize': '12px' }, y: 7, style:  { 'color': '#aaa' } }, // Y Title
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
        //             name: '回收周期',
        //             data: [0]
        //         }
        //     ],

        // };