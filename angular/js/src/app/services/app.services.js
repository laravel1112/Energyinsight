/********************************************************************
 * 
 * 
 *  App Services
 *  - Angular services are substitutable objects that are wired 
 *    together using dependency injection (DI). You can use services 
 *    to organize and share code across your app.
 *  
 *  There are 2 types of services
 *  1: Services 
 *     Instantiated new each time injected
 *     
 *  2: Factories
 *     Instantiated once and available throughout app lifetime 
 *     
*********************************************************************/
require('./app.csv2json')
require('./app.html2pdf')
require('./app.geo')
require('./app.account')
require('./app.io')
require('./app.platform')
require('./app.error')
require('./app.nav')
require('./app.export')
require('./app.config')
require('./api.alerts')

angular.module('app.services', ['app.csv2json', 'app.html2pdf', 'app.geo', 'app.account', 'app.io', 'app.platform', 'app.error', 'app.nav', 'app.export', 'app.config', 'app.alerts'])
.service('HelperService', [function() {
    var toPyTime, toJsTime;
    toPyTime = function(ts) {
        return moment(ts).unix();
    },
    toJsTime = function(ts) {
        return moment.unix(ts).valueOf();
    }
    return {
        toPyTime: toPyTime,
        toJsTime: toJsTime
    };
}])
.factory('DataSource', ['$q', '$rootScope', 'EnergyUnitFactory', function ($q, $rootScope, EnergyUnitFactory) {
    var EnergyUnits, EnergyUnitsOfType;
    var that = this;
    var _EnergyUnits = { meta: {}, objects: [] };
    var busy = false;
    var lastUpdated = moment();

    EnergyUnits = function(reload){
        if(!reload || _EnergyUnits.length > 0 || busy)
            return _EnergyUnits.objects;

        busy = true;
        EnergyUnitFactory.get().then(function(data){
            _EnergyUnits = data;
            busy = false;
        });

        return _EnergyUnits.objects;
    }

    var Units = function(reload){
        var deferred = $q.defer();

        if(!reload && _EnergyUnits.objects.length > 0 && !busy){
            //console.log('UNITS SOFT LOAD');
            deferred.resolve(_EnergyUnits.objects);
            return deferred.promise;
        }

        //console.log('UNITS HARD LOAD');

        busy = true;
        EnergyUnitFactory.get().then(function(data){
            _EnergyUnits = data;
            busy = false;
            deferred.resolve(_EnergyUnits.objects);
        });

        return deferred.promise;

    }

    var getUnitByID = function(id){
        var deferred = $q.defer();

        if(!id){
            console.log('getUnitByID: reference ID is undefined');
            deferred.resolve();
            return deferred.promise;
        }

        Units().then(
            function(units){
                var foundByID = _.find(units, function (unit) { return unit.id == id })
                deferred.resolve(foundByID);
            },
            function(){
                deferred.reject('ERROR: getUnitByID');
            }
        );
        return deferred.promise;
    }

    EnergyUnitsOfType = function(typeID){
        return EnergyUnits().objects.filter(function (building) {
            return building.type == typeID;
        });
    }


    var addUnit = function(unit){
        _EnergyUnits.objects.push(unit);
        console.log('_EnergyUnits.objects ' , _EnergyUnits.objects);
    }

    //TODO: Improve this
    //Watch for authorization to reload data
    $rootScope.$watch(function(){
            return $rootScope.isAuthorized();        
        }, 
        function(value){
            if(value)
                EnergyUnits(true);    
        }
    );

    // initial load
    if($rootScope.isAuthorized())
        EnergyUnits();

    return {
        EnergyUnits: EnergyUnits,
        _EnergyUnits: function() {
            return _EnergyUnits; 
        },
        changed: function(){
            var deferred = $q.defer();

            $rootScope.$watchCollection(
                function(){
                    return EnergyUnits();
                }, 
                function(newValue, oldValue){
                    if(!angular.equals(newValue, oldValue))
                        deferred.resolve(EnergyUnits());
                }
            );

            return deferred.promise;
        },
        Units: function(reload){
            return Units(reload);
        },
        getUnitByID: function(id){
            return getUnitByID(id);
        },
        addUnit: function(unit){
            return addUnit(unit);
        }
    }

}])
.factory('EnergyUnitFactory', ['$q', '$rootScope', '$http', function ($q, $rootScope, $http) {
    var get, getByType, getByTypes, getByID, update, getCategories, getType, create;

    // var unitCache = [];

    // var getFromCache = function(url){
    //     return _.find(unitCache, function (unit) { return unit.url === url })
    // };

    get = function (options) {
        var deferred = $q.defer();

        //build request url
        options=options||{};
        var url='api/energyunit/';
        if(options.id){
            url+=options.id+"/";
            delete options.id;
        }
        url+='?format=json&';

        // use cache to prevent overhead
        // var unit = getFromCache(url);
        // if(unitCache.length > 0 && unit){
        //     deferred.resolve(unit.data);
        //     return deferred.promise;
        // }

        // request server
        $http.get(url,{params: options}).then(function (result) {
            
            // cache results
            var data = result.data;
            // unitCache.push({ url: url, data: data});
            
            deferred.resolve(data);

        },function(err){
            deferred.reject(err);
        });

        return deferred.promise;
    };
    getCategories=function(){
        var deferred=$q.defer();
        $http.get('api/category/?format=json&').then(function(result){
            deferred.resolve(result.data);
        });
        return deferred.promise;
    };
    getType=function(){
        var deferred=$q.defer();
        $http.get('api/unittype/?format=json&').then(function(result){
            deferred.resolve(result.data);
        });
        return deferred.promise;
    };
    getByType = function(typeID) {
        var deferred = $q.defer();

        get().then(function(result) {
            var buildings = result.objects.filter(function (building) {
                return building.type == typeID;
            });

            deferred.resolve(buildings);
        });

        return deferred.promise;
    };

    getByTypes = function(types) {
        var deferred = $q.defer();

        get().then(function(result) {
            var buildings = result.objects.filter(function (building) {
                return types.indexOf(building.type) >= 0;
            });

            deferred.resolve(buildings);
        });

        return deferred.promise;
    };

    getByID = function (id,options) {
        var deferred = $q.defer();
        options=options||{};
        options.id=id;
        get(options).then(function (result) {
            // var buildings = result.objects.filter(function (building) {
            //     return building.id == id;
            // });

            deferred.resolve(result);
        });
        return deferred.promise;
    };
    getDetail=function(id,options){
        var deferred=$q.defer();
        getByID(id,options).then(function(building){
            if(!building) deferred.reject();
            var p;
            switch(building.type){
                case "Building":
                case 1: p=$http.get('api/buildingparam/?id='+building.buildingparam.id);break;
                case "Campus":
                case 2: p=$http.get('api/campusparam/?id='+building.campusparam.id);break;
                case "Meter":
                case 3: p=$http.get('api/meterparam/?id='+building.meterparam.id);break;
                default:
                    deferred.reject("no detail"); return;
            }
            p.then(function(result){
                (result.data.objects[0]||{}).super=building;;
                deferred.resolve(result.data);
            })
        });
        return deferred.promise;
    }
    update=function(unit,data,param,options){
        var deferred=$q.defer();
        var url='api/energyunit/'+unit.id+'/?format=json';
        var promise1=$http.put(url,data);
        var promise2=$q.defer();
        switch(unit.type){
            case 1:promise2=$http.put('api/buildingparam/'+unit.buildingparam.id+'/',param);break;
            case 2:promise2=$http.put('api/campusparam/'+unit.campusparam.id+'/',param);break;
            case 3:promise2=$http.put('api/meterparam/'+unit.meterparam.id+'/',param);break;
        }
        $q.all([promise1,promise2]).then(function(result){
            deferred.resolve(result.data);
        },function(err){
            console.log(err);
        });
        return deferred.promise;
    }
    create=function(data,options){
        var deferred=$q.defer();
        var url='api/energyunit/';
        var unit=_.clone(data);
        if(typeof(unit.type)=='number'){
            var type="Building";
            switch(unit.type){
                case 1: break;
                case 2: type="Campus";break;
                case 3: type="Meter";break;
            }
            unit.type="api/unittype/"+type+"/";
        }
        //data = {"parent": "api/energyunit/85/", "type": "api/unittype/Building/", "name": "A new test meter"}
        
        if(typeof(unit.parent)=='number'){
            unit.parent="api/energyunit/"+unit.parent+"/";
        }
        var promise1=$http.post(url,unit).then(function(result){
            deferred.resolve(result.data);
        },function(err){
           deferred.reject(err);
        });
        return deferred.promise;   
    }

    return {
        get: get,
        getByType: getByType,
        getByTypes: getByTypes,
        getByID: getByID,
        getDetail:getDetail,
        getCategories:getCategories,
        update:update,
        getType:getType,
        create:create
    };
}])
// .factory('BlogPostFactory',['$q','$rootScope','$http',function($q,$rootScope,$http){
//     var get;
// }])
.factory('MiscSelectionFactory',['$q','$http',function($q,$http){
    var get;
    get=function(options){
        var deferred=$q.defer();
        $http.get('api/'+options.name+"/").then(function(result){
            deferred.resolve(result.data);
        })
        return deferred.promise;
    }
    return {
        get:get
    }
}])
.factory('RecommendationFactory',['$q','$http',function($q,$http){
    var get, getByBuilding,getByDateRange, getDetail,getStatusLog;
    get = function (options) {
        var deferred = $q.defer();
        $http.get('api/recommendation/',{params:options.params}).then(function (result) {
            deferred.resolve(result.data);
        });
        return deferred.promise;
    };
    getByBuilding=function(building){
        var deferred=$q.defer();
        get({params:{energy_unit:building}}).then(function(result){
            var recommendations=result.objects
            deferred.resolve(recommendations);
        });
        return deferred.promise;
    };
    getByDateRange=function(building, start, end){
        var deferred=$q.defer();
        get({params:{energy_unit:building}}).then(function(result){
            var r = _.filter(result.objects, function(match){
                return moment(match.date_of_creation) >= start && moment(match.date_of_creation) < end;
            });
            deferred.resolve(r);
        });
        return deferred.promise;
    };
    getDetail=function(recommendationID){
        // get the max, min, money, co2 fields;
        return $q.resolve({ max1: 20000, max2: 20000, max3: 20000, current1: 10000, current2: 3000, current3: 9000 , money: 8310, co2: 4510});

    };
    getStatusLog=function(recommendationID){
        var deferred=$q.defer();
        $http.get('api/recommendation_status_log/?',{params :{recommendation:recommendationID}}).then(function(result){
            deferred.resolve(result.data);
        })
        return deferred.promise;
    }
    update=function(options){
        var deferred=$q.defer();
        // Current api is not implemented
        var reflink="/backend/"
        console.log(options.status);
        $http.put('api/recommendation/'+options.id+"/",{"status":"api/recommendation_status/"+options.status+"/",comment:options.comment, date_of_change: moment().valueOf() }).then(function (result) {
            deferred.resolve(result.data);
        });
        return deferred.promise;
    }
    return {
        get:get,
        getByBuilding:getByBuilding,
        update:update,
        getStatusLog:getStatusLog,
        getDetail:getDetail,
        getByDateRange: getByDateRange
    }
}])
.factory('UtilityService', ['$q', '$rootScope', '$http', function ($q, $rootScope, $http) {
    var timeRange, groupDataByTime, getAreaUnderCurve,getEnergyPrice,whichTimeRange,isSummer;


    timeRange = function(data,options){
        var start=options.starttime;
        var end=options.endtime;
        if(options.sharpTime){
            var t=new Date(options.starttime);
            start=new Date((t.getMonth()+1)+"/"+t.getDate()+"/"+t.getFullYear()).getTime();
            t=new Date(options.endtime);
            t.setDate(t.getDate()+1);
            end=new Date((t.getMonth()+1)+"/"+t.getDate()+"/"+t.getFullYear()).getTime();
        }
        if(!start||!end){
            return [];
        }
        var toReturn=_.filter(data,function(d){
            if(d[0]>=start&&d[0]<end) return true;
        });
        return toReturn;
    };

    getAreaUnderCurve = function(data,options){
        var sum=0;
        var toReturn={};
        options=options||{};
        // first filter out data error, 
        data=_.filter(data,function(d){
            if(d[1]==0) return false;
            return true;
        })
        for(var i=0;i<data.length-1;i++){
            if(options.weekdaysOnly){
                var d=new Date(data[i][0]);
                if(d.getDay()==6||d.getDay()==7) continue; // Skip these points
                d=new Date(data[i+1][0]);
                if(d.getDay()==6||d.getDay()==7) continue;
            }
            var h1=new Date(data[i+1][0]).getHours();
            var h2=new Date(data[i][0]).getHours();
            var s1=isSummer(data[i+1][0]);
            var s2=isSummer(data[i][0]);
            if(options.partitions){
                var r1=whichTimeRange(data[i+1][0],{s:s1})
                var r2=whichTimeRange(data[i][0],{s:s2})
                if(r1!=r2) continue;
                var u=(data[i+1][0]-data[i][0])/3600000
                if(!toReturn[r1]) toReturn[r1]=0;
                toReturn[r1]+=data[i][1]*u;
                // for(var j=0;j<options.partitions.length;j++){
                //     var section=options.partitions[j];
                //     if(section.start<section.end){
                //         if(h1<section.start||h1>section.end||h2<section.start||h2>section.end){
                //             continue;
                //         }
                //     }else{
                //         if((h1>section.end&&h1<section.start)||(h2>section.end&&h2<section.start)){
                //             continue;
                //         }
                //     }
                //     // Here means h1, h2 both in range.                     
                //     var u=(data[i+1][0]-data[i][0])/3600000;// make it in units of hour
                //     toReturn[j]=(toReturn[j]||0)+data[i][1]*u;
                // }
            } 
            var u=(data[i+1][0]-data[i][0])/3600000;// make it in units of hour
            sum+=data[i][1]*u; // This is like enumerate integration
        }
        if(options.partitions)return toReturn;
        return sum;
    };
    isSummer=function(time){
        var m=new Date(time).getMonth();
        if(m>=6&&m<=8) return true;
    }
    groupDataByTime = function(data,options){     
        var groupedData=_.groupBy(data,function(d){
            var date=moment(new Date(d[0]));
            date.utcOffset(480);
            var day="0"+date.date();
            var month="0"+(date.month()+1);
            var year = date.year();

            if(options.month){
                return year + "/" + month.slice(-2); // ex: 2015/11    
            }else if(options.hour==true){
                return year + "/" + month.slice(-2) + "/" + day.slice(-2) + ":" + date.hour(); // ex: 2015/11/11:18
            }else{
                return year + "/" + month.slice(-2) + "/" + day.slice(-2); // ex: 2015/11/11
            }
        });
        var groupedEnergy=[]
        for (key in groupedData){
            if(groupedData.hasOwnProperty(key)){
                var d=groupedData[key];
                if(d.length<2){
                    var energy=d[0][1];
                    groupedEnergy.push({time:key,total:energy});
                }else{
                    var energy=getAreaUnderCurve(d,{partitions:options.partitions});
                    groupedEnergy.push({time:key,total:energy});
                }
                
            }
        }
        // groupedData=_.map(groupedData,function(d){
        //     var da=new Date(d[0][0]);
        //     var interval=da.getHours()*60+da.getMinutes();
        //     da=new Date(d[d.length-1][0]);
        //     var interval2=24*60-da.getHours()*60-da.getMinutes();
        //     interval=Math.max(interval,interval2);
        //     var avg=60*24/d.length;
        //     return interval<avg*2
        // });
        
        // // Now for each group, calculate the power usage. 
        // var summary=_.map(groupedData,function(d){
        //     var sum=0;
        //     var date="";
        //     for(var i=0;i<d.length-1;i++){
        //         var x=(d[i+1][0]-d[i][0])/3600000; // x interval in (h);
        //         sum+=d[i][1]*x; // Like enumerate integration
        //         if(options.month){
        //             date= year+"/"+month.slice(-2);    
        //         }else if(options.day){
        //             date= year+"/"+month.slice(-2)+"/"+day.slice(-2);
        //         }
        //     }
        //     return {date:date,total:sum};
        // });
        return groupedEnergy;        
    }
    getEnergyPrice=function(){
        // This is done this way to prepare that future may using api to get it
        return $q.resolve({
            "s":{
                h:1.196,
                m:0.734,
                l:0.357
            },
            "ns":{
                h:1.231,
                m:0.769,
                l:0.292
            }
        })
    },
    whichTimeRange=function(time,options){
        var d=moment(time);
        //d.zone(-480); //<-- depricated
        d.utcOffset(-480);

        var hour = d.hours();
        if(hour<6||hour>=22) return "l";
        if(hour<11&&hour>=8) return "h";
        if(hour<21&&hour>=18) return "h";
        if(options.s==true){
            if(hour<15&&hour>=13) return "h";
        }
        return "m";
    }
    return {
        timeRange: timeRange,
        isSummer:isSummer,
        groupDataByTime: groupDataByTime,
        getAreaUnderCurve: getAreaUnderCurve,
        getEnergyPrice:getEnergyPrice
    };
}])
.factory('LanguageFactory',['$rootScope',function($rootScope){
    var filterFields;
    var hash={"description":"介绍",
    "type":"类型",
    "name":"名称",
    "value":"信息",
    "address":"地址",
    "buildingarea":"建筑范围",
    "yearbuild":"建筑年份",
    "manufacturer":"制造商",
    "modelname":"型号",
    "samplerate":"取点频率",
    "gpslocation":"GPS位置",
    "category":"类型",
    "employeenumber":"员工人数",
    "refrigerationunits":"冷却单位",
    "numberofrooms":"房间数量",
    "energysystemintro":"能耗系统介绍",
    "cookingfacility":"厨房"
    
    }
    function getTranslatedLabel(txt){
        return hash[txt.toLowerCase()]||txt;
    };
    function displayField(txt){
        //var fieldHash={"id":false,"buildingparam":false,"campus":false,"campusparam":false,"influxkey":false,"meterparam":false,"parent":false}
        var fieldHash={samplerate:true,"gpslocation":false,"category":true,"name":true,"type":false,"value":false,address:true,buildingarea:true,yearbuild:true,manufacturer:true,modelname:true,}
        return !!fieldHash[txt.toLowerCase()];
    }
    function getIcon(key) {
        //TODO: Find appropriate icons
        return 'icon-building';
    }
    filterFields=function(attr){
        var fields=[]
        for (var key in attr){
            if(attr.hasOwnProperty(key)&&key!='resource_uri'){
                if (displayField(key)) {
                    var i={ name: key, alias: getTranslatedLabel(key.toLowerCase()), value: attr[key], icon: getIcon(key) }
                    if (key=='buildingarea'){
                        i['value']+="平方米"
                    }
                    fields.push(i);
                    //fields[getTranslatedLabel(key.toLowerCase())]=attr[key];
                }
            }
        }
        return fields;
    }

    return {
        filterFields:filterFields,
        getTranslatedLabel:getTranslatedLabel
    }
}])

