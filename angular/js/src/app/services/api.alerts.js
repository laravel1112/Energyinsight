angular.module('app.alerts', [])
.factory('AlertService', ['$q', '$http', 'Upload', function($q, $http, Upload) {
	var get, getByID, getByDateRange, setStatus;

	//obsolete
	// var sampleData = [
	// 	{ id: 1, alerttype: 1, alertstatus: 2, title: 'Alert title 1', saving_potential: 888, energy_saved: 888, description: 'Alert indicators, descriptions or both', created: moment().subtract(2, 'week').valueOf()},
	//        { id: 2, alerttype: 2, alertstatus: 1, title: 'Alert title 2', saving_potential: 888, energy_saved: 888, description: 'Alert indicators, descriptions or both', created: moment().subtract(4, 'day').valueOf()},
 	//        { id: 3, alerttype: 2, alertstatus: 1, title: 'Alert title 2', saving_potential: 888, energy_saved: 888, description: 'Alert indicators, descriptions or both', created: moment().subtract(3, 'day').valueOf()},
 	//        { id: 4, alerttype: 1, alertstatus: 0, title: 'Alert title 3', saving_potential: 888, energy_saved: 888, description: 'Alert indicators, descriptions or both', created: moment().subtract(2, 'day').valueOf()},
	// 	{ id: 5, alerttype: 1, alertstatus: 0, title: 'Alert title 4', saving_potential: 888, energy_saved: 888, description: 'Alert indicators, descriptions or both', created: moment().subtract(1, 'day').valueOf()}
	// ];

	var buffer = [];

	get = function(buildingID, refresh) {
		var deferred = $q.defer();

		if(buffer.length > 0 && !refresh)
			deferred.resolve(buffer);
		else
		{
			$http({
			    url:"api/alert_log/",
			    data: {"energyunit": buildingID},
			    method: 'GET'
			}).then(function(result){
				console.log('GET api/alert_log/'+buildingID, result);
				buffer = result.data.objects;
				// var _tmp = 0;
				// buffer = _.map(buffer, function(item){
				// 	return angular.extend(item, {alerttype: 1, alertstatus: _tmp = (_tmp == 0 ? 1 : 0) });
				// })

				deferred.resolve(buffer);		    
			},function(err){
			   deferred.resolve([]);  
			})
		}

		return deferred.promise;
	};

	getByID = function(buildingID, alertID){
		var deferred = $q.defer();

		get(buildingID).then(function(data){
			var result = _.find(data, function(match){
				return match.id == alertID;
			});

			deferred.resolve(result);
		})

		return deferred.promise;
	}
	

	getByDateRange = function(buildingID, start, end, refresh){
		var deferred = $q.defer();

		get(buildingID, refresh).then(function(data){
			var result = _.filter(data, function(match){
				return moment(match.alert_time) >= start && moment(match.alert_time) < end;
			});

			deferred.resolve(result);
		})

		return deferred.promise;
	}

	setStatus = function(buildingID, alertID, newStatus){
		
		var deferred=$q.defer();

		// AlertStatus: 1 == unread, 2 == ignored, 3 == dismissed

    	$http({
		    url:'api/alert_log/' + alertID + '/',
		    data: {alertstatus: 'api/alertstatus/' + newStatus + '/', id: alertID },
		    method: 'PUT'
		}).then(function(result){
			console.log('PUT api/alert_log/'+alertID, result);
			deferred.resolve(buffer);		    
		},function(err){
			console.log('ERROR: PUT api/alert_log/'+buildingID, err);
		   	deferred.resolve([]);  
		})

        return deferred.promise;
	};

	return {
		get: get,
		setStatus: setStatus,
		getByID: getByID,
		getByDateRange: getByDateRange
	};
}])