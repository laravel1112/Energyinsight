angular.module('app.controllers.recommendations.configuration', [])

    .controller('recommendationsConfigurationCtrl', [
        '$scope', '$rootScope','FormService', function ($scope, $rootScope,FormService) {
            var configid=$rootScope.building
            var categories={'overall':{},'peak':{},'hvac':{},'lighting':{}};
            $scope.data={};
            FormService.load({energy_unit_id:$rootScope.$stateParams.id}).then(
                function(result) {
                    // for (key in categories){
                    //     for (item in result){
                    //         if(item.startsWith(key)){
                    //             if(item.contains('is_active')){
                    //                 categories[key]['enabled']=result[item]
                    //             }else{
                    //                 categories[key]['properties']=categories[key]['properties']||[];

                    //                 categories[key]['properties'].push({
                    //                     "name": item,
                    //                     "title": "title1",
                    //                     "value": result[item],
                    //                     "required": true,
                    //                     "regex": "^[0-9]$"
                    //                    });
                    //             }
                    //         }
                    //     }
                    // }
                    $scope.data = result;
                },
                function(error) {
                    console.log(error);
                }
            );

            $scope.save = function() {
                // var saveData={};
                // for (key in $scope.data){
                //     var d=$scope.data[key];
                //     saveData[key+'_is_active']=d['enabled'];

                //     for(var i=0;i< d['properties'].length;i++){
                //         saveData[d['properties'][i]['name']]=d['properties'][i]['value']||"";
                //     }
                // }
                var saveData=$scope.data;
                FormService.save(saveData,{energy_unit_id:$rootScope.$stateParams.id}).then(null,function(err){
                    console.log(err);
                })
            };
        }
    ])