/***********************************************
* 
*   All Meters Service
*   /api/getAllMeters
* 
***********************************************/
.factory('AllMetersService', ['$q', '$rootScope', '$http', '$filter', 'UtilityService', 'seriesService','EnergyUnitFactory',function ($q, $rootScope, $http, $filter, UtilityService,seriesService,EnergyUnitFactory) {
    var load, calculate,partitionedEnergyUse,calculateBuildingEnergies;


    load = function (buildingID, start, end,options) {
        // var deferred = $q.defer();

        // $http({
        //     url: '/api/getAllMeters/',
        //     params: { serieName: buildingID, start: start, end: end },
        //     headers: { 'X-CSRF-Token': $("meta[name='csrf-param']").attr('content') }
        // }).then(function (result) {
        //     deferred.resolve(result.data);
        // });
        console.log('series service loading...');

    	var loadOption=_.extend({interval:"auto"},options);    
        // return deferred.promise;
        return seriesService.load(buildingID,start,end,loadOption);
    };

    calculateBuildingEnergies=function(buildings,start,end){

        var promises=_.map(buildings,function(building){
            var deferred=$q.defer();
            load(building.id,start.getTime(),end.getTime()).then(function(result){
                result=result[0]||{};
                var points = result.points || [];
                points = points.reverse();
                var energy=UtilityService.getAreaUnderCurve(points);
                deferred.resolve(energy);
            },function(err){
                deferred.reject(err);
            });
            return deferred.promise;
        });
            
        return $q.all(promises).then(function(energies){
            var data=[];
            for(var i=0;i<buildings.length;i++){
                data.push([buildings[i].name,energies[i]])
            
            }            
            return $q.resolve(data);
        })
    };

    calculate = function(building, options, cache) {
        var deferred = $q.defer(),
            loadData,
        options=options||{};
        var buildingarea=parseInt((building.buildingparam||{}).buildingarea)||1; 
        var meterStart=options.meterStart||parseInt((building.buildingparam||{}).billingCycleStart);
            var p;
            if(meterStart&&buildingarea){
                p=Promise.resolve([meterStart,buildingarea]);
            }else{
                p=EnergyUnitFactory.getDetail(building.id).then(function(bd){
                    bd=bd.objects[0]||{};
                    return Promise.resolve([parseInt(bd.billingCycleStart),parseInt(bd.buildingarea)]);
                });
            }
            p.then(function(buildingparam){
                billingCycle=buildingparam[0];
                buildingarea=buildingparam[1];
                billingCycle=billingCycle||1;
                buildingarea=buildingarea||1;
                var now = moment().valueOf();
                var now_moment=moment().utcOffset(480);
                yesterday = moment(now_moment).subtract(1, 'day').valueOf(),
                lastWeekStart = moment(now_moment).subtract(1, 'week').startOf('isoweek').valueOf(),
                lastYearSameMonthStart=now_moment.date()>billingCycle?moment(now_moment).subtract(1,'year').date(billingCycle).valueOf():moment(now_moment).subtract(1,'year').subtract(1,'month').date(billingCycle).valueOf();
                lastYearSameMonthToday=moment(now_moment).subtract(1, 'year').valueOf(),
                thisMonthStart = now_moment.date()>billingCycle?moment(now_moment).date(billingCycle).valueOf():moment(now_moment).subtract(1,'month').date(billingCycle).valueOf(),
                lastMonthToday = moment(now_moment).subtract(1, 'month').valueOf(),
                lastMonthStart = now_moment.date()>billingCycle?moment(now_moment).subtract(1,'month').date(billingCycle).valueOf():moment(now_moment).subtract(2,'month').date(billingCycle).valueOf(),

                loadData = cache ? $q.resolve(cache) : load(building.id, lastMonthStart, now);

                $q.all([loadData,load(building.id,lastYearSameMonthStart,lastYearSameMonthToday)]).then(
                    function (result) {
                        var lastYearData=result[1][0]||{};
                        var lastYearPoints=(lastYearData.points||[]).reverse();

                        result = result[0][0] || {};
                        var points = result.points || [];
                        points = points.reverse();

                        if (points.length < 1) {
                            return deferred.resolve({});
                        }

                        // Now get the subset of data
                        var lastMonthData = UtilityService.timeRange(points, { starttime: lastMonthStart, endtime: thisMonthStart, sharpTime: true });
                        var lastMonthEnergy = UtilityService.getAreaUnderCurve(lastMonthData);
                        var lastMonthPeak = UtilityService.getAreaUnderCurve(lastMonthData, { partitions: true})['h'];

                        // Last Month Same period compare to this month
                        var lastMonthCorespondData = UtilityService.timeRange(lastYearPoints, { starttime: lastYearSameMonthStart, endtime: lastYearSameMonthToday, sharpTime: true });
                        var lastMonthSamePeriod = UtilityService.getAreaUnderCurve(lastMonthCorespondData);
                        var thisMonthSamePeriod = UtilityService.getAreaUnderCurve(UtilityService.timeRange(points, { starttime: thisMonthStart, endtime: now }));

                        // Get last week, 5 business days energy
                        var lastWeekData = UtilityService.timeRange(points, { starttime: lastWeekStart, endtime: now, sharpTime: true });
                        var lastWeekEnergy = UtilityService.getAreaUnderCurve(lastWeekData, { weekdaysOnly: true });
                        var lastWeekPeak = UtilityService.getAreaUnderCurve(lastWeekData, { weekdaysOnly: true, partitions: true })['h'];

                        // Get Yesterday energy
                        var yesterdayData = UtilityService.timeRange(lastWeekData, { starttime: yesterday, endtime: yesterday, sharpTime: true })
                        var yesterdayEnergy = UtilityService.getAreaUnderCurve(yesterdayData);
                        var yesterdayPeak = UtilityService.getAreaUnderCurve(yesterdayData, { partitions: true })['h'];

                        // Get Today energy
                        var lastDay = new Date(points[points.length-1][0]);
                        var todayData = UtilityService.timeRange(lastWeekData, { starttime: lastDay.getTime(), endtime: lastDay.getTime(), sharpTime: true });
                        var todayEnergy = UtilityService.getAreaUnderCurve(todayData);
                        var todayPeak = UtilityService.getAreaUnderCurve(todayData, { partitions: true })['h'];

                        deferred.resolve({
                            lastMonthEnergyPerSqr: lastMonthEnergy/buildingarea,
                            lastMonthEnergy:lastMonthEnergy,
                            lastMonthPeak: lastMonthPeak,
                            lastMonthCompare: (thisMonthSamePeriod / lastMonthSamePeriod - 1)*100,
                            thisMonthSamePeriod: thisMonthSamePeriod,
                            dailyAverage: lastWeekEnergy / 5,
                            peakAverage: lastWeekPeak / 5,
                            yesterdayEnergy: yesterdayEnergy,
                            yesterdayPeak: yesterdayPeak,
                            todayEnergy: todayEnergy,
                            todayPeak: todayPeak
                        })
                    },
                    function(error) {
                        deferred.reject(error);
                    }
                );
            })


        return deferred.promise;
    };

    partitionedEnergyUse=function(buildingID,options, cache) {
        var deferred = $q.defer(),
            loadData;

        options = options || {};

        var start = options.starttime || moment().subtract(1, 'year').valueOf();
        var end = options.endtime || moment().valueOf();

        //TODO: CACHE TO OFFLINE
        loadData = /*cache ? $q.resolve(cache) :*/ load(buildingID, start, end);

        loadData.then(function(result) {
            result = result[0] || {};
            var points = result.points || [];
            points = points.reverse();
            var monthlyEnergy = UtilityService.groupDataByTime(points, options)
            deferred.resolve(monthlyEnergy);
        });

        return deferred.promise;
    }

    return {
        load: load,
        calculate: calculate,
        partitionedEnergyUse:partitionedEnergyUse,
        calculateBuildingEnergies:calculateBuildingEnergies
    };
}])

