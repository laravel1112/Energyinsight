require('./controllers/app.controllers.js');
require('./services/app.services.js');
require('./directives/app.directives.js');
require('./templates/app.templates.js');
require('./helpers/app.helpers.js');
require('./filters/app.filters.js');
var agGrid = require('ag-grid');



agGrid.initialiseAgGridWithAngular1(angular);

var app = angular.module('app', ['agGrid', 'ionic', 'ngCordova', 'ion-affix', 'angular.filter', 'ui.router', 'ui.bootstrap', 'ngAnimate', 'app.templates', 'app.controllers', 'app.services', 'app.directives', 'app.helpers', 'app.filters', 'baiduMap', 'ui.grid', 'ui.grid.edit', 'ui.grid.cellNav', 'ui.grid.pagination', 'ui.grid.pinning', 'ui.grid.selection', 'ui.grid.infiniteScroll', 'ui.grid.edit', 'ui.grid.grouping', 'ui.tree', 'highcharts-ng', 'angular-loading-bar', 'rzModule', 'LocalStorageModule', 'ngFileUpload', 'ngMaterial', 'angular-cache', 'toastr'])
app.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$provide', '$locationProvider', '$httpProvider', 'localStorageServiceProvider', '$mdThemingProvider', 'platformProvider', 'navDelegateProvider',
    function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $provide, $locationProvider, $httpProvider, localStorageServiceProvider, $mdThemingProvider, platformProvider, navDelegateProvider) {

        $httpProvider.defaults.headers.common = {};
        $httpProvider.defaults.headers.post = {};
        $httpProvider.defaults.headers.put = {};
        $httpProvider.defaults.headers.patch = {};

        $ionicConfigProvider.backButton.text(null);
        $ionicConfigProvider.backButton.previousTitleText(false);
        $ionicConfigProvider.views.maxCache(0);

        if (platformProvider.isMobile()) {
            $locationProvider.html5Mode({ enabled: false });
            $urlRouterProvider.otherwise('/login');
        } else {
            var base = document.createElement('base');
            base.href = '/';
            document.getElementsByTagName('head')[0].appendChild(base);
            $locationProvider.html5Mode({ enabled: true });
            $urlRouterProvider.otherwise('/login');
        }

        //material design theme
        $mdThemingProvider.theme('default')
            .primaryPalette('light-green',{
              'default': '700', // by default use shade 400 from the pink palette for primary intentions
              'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
              'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
              'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
            })
            .accentPalette('orange');

        localStorageServiceProvider.setPrefix('eqouta');

        /*

            root
                ''              ./_layout.html
                'nav@root'          ./nav.units.html
                'map@root'          ./views/home/map.html
                '@root'             - empty -


            *****************************************
            *
            *   LOGIN
            *
            *****************************************


            root.login      
                '@root'             ./login.html


             
            *****************************************
            *
            *   NAVIGATION
            *
            *****************************************


            // unit selection 
            root.home   
                '@root'             ./home/home.html                        always hidden to reveal map for Energy Unit selection
                

            // navigation for selected user 
            root.home.unit
                'nav@root'          ./nav.sitemap.html                      shown when Energy Unit selected                      



            *****************************************
            *
            *   REPORTS
            *
            *****************************************


            // RESERVED: layout for reports 
            root.home.unit.reports
                '@root'             ./views/reports.html                    reserved for Reports layout 


            root.home.unit.reports.*
                '@root.home.unit.reports'



            *****************************************
            *
            *   DATA
            *
            *****************************************


            root.home.unit.charts
                '@root'             ./views/charts.html                     reserved for Data layout  
                'nav@root'          ./views/charts/_sidebar.html 


            *****************************************
            *
            *   ACCOUNT
            *
            *****************************************


            root.login      
                '@root'             ./login.html


        */


        $stateProvider
            .state('root', {
                abstract: true,
                url: '',
                views: {
                    '': { // load: into nameless view in: ./common/templates/angular/index.html or ./mobile/ionic/www/index.html 
                        templateUrl: "static/views/_layout.html",
                        controller: 'rootCtrl'
                    },
                    // '@root': { // <-- load into nameless view in: ./views/_layout.html
                    //     templateUrl: DEFAULT_VIEW,
                    //     controller: DEFAULT_CTRL
                    // },
                    'map@root': {
                        templateUrl: "static/views/home/map.html",
                        controller: 'mapCtrl'
                    },
                    'subnav@root':{
                        templateUrl: 'static/views/nav.units.html',
                        controller: 'unitsCtrl'
                    }
                }
            })
            .state('root.login', {
                url: '/login',
                skipAuthorization: true,
                views: {
                    '': {
                        templateUrl: "static/views/login.html",
                        controller: 'loginCtrl'
                    }
                }
            })
            .state('root.home', {
                url: '/',
                data:{
                    title: 'Browse'
                },
                views: {
                    '': {
                        templateUrl: "static/views/home.html",
                        controller: 'homeCtrl'
                    }
                    /*,
                    'news@root.home': {
                        templateUrl: "static/views/news/news.list.html",
                        controller: 'newsCtrl'
                    },
                    'map@root.home': {
                        templateUrl: 'static/views/home/map.html',
                        controller: 'mapCtrl'
                    }*/
                }
            })
            .state('root.home.unit', {
                url: '{id:[0-9]+}',
                data:{
                    title: 'Browse'
                },
                views: {
                    'subnav@root': {
                        templateUrl: 'static/views/nav.sitemap.html',
                        controller: 'sitemapCtrl'
                    }
                }
            })


            /**********************************************************************************************
             *
             * News
            *
             **********************************************************************************************/

            .state('root.news', {
                url: '/news',
                data:{
                    title: 'News'
                },
                views: {
                    '@root': {},
                    'subnav@root': {
                        templateUrl: 'static/views/news/news.list.html',
                        controller: 'newsCtrl'
                    }
                }
            })
            .state('root.news.details', {
                url: '/:id',
                views: {
                    '@root': {
                        templateUrl: "static/views/news/news.details.html",
                        controller: 'newsCtrl'
                    }
                }
            })



            /**********************************************************************************************
             *
             * Reports
             * 
             **********************************************************************************************/

            .state('root.home.unit.reports', {
                abstract: true,
                url: '/reports',
                views: {
                    '@root': {
                        templateUrl: "static/views/reports.html",
                        //controller: 'reportsSharedCtrl'                        
                    },
                    // 'nav@root.reports': {
                    //     templateUrl: "static/views/reports/_sidebar.html",
                    //     controller: 'reportsNavCtrl'
                    // }
                }
            })

            .state('root.home.unit.reports.summary', {
                url: '/summary',
                data: { title: '核心能耗表现与综述', subtitle: 'Core Performance And Summary' },
                views: {
                    '@root.home.unit.reports': {
                        templateUrl: "static/views/reports/summary.html",
                        controller: 'reportsSummaryCtrl'
                    },
                }
            })
            .state('root.home.unit.reports.daily', {
                data: { title: '能耗构成解析', subtitle: 'Daily Statics' },
                url: '/daily',
                views: {
                    '@root.home.unit.reports': {
                        templateUrl: "static/views/reports/daily.html",
                        controller: 'reportsDailyCtrl'
                    },
                }
            })
            .state('root.home.unit.reports.disagg', {
                data: { title: '能耗构成解析', subtitle: 'Energy Disaggregation' },
                url: '/disagg',
                views: {
                    '@root.home.unit.reports': {
                        templateUrl: "static/views/reports/disagg.html",
                        controller: 'reportsDisaggCtrl'
                    },
                }
            })
            
            /*.state('root.home.unit.reports.consumptionTrends', {
                data: { title: '各项能耗每月与月内趋势分析', subtitle: 'Energy Usage Percentage Trend' },
                url: '/consumption-trends',
                views: {
                    '@root.home.unit.reports': {
                        templateUrl: "static/views/reports/consumptionTrends.html",
                        controller: 'reportsConsumptionTrendsCtrl'
                    },
                }
            })*/
            .state('root.home.unit.reports.monthly', {
                data: { title: '全年各项能耗总计分析', subtitle: 'Annual Energy Consumption' },
                url: '/monthly',
                views: {
                    '@root.home.unit.reports': {
                        templateUrl: "static/views/reports/monthly.html",
                        controller: 'reportsMonthlyCtrl'
                    },
                }
            })
            .state('root.home.unit.reports.trend', {
                data: { title: '能耗趋势与外部因素分析', subtitle: 'Daily Energy Consumption and External Factors' },
                url: '/trend',
                views: {
                    '@root.home.unit.reports': {
                        templateUrl: "static/views/reports/trend.html",
                        controller: 'reportsTrendCtrl'
                    },
                }
            })
            .state('root.home.unit.reports.regular', {
                data: { title: '常规能耗指标分析', subtitle: 'Energy Efficiency and Metrics' },
                url: '/regular',
                views: {
                    '@root.home.unit.reports': {
                        templateUrl: "static/views/reports/regular.html",
                        controller: 'reportsRegularCtrl'
                    },
                }
            })
            .state('root.home.unit.reports.sankey', {
                data: { title: 'Sankey Flow', subtitle: 'Sankey flow and comsumption temperature analysis'},
                url: '/sankey',
                views: {
                    '@root.home.unit.reports': {
                        templateUrl: "static/views/reports/sankey.html",
                        controller: 'reportsSankeyCtrl'
                    }
                }
            })
            .state('root.home.unit.reports.alerts', {
                data: { title: '异常警报', subtitle: '能效监测' },
                url: '/alerts',
                cache: false,
                views: {
                    '@root.home.unit.reports': {
                        templateUrl: "static/views/reports/alerts.html",
                        controller: 'reportsAlertsCtrl'
                    },
                }
            })
            .state('root.home.unit.reports.alerts.details', {
                data: { title: '异常详情', subtitle: '能效监测' },
                url: '/details/:aid',
                cache: false,
                views: {
                    '@root.home.unit.reports': {
                        templateUrl: "static/views/reports/alert.details.html",
                        controller: 'reportsAlertDetailsCtrl'
                    },
                }
            })
            
            // reserved as in original
            //.state('root.reports.recommendation', {
            //    url: '/recommendation',
            //    views: {
            //        '@root.reports': {
            //            templateUrl: "static/views/reports/recommendation.html",
            //            //controller: 'reportsCtrl'
            //        },
            //    }
            //})

            /***********************************************
             *
             * Recomendations
             *
             ***********************************************/

	    .state('root.home.unit.tools', {
                abstract: true,
                url: '/tools',
                data: { title: '节能建议与策划', subtitle: 'Optimization and Recommendation' },
                views: {
                    '@root': {
                        templateUrl: "static/views/recommendations.html"
                    },
                    // 'nav@root.recommendations': {
                    //     templateUrl: "static/views/recommendations/_sidebar.html",
                    //     controller: 'recommendationsNavCtrl'
                    // }
                }
            })
	    .state('root.home.unit.tools.analysis', {
                url: '/anaylsis',
                data: { title: '节能策略方案', subtitle: 'Analysis' },
                views: {
                    '@root.home.unit.tools': {
                        templateUrl: "static/views/tools/analysis.html",
                        controller: 'analysisCtrl'
                    },
                }
            })
	    .state('root.home.unit.tools.strategies', {
                url: '/strategies',
                data: { title: '节能策略方案', subtitle: 'Energy Efficiency Strategies' },
                views: {
                    '@root.home.unit.tools': {
                        templateUrl: "static/views/recommendations/strategies.html",
                        controller: 'recommendationsStrategiesCtrl'
                    },
                }
            })
	    
            .state('root.home.unit.tools.strategies.strategy1', {
                url: '/strategy1',
                data: { title: '节能试验室: 分时段对比', subtitle: '...' },
                views: {
                    '@root.home.unit.tools': {
                        templateUrl: "static/views/recommendations/strategies/strategy1.html",
                        controller: 'strategy1Ctrl'
                    },
                }
            })
            .state('root.home.unit.tools.strategies.strategy2', {
                url: '/strategy2',
                data: { title: '节能试验室: 削峰填谷', subtitle: '...' },
                views: {
                    '@root.home.unit.tools': {
                        templateUrl: "static/views/recommendations/strategies/strategy2.html",
                        controller: 'strategy2Ctrl'
                    },
                }
            })
            .state('root.home.unit.tools.strategies.strategy3', {
                url: '/strategy3',
                data: { title: '节能试验室: 晚间与周末分析', subtitle: '...' },
                views: {
                    '@root.home.unit.tools': {
                        templateUrl: "static/views/recommendations/strategies/strategy3.html",
                        controller: 'strategy3Ctrl'
                    },
                }
            })
            .state('root.home.unit.tools.strategies.strategy4', {
                url: '/strategy4',
                data: { title: '策划与分析: 节能目标分析', subtitle: '...' },
                views: {
                    '@root.home.unit.tools': {
                        templateUrl: "static/views/recommendations/strategies/strategy4.html",
                        controller: 'strategy4Ctrl'
                    },
                }
            })
            .state('root.home.unit.tools.strategies.strategy5', {
                url: '/strategy5',
                data: { title: '策划与分析: 能耗表现', subtitle: '...' },
                views: {
                    '@root.home.unit.tools': {
                        templateUrl: "static/views/recommendations/strategies/strategy5.html",
                        controller: 'strategy5Ctrl'
                    },
                }
            })
	    .state('root.home.unit.tools.heatmap', {
                data: { title: '全年能耗透视图', subtitle: 'Energy MRI versus Temperature' },
                url: '/heatmap',
                views: {
                    '@root.home.unit.tools': {
                        templateUrl: "static/views/reports/heatmap.html",
                        controller: 'reportsHeatmapCtrl'
                    },
                }
            })


            .state('root.home.unit.recommendations', {
                abstract: true,
                url: '/recommendations',
                data: { title: '节能建议与策划', subtitle: 'Optimization and Recommendation' },
                views: {
                    '@root': {
                        templateUrl: "static/views/recommendations.html"
                    },
                    // 'nav@root.recommendations': {
                    //     templateUrl: "static/views/recommendations/_sidebar.html",
                    //     controller: 'recommendationsNavCtrl'
                    // }
                }
            })
            .state('root.home.unit.recommendations.summary', {
                url: '/summary',
                data: { title: '节能建议与策划', subtitle: 'Optimization and Recommendation' },
                views: {
                    '@root.home.unit.recommendations': {
                        templateUrl: "static/views/recommendations/summary.html",
                        controller: 'recommendationsSummaryCtrl'
                    },
                }
            })
            .state('root.home.unit.recommendations.details', {
                url: '/details/:rid',
                data: { title: '节能建议与策划', subtitle: 'Optimization and Recommendation' },
                views: {
                    '@root.home.unit.recommendations': {
                        templateUrl: "static/views/recommendations/summary.details.html",
                        controller: 'recommendationsSummaryDetailsCtrl'
                    },
                }
            })
            
            .state('root.home.unit.recommendations.configuration', {
                url: '/configuration',
                data: { title: '系统控制', subtitle: '节能建议系统控制' },
                views: {
                    '@root.home.unit.recommendations': {
                        templateUrl: "static/views/recommendations/configuration.html",
                        controller: 'recommendationsConfigurationCtrl'
                    },
                }
            })
	    .state('root.home.unit.recommendations.alerts', {
                data: { title: '异常警报', subtitle: '能效监测' },
                url: '/alerts',
                views: {
                    '@root.home.unit.recommendations': {
                        templateUrl: "static/views/reports/alerts.html",
                        controller: 'reportsAlertsCtrl'
                    },
                }
            })
            .state('root.home.unit.recommendations.alerts.details', {
                data: { title: '异常详情', subtitle: '能效监测' },
                url: '/details/:aid',
                views: {
                    '@root.home.unit.recommendations': {
                        templateUrl: "static/views/recommendations/alert.details.html",
                        controller: 'reportsAlertDetailsCtrl'
                    },
                }
            })

            /***********************************************
             *
             * Charts
             *
             ***********************************************/

            .state('root.charts', {
                abstract: true,
                url: '',
                views: {
                    '@root': {
                        templateUrl: "static/views/charts.html"
                    },
                    'subnav@root': {
                        templateUrl: "static/views/charts/_sidebar.html",
                        controller: 'chartsNavCtrl'
                    }
                }
            })
            .state('root.charts.summary', {
                url: '/charts',
                data: { title: '实时能源数据', subtitle: 'Energy data' },
                views: {
                    '@root.charts': {
                        templateUrl: "static/views/charts/summary.html",
                        controller: 'chartsCtrl'
                    }
                }
            })

            .state('root.charts.summary.list', {
                url: '/list',
                data: { title: 'LIST', subtitle: 'Entities' },
                views: {
                    '': {
                        templateUrl: "static/views/charts/list.html",
                        controller: 'chartsListCtrl'
                    }
                }
            })

            .state('root.charts.summary.edit', {
                url: '/edit/:uid',
                data: { title: 'Entity', subtitle: 'SETTINGS' },
                views: {
                    '': {
                        templateUrl: "static/views/charts/edit.html",
                        controller: 'chartsEditCtrl'
                    },
                    'subnav@root': {
                        templateUrl: "static/views/charts/_sidebarEdit.html",
                        controller: 'chartsNavCtrl'
                    }
                }
            })

            .state('root.charts.summary.import', {
                url: '/import/:uid',
                data: { title: 'Entity', subtitle: 'IMPORT' },
                views: {
                    '': {
                        templateUrl: "static/views/charts/import.html",
                        controller: 'chartsImportCtrl'
                    },
                    'subnav@root': {
                        templateUrl: "static/views/charts/_sidebarEdit.html",
                        controller: 'chartsNavCtrl'
                    }
                }
            })

            /***********************************************
             *
             * Admin
             *
             ***********************************************/

            .state('root.admin', {
                url: '/admin',
                views: {
                    '': {
                        templateUrl: "static/views/admin.html",
                        controller: 'adminCtrl'
                    }
                }
            })

             /***********************************************
             *
             * User Account
             *
             ***********************************************/

            .state('root.account', {
                abstract: true,
                url: '/account',
                views: {
                    '@root': {
                        templateUrl: "static/views/account.html"
                    },
                    'subnav@root': {
                        templateUrl: "static/views/account/_sidebar.html",
                        controller: 'profileNavCtrl'
                    }
                }
            })
            .state('root.account.user', {
                url: '/user',
                data: { title: '设置' },
                views: {
                    '@root.account': {
                        templateUrl: "static/views/account/profileUser.html",
                        controller: 'profileUserCtrl',
                    }
                }
            })
            .state('root.account.company', {
                url: '/company',
                data: { title: '设置' },
                views: {
                    '@root.account': {
                        templateUrl: "static/views/account/profileCompany.html",
                        controller: 'profileCompanyCtrl',
                    }
                }
            });

        //
        // MOVED: services/app.account.js
        //
        // $httpProvider.interceptors.push(['$q', '$location', '$rootScope', 'localStorageService',function($q, $location, $rootScope,localStorageService) {
        //     return {
        //         'request': function (config) {
        //             var token = localStorageService.get('token');
        //             config.headers = config.headers || {};
        //             if (token) {
        //                 config.headers.Authorization = 'Bearer ' + token;
        //             }
        //             return config;
        //         },
        //         'response':function(response){
        //             // refresh token
        //             storedToken=localStorageService.get('token');
        //             receivedToken=response.headers('http_authorization');
        //             if(receivedToken){
        //                 receivedToken=receivedToken.split(" ")[1];
        //                 if (receivedToken&&storedToken !== receivedToken){
        //                     localStorageService.set('token',receivedToken);
        //                 }
        //             }
        //             return response
        //         },
        //         'responseError': function(response) {
        //             if(response.status === 401 || response.status === 403) {
        //                 localStorageService.remove('token')
        //                 $location.path('/login/');
        //             }
        //             return $q.reject(response);
        //         }
        //     };
        // }]);

    }
]); // --app.config


