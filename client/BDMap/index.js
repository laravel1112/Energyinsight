var $ = require('../jquery');
var qs = require('querystring');
var md5 = require('md5');
var _ = require('underscore');

function BaiduMap(config){
  this.ak = config.ak;
  this.sk = config.sk;
  this.apiBase = "http://api.map.baidu.com";
}

BaiduMap.prototype._request = function(url, data, callback){
  var ak = this.ak;
  var sk = this.sk;

  function generateSn(data){
    var keys = qs.stringify(data);
    return md5(encodeURIComponent(url + '?' + keys + sk));
  }

  var base = this.apiBase;
  var defaultData = {
    output: "json",
    ak: ak,
    timestamp: +new Date(),
  };
  data = _.extend(defaultData,data);
  data.sn = generateSn(data);

  return $.ajax( {url:this.apiBase + url + "?" + qs.stringify(data), dataType : "jsonp"});
}

var api_list = {
  geocoder : "/geocoder/v2/",
  direction : "/direction/v1",
  directionRouteMatrix: "/direction/v1/routematrix",
  locationIp : "/location/ip",
  geoconv: "/geoconv/v1/",
  placeSuggestion : "/place/v2/suggestion/",
  placeSearch : "/place/v2/search",
  placeEventSearch: "/place/v2/eventsearch",
  placeEventDetail: "/place/v2/eventdetail"
}

for(var api in api_list){
  (function(funcName, url){
    BaiduMap.prototype[funcName] = function(params){
      return this._request(url, params);
    }
  })(api, api_list[api]);
}


module.exports = function(options){
  return new BaiduMap(options);
};