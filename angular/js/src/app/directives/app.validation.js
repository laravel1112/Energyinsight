angular.module('app.validation', [])
.directive('compareTo', function () {
	return {
		require: 'ngModel',
		link: function ($scope, elm, attrs, ctl) {
			$scope.$watch(attrs['compareTo'], function (errorMsg) {
		    	elm[0].setCustomValidity(errorMsg);
		    	ctl.$setValidity('compareTo', errorMsg ? false : true);
			});
		}
	};
})
.directive('mandatory', function(){
	return {
    	restrict: 'A',
    	require: '?ngModel',
    	link: function(scope, elm, attr, ctrl) {
      		if (!ctrl) return;
      		attr.required = true; // force truthy in case we are on non input element

      		ctrl.$validators.required = function(modelValue, viewValue) {
        		return !attr.required || !ctrl.$isEmpty(viewValue);
  			};

	      	attr.$observe('required', function() {
	        	ctrl.$validate();
	      	});
		}
  	};
});