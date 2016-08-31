angular.module('ui.grid.custom', ['ui.grid.custom.pager']);




/* ionic-scroll never receives drag event. Unbind mouse event from grid  */
angular.module('ui.grid.custom.unbindEvents', [])
.directive('unbindEvents', ['$parse', '$timeout', '$window', function ($parse, $timeout, $window) {}])
.config(['$provide', function ($provide) {
	$provide.decorator('Grid', function ($delegate,$timeout) {
		$delegate.prototype.renderingComplete = function(){
			if (angular.isFunction(this.options.onRegisterApi)) {
				this.options.onRegisterApi(this.api);
			}
			this.api.core.raise.renderingComplete( this.api );
			$timeout(function () {
				var $viewport =  $('#'+this.id+'-grid-container');
				['touchstart', 'touchmove', 'touchend','keydown', 'wheel', 'mousewheel', 'DomMouseScroll', 'MozMousePixelScroll']
					.forEach(function (eventName) {
						$viewport.unbind(eventName);
					});
			}.bind(this));
		};
		return $delegate;
	});
}]);





angular.module('ui.grid.custom.pager', [])
    .directive('uiGridDynamicPager', ['$parse', '$timeout', '$window', function ($parse, $timeout, $window) {
        return {
            replace: false,
            link: function ($scope, element, attrs) {

                var rePage = function () {
                    var headerHeight = $(element).find('.ui-grid-header').height();
                    //var rowHeight = $scope.gridOptions1.rowHeight;
                    var rowHeight = $(element).find('.ui-grid-row').height();
                    var footerHeight = $(element).find('.table-footer').height();

                    rowHeight = rowHeight > 0 ? rowHeight : 55; 

                    var config = $parse(attrs.uiGrid)($scope);
                    var height = $(element).height();
                    var count = config.data ? config.data.length : 0;
                    var minHeight = headerHeight + rowHeight + footerHeight;

                    if (height < minHeight) {
                        height = minHeight;
                        //$(element).parent().css('min-height', minHeight);
                    }


                    var rows = Math.floor((height - headerHeight - footerHeight) / rowHeight);
                    config.paginationPageSize = rows;
                }

                // on window resize 
                angular.element($window).on('resize', function () {
                    $timeout(function() {
                        rePage();
                    }, 1000);
                });

                // on $digest
                $scope.$watch(function () {
                    rePage();
                });

                // on Init
                $timeout(function() {
                    rePage();
                });
            }
        }
    }])