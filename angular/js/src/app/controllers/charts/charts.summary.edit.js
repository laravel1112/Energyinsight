angular.module('app.controllers.charts.summary.edit', [])

    .controller('chartsEditCtrl', ['$scope', '$rootScope', '$filter', 'seriesService', 'EnergyUnitFactory', 'uiGridConstants', '$q', '$window', '$http', '$timeout', '$interval', 'csv2json', 'LanguageFactory', 'DataSource', '$ionicPopover', '$ionicHistory',
    						function ($scope, $rootScope, $filter, seriesService, EnergyUnitFactory, uiGridConstants, $q, $window, $http, $timeout, $interval, csv2json, LanguageFactory, DataSource, $ionicPopover, $ionicHistory) {


		$ionicPopover.fromTemplateUrl('template/popover-list-menu.html', { scope: $scope }).then(function(popover) {
			$scope.popover = popover;
  		});

        $scope.categtoryOptions=[];
        $scope.editableFields = {
                building:["name","yearbuild", "address", "buildingarea", "employeenumber","refrigerationunits","cookingfacility","numberofrooms", "description", "energysystemintro"],
                meter:["name","manufacturer","modelname","samplerate","description"],
                campus:["name","description"],
        }

        var setupEditableFields = function(unitType){
	        switch(unitType){
	            case 1: 
	            	$scope.currentFields = $scope.editableFields['building'];
	            	$scope.extra = "buildingparam";
	            	break;
	            case 2: 
	            	$scope.currentFields = $scope.editableFields['campus'];
	            	$scope.extra = "campusparam";
	            	break;
	            case 3: 
	            	$scope.currentFields = $scope.editableFields['meter'];
	            	$scope.extra = "meterparam";
	            	break;
	        }

        }

        DataSource.getUnitByID($rootScope.$stateParams.uid).then(function(unit){
        	if(!unit){
        		console.log('WARNING: No Energy Unit match id:', $rootScope.$stateParams.uid);
        		return;
        	}

	        //$scope.formData.name = node.name;
	        $scope.extra="";
	        $scope.currentFields=[];

	        //Setup editable fields
	        setupEditableFields(unit.type);

	        // translate labels

	        // $scope.translateLabel = function (txt) {
	        //     var hash = {
	        //         "description": "介绍",
	        //         "type": "类型",
	        //         "name": "名称",
	        //         "value": "信息",
	        //         "address": "地址",
	        //         "buildingarea": "建筑范围",
	        //         "yearbuild": "建筑年份",
	        //         "manufacturer": "制造商",
	        //         "modelname": "型号",
	        //         "samplerate": "取点频率",
	        //         "gpslocation": "GPS位置",
	        //         "category": "类别"
	        //     };
	        //     return hash[txt] || txt;
	        // }
	        $scope.translateLabel=LanguageFactory.getTranslatedLabel;

	        // Bind form with data        
	        $scope.currentFields=$scope.currentFields||[];
            $scope.currentUnit = unit;
            $scope.formData=angular.copy(unit);
			
			// Handling new unit
			if(unit.id == 0)
            	$scope.editForm.$setDirty();
        })




        /* CONFIGURATION EDITING RELATED */

   //      var meterPromptConfig = function(){
			// /* CREATE NEW METER */
	  //       $scope.newMeterConfig = {
	  //           isVisible: false,
	  //           title: '节点名称',
	  //           view: "template/dialog.prompt.html",
	  //           containerID: 'meter-container',
	  //           model: [{
	  //               type: 'input',
	  //               name: '名称', //name
	  //               value: ''
	  //           },{
	  //               type: 'input',
	  //               name: '类别', //category
	  //               value: ''
	  //           }],
	  //           onOk: function(){
	  //               var node = {
	  //                   parent: $scope.formData.id,
	  //                   //campus: $scope.formData.campus,
	  //                   //influxKey: Math.random().toString(36).substring(7),
	  //                   name: this.model[0].value,
	  //                   type: parseInt(this.model[1].value)||1
	  //               }
	  //               $rootScope.$broadcast('create-meter', node);
	  //               this.hide();
	  //           },
	  //           onCancel: function(){
	  //               this.hide();
	  //           }
	  //       }
   //      }



        $scope.getCategory=function(id){
            var item=_.find($scope.categtoryOptions,function(d){
                    return id==d.id;
                });
            if(item) return item.name||"";
            return "";
        }
        
        $scope.getType=function(id){
            var item=_.find($scope.typeOptions,function(d){
                    return id==d.id;
                });
            if(item) return item.name||"";
            return "";
        }
        $scope.setType=function(unit, typeid){
        	unit.type = typeid;
        	setupEditableFields(unit.type);
		}

        $scope.setCategory=function(unit,categoryID){
            
            $scope.formData.category=categoryID;

        }




        /* PROPERTIES */

        $scope.saveProperties = function() {
        	if($rootScope.$stateParams.uid == 0){
        		delete $scope.formData['id'];
            	EnergyUnitFactory.create($scope.formData).then(function(data){
        			DataSource.Units(true).then(function(result){
        				$scope.editForm.$setPristine();
        				$rootScope.goBack(-1);
        				$rootScope.setActiveView('subnav');
        			})	
            	});
			}else{
	            var toupdate={}
	            $scope.currentFields.forEach(function(d){
					toupdate[d]=$scope.formData[$scope.extra] ? $scope.formData[$scope.extra][d]||$scope.formData[d] : $scope.formData[d];
	            });
	            unitParam={name:toupdate['name']};
	            delete toupdate['name'];
	            $scope.redraw();
	            //TODO: save data
	            EnergyUnitFactory.update($scope.formData,unitParam,toupdate).then(function(data){
	                // This is to feedback success.
	            });
	            $scope.formData = null;

	            $rootScope.go('root.charts.summary', {}, 'back');
	        }
        }

        $scope.resetProperties = function(){
			
			// Reseting properties for new meters deletes it
			if($scope.currentUnit.id == 0){
        		DataSource.Units(true).then(function(units){
            		$scope.editForm.$setPristine();
	            	$ionicHistory.goBack(-1);
	            	//$rootScope.go('root.charts.summary', {}, 'back');
        		});
        	}

        	$scope.formData = angular.copy($scope.currentUnit);
        	$scope.editForm.$setPristine();
        }









        
        EnergyUnitFactory.getCategories().then(function(result){
            $scope.categtoryOptions=result.objects;
        });

		EnergyUnitFactory.getType().then(function(result){
            $scope.typeOptions=result.objects;
        });




        //Unsubscribe from broadcast on controller destroy event
        $scope.$on('$destroy', function () {

        });

}]);