.factory('WeatherFactory', ['$q', '$rootScope', '$http', 'HelperService',function ($q, $rootScope, $http,HelperService) {
    var get,hdd,cdd;

    get = function(id,starttime,endtime) {
        var deferred = $q.defer();
        var data = { "isExternalRequest": "False", "time_format": "ms", "interval": "60m", "operation": "mean(TemperatureC),mean(Humidity)"}
        
        if (starttime)
            data.start_utc = HelperService.toPyTime(starttime);
        
        if (endtime)
            data.end_utc = HelperService.toPyTime(endtime);
        
        var url='api/getweather/'+id+"/";
        
        // $http({
        //     url: '/api/series',
        //     params: { serieName: buildingId,start:start,end:end },
        //     headers: { 'X-CSRF-Token': $("meta[name='csrf-param']").attr('content') }
        // }).then(function (result) {
        //     deferred.resolve(result.data);
        // });
        $http({
            url:url,
            data: data,
            method: 'POST'
        }).then(function(result){
            if(result.data){
                var points=(result.data[0]||{}).points||[];
                points=points.reverse();
                deferred.resolve(points);    
            }else{
                deferred.reject({error:"no data"});
            }
            
        },function(err){
           deferred.resolve([]);  
        })

        // $http.get('/static/data/api.weather.shanghai.zsss.2015.30m.json').then(function (result) {
        //     var data=result.data;
        //     if(starttime||endtime){
        //         data=_.filter(data||[],function(d){
        //             var t=new Date(d.date);
        //             if(starttime){
        //                 if(t<starttime)return false;
        //             }
        //             if(endtime){
        //                 if(t>endtime) return false;
        //             }
        //             return true;
        //         });    
        //     }
        //     deferred.resolve(data);
        // });

        return deferred.promise;
    }
    hdd=function(desiredTemp,tempSeries,options){
        var daily=_.groupBy(tempSeries,function(d){
            var date = new Date(d[0]);
            return (date.getMonth()+1) + '/' + date.getDate() + '/'+date.getFullYear();
        });
        var summary = { cdd: [], hdd: [] };
        angular.forEach(daily, function (v, k) {
            var tempSum = 0.0;
            var tempcdd=0,count=0,temphdd=0,count=0;
            for (var j = 0; j < daily[k].length; j++) {
                var diff=parseFloat(daily[k][j][1])-desiredTemp;
                if(diff>0){
                    tempcdd+=diff;
                    count++;
                }else if(diff<0){
                    temphdd-=diff;
                    count++;
                }
            }
            var time=new Date(k).getTime();
            if(!time){
                console.log(k);
            }
            summary.cdd.push([time,Math.round(tempcdd/count)]);
            summary.hdd.push([time, Math.round(temphdd / count)]);
        });
        return summary;
    }

    return {
        get: get,
        hdd:hdd
    };
}])


