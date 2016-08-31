angular.module('app.export', [])
.factory('Exporter', ['$q', '$rootScope', 'EnergyUnitFactory', '$compile', function ($q, $rootScope, EnergyUnitFactory, $compile) {

	return {
		toPDF: function(filePrefix){
			$rootScope.$broadcast('export.pdf', {filePrefix: filePrefix});
		}
	}

}])
.directive('exportPdf', ['$rootScope', '$parse', '$timeout', '$window', '$compile', 'html2pdf', function ($rootScope, $parse, $timeout, $window, $compile, html2pdf) {
    return {
        priority: 1001,
        link: function ($scope, element, attrs, ctrl) {
    		if($('#export-container').length){
    			console.log('EXPORTPDF Directive: Element with id "export-container" already defined.');
    			return;
    		}

			var config = $parse(attrs.exportPdf)($scope);
			
			element.attr('id', 'export-container');

    		var unbindExportListener = $rootScope.$on('export.pdf', function(params){

                html2pdf.export($(element), config.filePrefix || 'export');

    		})

    		$scope.$on('$destroy', function(){
    			unbindExportListener();
    		})

        }
    }
}])
.run(['$rootScope', 'Exporter', function($rootScope, Exporter){

	$rootScope.getExporter = function(){
		return Exporter;
	}

}]);