angular.module('app.io', [])
.factory('urlService', ['$http', '$q', function($http, $q){
	var exists;

	exists = function(url, fallbackUrl){
		var deferred = $q.defer();
		if(!url) return $q.resolve(fallbackUrl);
		if(url){
			$http.get(url).then(
				function(success){
					deferred.resolve(url);
				},
				function(failure){
					deferred.resolve(fallbackUrl);
				}
			)
		}
		else
		{
			deferred.resolve(fallbackUrl);
		}

		
		return deferred.promise;
	}

	return {
		exists: exists
	}

}])
.run(['$rootScope', '$timeout', function($rootScope, $timeout){
		
		/***********************************************
         *
         * Global busy status using cfpLoadingBar http interceptor
         *
         ***********************************************/

        $rootScope.busyCount = 0;
        $rootScope.isBusy = false;

        var loadingEvent = $rootScope.$on('cfpLoadingBar:loading', function (opts) {
            if ($rootScope.busyCount < 0) $rootScope.busyCount = 0;
            $rootScope.busyCount++;
            $rootScope.isBusy = true;
        });

        var loadedEvent = $rootScope.$on('cfpLoadingBar:loaded', function (opts) {
            $rootScope.busyTimeout = $timeout(function () {
                $rootScope.busyCount--;
                if ($rootScope.busyCount <= 0) {
                    $rootScope.isBusy = false;
                }
            }, 1000);
        });

}])