.factory('FormService', ['$q', '$rootScope', '$http', 'EnergyUnitFactory', function ($q, $rootScope, $http,EnergyUnitFactory) {
    var load,save;

    load = function (options) {

        var deferred = $q.defer();
        if(options.id){
            $http.get('api/monitoring_config/'+options.id+'/').then(function (result) {
                deferred.resolve(result.data);
            },function(err){
                deferred.reject(err);
            });    
        }else if(options.energy_unit_id){
            EnergyUnitFactory.getByID(options.energy_unit_id).then(function(result){
                return $http.get('api/monitoring_config/'+result.monitor_config+'/');
            }).then(function(result){
                deferred.resolve(result.data);
            },function(err){
                deferred.reject(err);
            })
        }
        

        return deferred.promise;
    }
    save=function(config,options){
        var deferred=$q.defer();
        if(options.id){
            $http.put('api/monitoring_config/'+id+"/",config).then(function (result) {
                deferred.resolve(result.data);
            },function(err){
                deferred.reject(err);
            });
        }else if(options.energy_unit_id){
            EnergyUnitFactory.getByID(options.energy_unit_id).then(function(result){
                return $http.put('api/monitoring_config/'+result.monitor_config+"/",config,{headers:{'Content-Type':'application/json'}});
            }).then(function(result){
                deferred.resolve(result.data);
            },function(err){
                deferred.reject(err);
            })
        }
        
        return deferred.promise;
    }

    return {
        load: load,
        save:save
    };
}])

