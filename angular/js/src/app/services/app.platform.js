angular.module('app.platform', [])
.factory('platformService', ['$q', function($q){

	var isMobile;

	isMobile = function(){

        var isWebView = ionic.Platform.isWebView();
        var isIPad = ionic.Platform.isIPad();
        var isIOS = ionic.Platform.isIOS();
        var isAndroid = ionic.Platform.isAndroid();
        var isWindowsPhone = ionic.Platform.isWindowsPhone();

        // Cordova runs app as file system
		if(document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1)
			return true;

		// Ionic platform check
        if(isIPad || isIOS || isAndroid || isWindowsPhone){
        	return true;
        }

        //assume everything else are desktops
		var deviceInformation = ionic.Platform.device();
        var currentPlatform = ionic.Platform.platform();
        var currentPlatformVersion = ionic.Platform.version();

        return false;
	};

	return {
		isMobile: isMobile
	};

}])
.provider('platform', [function(){

	var isMobilePlatform = true;

    this.$get = function() {
        return {
            isMobile: function() {
				return isMobilePlatform;
            }
        }
    };

    this.isMobile = function(){
		return isMobilePlatform;
    	return document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
    }

}])
.run(['$rootScope', '$ionicPlatform', '$cordovaStatusbar', '$ionicHistory', 'platform', 'platformService',
	function($rootScope, $ionicPlatform, $cordovaStatusbar, $ionicHistory, platformProvider, platformService){
	
		//alert(platformService.isMobile());

		$rootScope.platform = function(){
			return platformProvider;
		}

		$ionicPlatform.ready(function() {
	        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
	        // for form inputs)
	        if (window.cordova && window.cordova.plugins.Keyboard) {
	            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
	            cordova.plugins.Keyboard.disableScroll(true);
	            //alert('cordova');
	        }

	        if (window.StatusBar) {
	            $cordovaStatusbar.overlaysWebView(false);
	            $cordovaStatusbar.styleHex('#f50'); 
	        }

	  //       setTimeout(function() {
	  //       	alert(window.StatusBar);
			//   if (window.StatusBar) {
			//     StatusBar.styleBlackTranslucent();
			//     StatusBar.backgroundColorByName('black');
			//   }
			// }, 3000); 

	    });

	    $rootScope.onBackClicked = function(){
	        console.log('onBackClicked');
	        if($ionicHistory.backView())
	            $ionicHistory.goBack();
	        else{
	            $ionicHistory.clearHistory();
	            $rootScope.$state.go('root.home');
	        }
	    }

}])
.directive('element', ['$rootScope', '$injector', '$compile', '$parse', '$injector', function ($rootScope, dialogService, $compile, $parse, $injector) {
        return {
            restrict: "EA",
            priority: 1000,
        	terminal: true,
        	replace: false,
            compile: function compile(element, attrs) {
            	var props = $parse(attrs.element)($rootScope);
            	if(!props || !props.render || !props.name)
            		return;

				element.attr(props.name, '');
				element.removeAttr("element");
				return {
			        pre: function preLink(scope, iElement, iAttrs, controller) {  },
			        post: function postLink(scope, iElement, iAttrs, controller) {  
			            $compile(iElement)(scope);
					}
				};
            }
        };
}]);




// TODO: Integrate cache for offline usage

angular.module('ngHttpCache', [])
.provider('ngHttpCacheConfig', function() {

    this.urls = ['/api'];

    var _this = this;

    this.$get = function() {
        return {
            urls: _this.urls
        };
    };

})
.factory('httpCache', ['CacheFactory', function(CacheFactory){
	var httpCache;

	// Check to make sure the cache doesn't already exist
	if (!CacheFactory.get('httpCache')) {
		httpCache = CacheFactory('httpCache',{
		  storageMode: 'localStorage'
		});
	}
	else
	{
	}

    // var httpCache = $cacheFactory('httpCache');
    return httpCache;
}])
.factory('lbInterceptor', ['httpCache', 'ngHttpCacheConfig',function(httpCache, ngHttpCacheConfig){
    return {
        request: function(config){
            var shouldCache = ngHttpCacheConfig.urls.reduce(function(should, url){
                if(config.url.indexOf(url) > -1){
                    return true;
                }
                return should;
            }, false);

            if(shouldCache){
                config.cache = httpCache;
                // console.log(config.cache.get(config.url));
                // the cache will be stored in `httpCache.get(config.url)`
            }
            return config;
        }
    };
}])
.config(['$httpProvider', '$ionicConfigProvider', function($httpProvider, $ionicConfigProvider){
    $httpProvider.interceptors.push('lbInterceptor');

    $ionicConfigProvider.navBar.alignTitle('center');
}])





angular.module('httpCacheHelper', ['ngHttpCache'])
.config(['ngHttpCacheConfigProvider', function(ngHttpCacheConfigProvider){
    ngHttpCacheConfigProvider.urls = ['api'];
}]);








// angular.module('offlinecheck', [])
// .config(['offlineProvider', function (offlineProvider) {
//     offlineProvider.debug(true);
// }])
// .run(['$http', 'offline', 'CacheFactory', 'connectionStatus', function ($http, offline, CacheFactory, connectionStatus){

// 		offline.start($http);
// 		offline.stackCache = CacheFactory('stackCache',{
// 		  storageMode: 'localStorage'
// 		});

// 		// https://docs.angularjs.org/api/ng/service/$http#caching
// 		$http.defaults.cache = CacheFactory('httpCache', {
// 		  storageMode: 'localStorage'
// 		});

// 		// based on navigator.onLine
// 		connectionStatus.$on('online', function () {
// 		  console.log('We are now online');
// 		});

// 		connectionStatus.$on('offline', function () {
// 		  console.log('We are now offline');
// 		});

// }]);