angular.module('app.geo', [])
.factory('geoService', ['$http', '$q', 'localStorageService', function($http, $q, localStorageService){
	var ak = 'KRNQDv3desnEOULRaeOsmyvI', // unify with directives/baidumap.js 
		toGPS;


	var getLocationFromCache = function(unitId){
		var cache = localStorageService.get('geo');
		
		if(!cache) return null;

		var location = _.find(cache,function(d){
        	return unitId == d.unitId;
        });

        return location;
	}

	var addLocationToCache = function(location){
		var cache = localStorageService.get('geo');

		if(!cache) cache = [];

		var locationCached = getLocationFromCache(location.unitId);

        if(!locationCached){
        	cache.push(location);
			localStorageService.set('geo', cache);        	
        }
	}

	toGPS = function(unitId){
		var deferred = $q.defer();
		
		if(!unitId) {
			
			deferred.reject("Unit id cannot be empty.");

		} else {

			// Check local storage for address 
			var location = getLocationFromCache(unitId)
			if(!location){

				// TODO: REMOVE IT ONE GEOCODDER WORKS
				deferred.reject();
				return deferred.promise;



				var url =	'api/geocoder/' + 
							'?eu=' + unitId + 
							'&ak=' + ak;

				$http.get(url).then(function(success){
					
					// Add address to location
					location = success.data;
					location.unitId= unitId;
					
					// Save location into local storage
					addLocationToCache(location);
					
					// resolve promise
					deferred.resolve(location);

				},function(err){
					deferred.reject(err);
				});
			}
			else
			{
				deferred.resolve(location);
			}

		}
		return deferred.promise;
	}

    return {
    	toGPS: toGPS
    };
}])