.factory('seriesService', ['$q', '$rootScope', '$http', 'UtilityService', 'HelperService', '$templateCache', 
    function ($q, $rootScope, $http, UtilityService, HelperService, $templateCache) {
    
    var load,summaryStats;
    load = function (buildingId, start, end,options) {
        var interval=(options||{}).interval?options.interval:"auto";
        
        var deferred = $q.defer();
        var data = { "isExternalRequest": "False", "time_format": "ms", "interval": interval, "operation": "mean(value)"}
        if((options||{}).disagg){
            data['disagg']=options.disagg;
        }
        
        //  WARNING: 
        //      INFO:
        //      --- python unix_time returns seconds
        //      --- js getTime returns milliseconds
        //      --- python month starts with 1
        //      --- js month starts with 0
        //
        //      --- backend doesn't account this inconsistancy (view.py)
        //
        //      SOLUTION:
        //      --- Until backend didn't incorporate conversion, its implemented here

        if (start)
            data.start_utc = HelperService.toPyTime(start);
        
        if (end)
            data.end_utc = HelperService.toPyTime(end);
        
        var url='api/getseries/'+buildingId+"/";
        if(options.predict){
            url="api/predictseries/"+buildingId+"/";
        }
        // $http({
        //     url: '/api/series',
        //     params: { serieName: buildingId,start:start,end:end },
        //     headers: { 'X-CSRF-Token': $("meta[name='csrf-param']").attr('content') }
        // }).then(function (result) {
        //     deferred.resolve(result.data);
        // });

        $http.post(url, data).then(function (result) {

            // Py to Js time conversion, see warning above
            // Change the time unit into "ms", then the returned time is also "ms"
            // if (result.data && result.data.length > 0) {
            //     result.data[0].points = _.map(result.data[0].points, function (obj) {
            //         return [HelperService.toJsTime(obj[0]), obj[1]];
            //     });
            // }

            deferred.resolve(result.data);
        },function(err){
            console.log(err);
            deferred.resolve([]);
        });
        return deferred.promise;
    }
    summaryStats=function(data){
        return $q.resolve({}).then(function(){
            data=_.filter(data,function(d){
                return d[1]!=0;
            })
            var fulldatapeak = UtilityService.getAreaUnderCurve(data, { partitions:true})['h'];
            var energy=UtilityService.getAreaUnderCurve(data);
            var byDay=_.groupBy(data,function(d){
                var date=new Date(d[0]);
                var day="0"+date.getDate();
                var month="0"+(date.getMonth()+1);
                var year=date.getFullYear();
                return year+"/"+month.slice(-2)+"/"+day.slice(-2);
            })
            // check the head and tail see if they have enough data.
            // basically if the interval between midnight to first point, or last point to midnight next day is too big. then cut it
            byDay=_.filter(byDay,function(d){
                var da=new Date(d[0][0]);
                var interval=da.getHours()*60+da.getMinutes();
                da=new Date(d[d.length-1][0]);
                var interval2=da.getHours()*60+da.getMinutes();
                if(interval2-interval<12*60){
                    return false;
                }
                return true;
                // interval=Math.max(interval,interval2);
                // var avg=60*24/d.length;
                // return interval<avg*5
            })
            var dailyResult=_.map(byDay,function(d){
                 var result={sum:0,min:99999,max:0}
                 var currentMax=0,currentMin=999999,currentSum=0;
                 for(var i=0;i<d.length-1;i++){
                    var u=(d[i+1][0]-d[i][0])/3600000;// make it in units of hour
                    result.sum+=d[i][1]*u; // This is like enumerate integration
                    var td=new Date(d[i][0]).getHours();
                    var td2=new Date(d[i+1][0]).getHours();
                    if(td===td2){
                        currentSum+=d[i][1]*u;
                    }else{
                        result.max=Math.max(result.max,currentSum);
                        result.min=Math.min(result.min,currentSum);
                        currentSum=0;
                    }
                 }
                result.max=Math.max(result.max,currentSum);
                result.min=Math.min(result.min,currentSum);
                if(result.sum==0){
                    console.log(result);
                }
                return result;
            });
            var usage=_.pluck(dailyResult,"sum");
            var hmax=_.pluck(dailyResult,"max");
            var hmin=_.pluck(dailyResult,"min");
            var result={};
            // Calculate highest energy use point,
            var peak=0,avg=0;
            for(var i=0;i<data.length;i++){
                avg+=data[i][1];
                if(data[i][1]>peak){
                    peak=data[i][1];
                }
            }
            avg=avg/data.length;
            if(usage.length>0){
                result={
                    "dailymax":Math.max.apply(Math,usage).toFixed(2),
                    "dailymin":Math.min.apply(Math,usage).toFixed(2),
                    "dailyavg":(_.reduce(usage,function(s,u){return s+u},0)/usage.length).toFixed(2),
                    "hourlymax":Math.max.apply(Math,hmax).toFixed(2),
                    "hourlymin":Math.max.apply(Math,hmin).toFixed(2),
                    "peakPercent":(fulldatapeak/energy).toFixed(2),
                    "loadingFactor":(avg/peak).toFixed(2)
                }
            }else{
                result={
                    "dailymax":0,
                    "dailymin":0,
                    "dailyavg":0,
                    "hourlymax":0,
                    "hourlymin":0,
                    "peakPercent":0
                }
            }
            return $q.resolve(result);
        })
    }

    return {
        load: load,
        summaryStats:summaryStats
    };
}])

