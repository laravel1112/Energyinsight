angular.module('app.controllers.charts.summary.import', [])

    .controller('chartsImportCtrl', ['$scope', '$rootScope', 'uiGridConstants', '$http', 'csv2json', 'DataSource', '$timeout', '$ionicPopover', '$compile', function ($scope, $rootScope, uiGridConstants, $http, csv2json, DataSource, $timeout, $ionicPopover, $compile) {

        /* IMPORT DATA */

        DataSource.getUnitByID($rootScope.$stateParams.uid).then(function(unit){
        	$scope.formData = angular.copy(unit);
        	initImportPrompt();
		});

        // Import button click event
        $scope.onFileSelected = function(content){

            // HACK: remove space after delimiter,
            //       otherwise regex fails to find match in csv2json

            content = content.replace(/, /g, ',');

            // Convert CSV to JSON & bind to grid

            var json = csv2json.toJson(content);

            json = _(json).sortBy(function(item) {
                return item.date;
            });

            var id = 0;
            json = _.map(json, function(item){
                var date = moment(item.date).valueOf();
                return { date: date, value: item.value, id: id++ };
            });

            $scope.importGridOptions.data = json;

            // Digest

            $rootScope.resize();
        }

        // Merge/Replace prompt configuration


		$scope.popData = [
            { name: 'merge',  title: 'Merge with existing' }, 
            { name: 'replace', title: 'Overwrite existing' }
        ];
        
        $scope.popSelected = function(item){

        	$timeout(function(){
        		$scope.gridOptions.api.selectAll();
	        	var rows = $scope.gridOptions.api.getSelectedRows();
	        	$scope.importConfig.data = rows;

	            switch(item.name)
	            {
		            case 'merge':
		                $scope.saveImport({ replace: 'False'})
		                break;
		            case 'replace':
		            	$scope.saveImport({ replace: 'True'})
		                break;
	            }
        	})

	        $scope.popover.hide();
        }

        $ionicPopover.fromTemplateUrl('template/popover-list-menu.html', { scope: $scope }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.importConfig = {
            isVisible: false,
            title: 'Import type',
            containerID: 'meter-container',
            hideFooter: true,
            view: "template/dialog.prompt.import.html",
            onMerge: function(){
                $scope.saveImport({ replace: 'False'})
                $scope.importConfig.hide();
            },
            onReplace: function(){
                $scope.saveImport({ replace: 'True'})
                $scope.importConfig.hide();
            }
        }

        // Import save button click event, available after $scope.onFileSelected
        $scope.onSaveImport = function(e){
            //$scope.popover.show(e);
            //$scope.importConfig.show();
        }

        // Saving import data, triggered by $scope.importConfig.onMerge & $scope.importConfig.onReplace
        $scope.saveImport = function(options){

            var points = angular.copy($scope.importGridOptions.data);

            // Check for valid date
            if(moment(points[0].date).isValid()){

                points = _.map(points, function(item){
                    var date = moment(item.date).valueOf()  / 1000;
                    return { date: date, value: item.value };
                });

            } else if(moment(points[0].date / 1000).isValid()){

                points = _.map(points, function(item){
                    var date = moment(item.date / 1000).valueOf();
                    return { date: date, value: item.value };
                });

            } else {

                alert('Cannot parse Date field..'); return;

            }

            // Get import start and end dates
            var minDate = _.min(points, function(o){ return Math.round(moment(o.date).valueOf()); });
            var maxDate = _.max(points, function(o){ return Math.round(moment(o.date).valueOf()); });

            // Build date/value array
            points = _.map(points, function(item){
                return '[' + (moment(item.date).valueOf()) + ',' + item.value + ']';
            });


            // Submit data to the server
            //var data = { points: '[' + points + ']', time_format: 's', erase_flag: 'False'};
            var data = { points: '[' + points + ']', time_format: 's', erase_flag: options.replace, start_utc: '' + minDate.date + '', end_utc: '' + maxDate.date + '' };
            $http({
                url:'/api/putseries/' + $rootScope.$stateParams.uid + '/',
                data: data,
                method: 'POST'
            })
            .then(
                function(success) {
                    $scope.importGridOptions.data = [];
	        		$scope.gridOptions.api.setRowData($scope.importGridOptions.data);
                },
                function(failure) {
                    alert('An error occured while processing your import request.');
                }
            );
        }

        $scope.cancelImport = function(){
            $scope.importGridOptions.data = [];
	        $scope.gridOptions.api.setRowData($scope.importGridOptions.data);
        }

        $scope.promptConfig = function(){
        	return initImportPrompt;
        }

		/* INSERT DATA */
		var initImportPrompt = function(){
	        $scope.newImportEntryConfig = {
	            isVisible: true,
	            title: 'New record',
	            view: "template/ui.grid.chart.import.edit.dialog.html",
	            containerID: 'meter-container',
	            model: [
	                {
	                    type: 'input',
	                    name: 'date',
	                    value: moment().format('YYYY/MM/DD 00:00'),
	                    isDatePickerOpen: false,
	                    applyDateTime: function() {
	                        this.isDatePickerOpen = false;
	                    },
	                    getDate: function(){
	                        return moment(this.value).format('YYYY/MM/DD HH:mm');
	                    }
	                },
	                {
	                    type: 'input',
	                    name: 'value',
	                    value: 0
	                },
	                {
	                    type: 'hidden',
	                    value: 0
	                }
	            ],
	            onOk: function() {
	                if(moment(this.model[0].value).isValid() && this.model[1].value >= 0){

	                    var entry = { date: moment(this.model[0].value).format('YYYY/MM/DD HH:mm'), value: this.model[1].value };

	                    if(this.model[2].value > 0){

	                        // This is an existing entity

	                        var id = this.model[2].value;

	                        // Find edited entry
	                        var oldEntry = _.find($scope.importGridOptions.data, function(item){
	                            return item.id == id;
	                        });

	                        // Find entry index
	                        var index = $scope.importGridOptions.data.indexOf(oldEntry);

	                        // Apply changes
	                        $scope.importGridOptions.data[index].date = entry.date;
	                        $scope.importGridOptions.data[index].value = entry.value;

	                        $scope.gridOptions.api.setRowData($scope.importGridOptions.data);

	                    }else{

	                        // This is new entity

	                        // Find last ID in array
	                        var maxEntity = _.max($scope.importGridOptions.data, function(item){
	                            return item.id;
	                        });


	                        // Apply ID to entry for later editing
	                        entry.id = maxEntity.id > 0 ? maxEntity.id + 1 : 1;

	                        // Insert new entity into data array
	                        $scope.importGridOptions.data.push(entry);

	                        $scope.gridOptions.api.setRowData($scope.importGridOptions.data);

	                    }

	                    this.hide();
	                }
	                else{
	                    alert('Invalid entry values.');
	                }
	            },
	            onCancel: function(){
	                this.hide();
	            }
	        }

		}
		$scope.lastID = 1;

        $scope.addImportEntry = function(){

        	var newData = angular.copy($scope.importGridOptions.data);
        	newData.splice(0, 0,  { id: ++$scope.lastID, date: moment().format('YYYY/MM/DD 00:00'), value: 0 });
        	$scope.importGridOptions.data = newData; 

			$scope.gridOptions.api.setRowData($scope.importGridOptions.data);


            // $scope.newImportEntryConfig.title = '添加新数据';
            // $scope.newImportEntryConfig.model[0].value = moment().format('YYYY/MM/DD 00:00');
            // $scope.newImportEntryConfig.model[1].value = 0;
            // $scope.newImportEntryConfig.model[2].value = 0;
            // // $scope.newImportEntryConfig.model[2].value = maxID > 0 ? maxID : 1;
            // console.log('$scope.newImportEntryConfig ' , $scope.newImportEntryConfig);

            // $scope.newImportEntryConfig.show();

        }

        $scope.editImportRow = function(grid, row){
            $scope.newImportEntryConfig.title = '编辑现有数据';
            $scope.newImportEntryConfig.model[0].value = row.entity.date;
            $scope.newImportEntryConfig.model[1].value = row.entity.value;
            $scope.newImportEntryConfig.model[2].value = row.entity.id;

            $scope.newImportEntryConfig.show();
        }



        $scope.importGridOptions={

		 	// selectWithCheckboxOnly: true,
			// enableRowSelection: false,
   			// enableSelectAll: true,
   			// enableGroupHeaderSelection: false,
			// multiSelect: true,
			// enableFullRowSelection: false,
			enableRowSelection: false,
            paginationPageSize: 50,
			enablePaging: false,
		    enableSelectAll: true,
		    multiSelect: true,
		    modifierKeysToMultiSelect: true, //<-- doesnt work and drives me nuts!!!
			enableColumnMenus: false,
            enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
            enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER,
        }


        $scope.importGridOptions.columnDefs = [
            { field: 'date', displayName: 'Date', width: "*", resizable: true,  type: 'date', cellFilter: 'date:\'yyyy-MM-dd HH:mm\'' },
            { field: 'value', displayName: 'Value', width: "*", resizable: true,  }
        ];

 		$scope.importGridOptions.data = [];

        $scope.importGridOptions.onRegisterApi = function (gridApi) {

	        $scope.gridApi = gridApi;
			//$scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.OPTIONS);

	    }

	     $scope.getTableHeight = function() {
			var rowHeight = 30; // row height
			var headerHeight = 30; //  header height
			return {
				height: ($scope.importGridOptions.data.length * rowHeight + headerHeight) + "px"
			};
	    };


	    // expose data as a CollectionView to get events
	    //$scope.data = new wijmo.collections.CollectionView(data);






	var columnDefs = [
		{
            headerName: " ", checkboxSelection: true, suppressSizeToFit: true, width: 30
        },
	    {
            headerName: "Date", field: "date", width: 100, cellEditor: DatepickerEditor, editable: true
        },
        {
            headerName: "Value", field: "value", width: 100, editable: true
        }
	    
	];

		$scope.deleteSelected = function(){

				$scope.importGridOptions.data = _.filter($scope.importGridOptions.data, function(item){
					return $scope.selectedRows.indexOf(item) == -1;
				});
		        $scope.gridOptions.api.setRowData($scope.importGridOptions.data);
		}

		function onSelectionChanged() {
			if(!$scope.gridOptions.api) return;
			$scope.$apply(function(){
			    $scope.selectedRows = $scope.gridOptions.api.getSelectedRows();
			})
		    
		}

		$scope.gridOptions = {
			enableColResize: true,
		    columnDefs: columnDefs,
		    rowData: [],
		    rowSelection: 'multiple',
			suppressRowClickSelection: true,
			suppressHorizontalScroll: true,
			onSelectionChanged: onSelectionChanged
		};

		$timeout(function(){
			$scope.gridOptions.api.sizeColumnsToFit();
		});







        function DatepickerEditor() {
        }

        DatepickerEditor.prototype.onKeyDown = function (event) {
            var key = event.which || event.keyCode;
            if (key == 37 ||  // left
                key == 39) {  // right
                event.stopPropagation();
            }
        };

        DatepickerEditor.prototype.init = function (params) {

            this.container = document.createElement('div');
            this.container.style = "border: 1px solid #ccc;background: #e6e6e6;padding: 1px;width: 100%;text-align:center;display:inline-block;outline:none";
            this.container.tabIndex = "0"; // to allow the div to capture keypresses


            $scope.dtProxy = {
                value: params.value,
                select: function(date){
                    this.currentDate = date;
                    params.stopEditing();
                }
            };

            var dtHtml ='<input type="text" ng-model="dtProxy.value" style="width: 100%; height: auto; padding: 4px;" /><uib-datepicker ng-model="dtProxy.value" ng-change="dtProxy.select(dtProxy.value)" show-weeks="true" starting-day="1" class="datepicker"></uib-datepicker>';
            var dtTemplate = $compile(dtHtml)($scope);
            angular.element(this.container).append(dtTemplate);

            this.currentDate = params.value;
        };

        // gets called once when grid ready to insert the element
        DatepickerEditor.prototype.getGui = function () {
            return this.container;
        };

        DatepickerEditor.prototype.afterGuiAttached = function () {
            this.container.focus();
        };

        DatepickerEditor.prototype.getValue = function () {
            //return moment(this.currentDate).format('YYYY/MM/DD HH:mm');
            return moment($scope.dtProxy.value).format('YYYY/MM/DD HH:mm'); 
        };

        // any cleanup we need to be done here
        DatepickerEditor.prototype.destroy = function () {
        };

        DatepickerEditor.prototype.isPopup = function () {
            return true;
        };




    }])
// .directive('uiGridCell', ['$timeout', 'uiGridSelectionService', function ($timeout, uiGridSelectionService) {
//   return {
//     restrict: 'A',
//     require: '^uiGrid',
//     priority: -200,
//     scope: false,
//     link: function ($scope, $elm, $attr, uiGridCtrl) {
//       if ($scope.col.isRowHeader) {
//         return;
//       }
      
//       var touchStartTime = 0;
//       var touchTimeout = 300;
      
//       registerRowSelectionEvents();
      
//       function selectCells(evt) {
//         // if we get a click, then stop listening for touchend
//         $elm.off('touchend', touchEnd);
        
//         if (evt.shiftKey) {
//           uiGridSelectionService.shiftSelect($scope.grid, $scope.row, evt, $scope.grid.options.multiSelect);
//         }
//         else if (evt.ctrlKey || evt.metaKey) {
//           uiGridSelectionService.toggleRowSelection($scope.grid, $scope.row, evt, $scope.grid.options.multiSelect, $scope.grid.options.noUnselect);
//         }
//         else {
//           uiGridSelectionService.toggleRowSelection($scope.grid, $scope.row, evt, ($scope.grid.options.multiSelect && !$scope.grid.options.modifierKeysToMultiSelect), $scope.grid.options.noUnselect);
//         }
//         $scope.$apply();
        
//         // don't re-enable the touchend handler for a little while - some devices generate both, and it will
//         // take a little while to move your hand from the mouse to the screen if you have both modes of input
//         $timeout(function() {
//           $elm.on('touchend', touchEnd);
//         }, touchTimeout);
//       };

//       function touchStart(evt) {
//         touchStartTime = (new Date()).getTime();

//         // if we get a touch event, then stop listening for click
//         $elm.off('click', selectCells);
//       };

//       function touchEnd(evt) {
//         var touchEndTime = (new Date()).getTime();
//         var touchTime = touchEndTime - touchStartTime;

//         if (touchTime < touchTimeout ) {
//           // short touch
//           selectCells(evt);
//         }
        
//         // don't re-enable the click handler for a little while - some devices generate both, and it will
//         // take a little while to move your hand from the screen to the mouse if you have both modes of input
//         $timeout(function() {
//           $elm.on('click', selectCells);
//         }, touchTimeout);
//       };

//       function registerRowSelectionEvents() {
//         $elm.addClass('ui-grid-disable-selection');
//         $elm.on('touchstart', touchStart);
//         $elm.on('touchend', touchEnd);
//         $elm.on('click', selectCells);
//       }
//     }
//   };
// }])