app.run(['$rootScope', '$state', '$stateParams', '$location', '$anchorScroll', '$window','EnergyUnitFactory', 'authService', '$timeout', '$ionicViewSwitcher', '$ionicHistory',
    function ($rootScope, $state, $stateParams, $location, $anchorScroll, $window, EnergyUnitFactory, authService, $timeout, $ionicViewSwitcher, $ionicHistory) {

        // Reference $state and $stateParams to the $rootScope so that
        // we can access them from any scope within applications.
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        $rootScope.activeView = 'content';
        $rootScope.setActiveView = function(viewName){
            $rootScope.activeView = viewName;
        }


        // TODO: Refactor window resize function

        $rootScope.resize = function(){
            $timeout(function(){
                angular.element($window).triggerHandler('resize');
                $($window).triggerHandler('resize');
                $rootScope.$broadcast('window:resize');
            });
        }



        // Cache buildings on authentication and reload 
        var loadBuildings = function(){
            EnergyUnitFactory.getByType(1).then(function(result) {
                $rootScope.buildings = result;
            });
        }
        
        // authService.login() event: app.account.js
        var onAuthSuccess = $rootScope.$on('auth:success', function() {
            loadBuildings();
        });

        // Cache on reload
        if(authService.isAuthorized()){
            loadBuildings();
        }


        $rootScope.$watch(authService.profile(), function(newValue){
            $rootScope.account = newValue;
        });
        
        $rootScope.isAuthorized = function(){
            return authService.isAuthorized();
        }


        // TODO: Refactor mobile sidemenu functions

        $rootScope.toggleBuildings = function(){
            $rootScope.expanded = !$rootScope.expanded; 
        };

        $rootScope.buildingsExpanded = function(){
            return $rootScope.expanded; 
        };

        $rootScope.selectBuilding = function(building){
            $rootScope.expanded = false;
            $rootScope.$state.go($rootScope.$state.current.name, { id: building.id });
        }


        $rootScope.go = function(stateName, stateParams, direction = 'forward'){
        console.log('stateParams ' , stateParams);
            $ionicViewSwitcher.nextDirection(direction);
            $state.go(stateName, stateParams);
        }

        $rootScope.goBack = function(levels){
            if(!levels) levels = -1;
                $ionicHistory.goBack(levels);
        }

        // App destroy event

        $rootScope.$on('$destroy', function() {
            onAuthSuccess();
        });

    }
]);


angular.element(document).ready(function () {
    angular.bootstrap(document, ['app']);
});

// Material design: Google Chrome password field decoration fix 
var mdInputContainerDirective = ['$delegate', '$interval', '$mdTheming', function($delegate, $interval,  $mdTheming) {
     var directive = $delegate[0];

     directive.compile = function() {
      return {
        post: function($scope, element, attr, ctrl) {
          $mdTheming(element);
 
          var interval;
          var count = 0;

          if (ctrl.input[0].type === 'password') {
            interval = $interval(function() {
              if (count > 10) {
                $interval.cancel(interval);
              }

              if (ctrl.input.parent()[0].querySelector('input:-webkit-autofill')) {
                ctrl.element.addClass('md-input-has-value');
                $interval.cancel(interval);
              }

              count++;
            }, 25);
          }
        }
      };
    };
}];
