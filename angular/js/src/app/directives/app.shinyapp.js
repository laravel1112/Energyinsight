//shinyapp directive
angular.module('app.shinyapp', [])
.directive('shinyapp',['configService', function (configService) {
	return {
	    restrict: 'E',
	    replace: true,
	    template: '<div class="shinyapp flex rel"><iframe id="shinyapp_frame" height="2600" ng-src="{{embedUrl}}" /></div>',    
	    link: function(scope, el, attr){
	    	scope.bldg_id = attr['bldgId'];
	    	el.find("iframe")[0].onload = function(){
        		scope["onIframeLoaded"]();
      		};
	    },
	    controller: function($scope, $sce){
	       
	       $scope["onIframeLoaded"] = function(){
	         	// after the iframe has loaded, send bldg_id to the iframe
	         	var frame = document.getElementById('shinyapp_frame');
                console.log("send bldg_id " + $scope.bldg_id + " to iframe");
                frame.contentWindow.postMessage($scope.bldg_id, '*');
	       };
	       var p=configService.settings;

	       p.then(function(data){
	       	console.log(data);
	       	$scope["embedUrl"] = $sce.trustAsResourceUrl(data.API_IP+'/energyinsight/summary/');
	       },
	       function(err){
	       	console.log(err);
	       })

	       }
  	};
}])