.service('modalService', ['$uibModal', function ($modal) {

    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: '/static/views/shared/dialog.html'
    };

    var modalOptions = {
        closeButtonText: 'Close',
        actionButtonText: 'OK',
        headerText: 'Proceed?',
        bodyText: 'Perform this action?'
    };

    var instance = null;

    this.show = function (customModalDefaults, customModalOptions) {

        if (instance) {
            instance.dismiss('cancel');
            instance = null;
        }



        //Create temp objects to work with since we're in a singleton service
        var tempModalDefaults = {};
        var tempModalOptions = {};

        //Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

        //Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions, customModalOptions);

        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = function ($scope, $modalInstance) {

                instance = $modalInstance;

                $scope.modalOptions = tempModalOptions;

                $scope.modalOptions.ok = function (result) {
                    instance = null;
                    $modalInstance.close(result);
                };

                $scope.modalOptions.close = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            };
        }

        return $modal.open(tempModalDefaults).result;
    };

    this.dismiss = function () {
        if (instance) {
            instance.dismiss('cancel');
            instance = null;
        }
    };


}])

.service('wizardService', ['$rootScope', 'modalService', '$q', '$injector', '$http', 'limitToFilter', function ($rootScope, modalService, $q, $injector, $http, limitToFilter) {

    this.show = function (scopeData, handler, customOptions) {
        var deferred = $q.defer();



        var defaultOptions = {
            templateUrl: 'template/wizard.html',
            windowClass: 'dialog',
            controller: function ($scope, $modalInstance) {
                $scope.data = scopeData;
                $scope.index = 0;

                $scope.steps = [
                    'template/wizard/step1.html', 'template/wizard/step2.html', 'template/wizard/step3.html'
                ];

                $scope.doStep = function (count) {
                    $scope.index += count;

                    $scope.index = Math.min($scope.index, $scope.steps.length);
                    $scope.index = Math.max($scope.index, 0);
                }


                $scope.ok = function (result) { $modalInstance.close(result); };
                $scope.close = function (result) { $modalInstance.dismiss('cancel'); };
            }
        };

        var tempOptions = {};
        angular.extend(tempOptions, defaultOptions, customOptions);

        modalService.show(tempOptions).then(function (result) {
            deferred.resolve(result);
        }, function () {
            deferred.reject();
        });

        return deferred.promise;

    };

}])
