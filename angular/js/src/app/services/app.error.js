angular.module('app.error', [])
.factory('ErrorHandler', ['$q', '$http', 'Upload', 'toastr', 'toastrConfig', function($q, $http, Upload, toastr, toastrConfig) {
	var list, notify;


    toastrConfig.positionClass = 'toast-bottom-full-width pa w100p';
    toastrConfig.maxOpened = 1; 
    toastrConfig.autoDismiss = true;
    toastrConfig.toastClass = 'custom-toast';
    toastrConfig.target = '.map-marker-details-container'; //TODO: change this


	list = function() {

	};

	notify = function(title, description) {

		toastr.info(title, description, { 
            extraData: marker.id,
            closeButton: true,
            extendedTimeOut: 60000,
            timeOut: 60000,
            onTap: function(toast){
                $rootScope.$state.go('root.reports.summary', { id: toast.extraData });
            }
        });

	};

	
	return {
		list: list,
		notify: notify
	};
}])