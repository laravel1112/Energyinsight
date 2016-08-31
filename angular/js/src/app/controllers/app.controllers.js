require('./home/home.js');
require('./news/news.js');
require('./reports/reports.js');
require('./recommend/recommend.js');
require('./charts/charts.js');
require('./account/account.js');
require('./admin/admin.js');
require('./nav/nav.js');


angular.module('app.controllers', [
        'app.controllers.home',
        'app.controllers.news',
        'app.controllers.reports',
        'app.controllers.recommendations',
        'app.controllers.charts',
        'app.controllers.account',
        'app.controllers.admin',
        'app.controllers.nav'
    ])

    
    .controller('navCtrl', [
        '$ionicHistory', '$ionicScrollDelegate', '$scope', '$rootScope', '$state', 'toastr', 'toastrConfig', '$timeout', '$http', '$window', 'uiGridConstants', 'EnergyUnitFactory', 'DataSource', 'AllMetersService','MiscSelectionFactory', 'geoService', '$mdSidenav', 'platformService', '$templateCache',
        function ($ionicHistory, $ionicScrollDelegate, $scope, $rootScope, $state, toastr, toastrConfig, $timeout, $http, $window, uiGridConstants, EnergyUnitFactory, DataSource, AllMetersService,MiscSelectionFactory, geoService, $mdSidenav, platformService, $templateCache) {

        }
    ])

    .controller('rootCtrl', [
        '$ionicHistory', '$ionicScrollDelegate', '$scope', '$rootScope', '$state', 'toastr', 'toastrConfig', '$timeout', '$http', '$window', 'uiGridConstants', 'EnergyUnitFactory', 'DataSource', 'AllMetersService','MiscSelectionFactory', 'geoService', '$mdSidenav', 'platformService', '$templateCache',
        function ($ionicHistory, $ionicScrollDelegate, $scope, $rootScope, $state, toastr, toastrConfig, $timeout, $http, $window, uiGridConstants, EnergyUnitFactory, DataSource, AllMetersService,MiscSelectionFactory, geoService, $mdSidenav, platformService, $templateCache) {

            //Search
            $scope.search = { term: null };
            $scope.navtype = 0;


            // $scope.$watch('navtype', function(newValue, oldValue, scope) {
            // });

            /********************************************************************
             *
             *
             *  Building List
             *
             *
            *********************************************************************/

            // $scope.v2_onBackClicked = function(){

            //     $scope.navtype = 0;
            //     //$scope.selectedUnit = null;
            // }



            // 1. Energy unit browser

            // $scope.buildingListConfig = {
            //     template: 'template/energy-unit-groupped-list.html',
            //     data: DataSource.EnergyUnits(),
            //     datasource: function(){
            //         var units = DataSource.EnergyUnits();
            //         var evens = _.filter(units, function(obj) {
            //             return !$scope.search.term || $scope.search.term.length == 0 || obj.name.toLowerCase().indexOf($scope.search.term.toLowerCase()) >= 0;
            //         });

            //         return evens;
            //     },
            //     filter: function(){
            //       return searchTerm;
            //     },
            //     onMouseEnter: function(e, item){
            //         //item.__highlighted = true;
            //     },
            //     onMouseLeave: function(e, item){
            //         item.__highlighted = false;
            //     },
            //     onClick: function(item, index, e){
            //         $rootScope.$state.go('root.home.unit', {uid: item.id});
            //         //TODO: Highlight marker
            //          $scope.navtype = 1; // to sitemap
                    
            //         _.each($scope.buildingListConfig.datasource(), function(next){
            //           next.__selected = next.id == item.id;
            //           next.__highlighted = false;
            //         })

            //         // Content is hidden and map is shown at energyunit selection view
            //         // Hereby switch to sitemap or display user last visited section, but for selected unit

            //         item.__selected = true;
            //         $scope.selectedUnit = item;

            //         if($scope.sitemapItem) {
            //           $rootScope.$state.go($scope.sitemapItem.href,  {id: $scope.selectedUnit.id});
            //         }

            //     }
            // }
 

            // 2. Sitemap browser

            // $scope.sitemapConfig = {
            //     template: 'template/sitemap.html',
            //     data: 
            //     {
            //         "能源报告":          [
            //                                 { name: '综述指标', href: 'root.home.unit.reports.summary', icon: 'icon-signal' },
            //                                 { name: '最新动态', href: 'root.home.unit.reports.trend', icon: 'icon-area-chart' },
            //                                 { name: '能耗构成', href: 'root.home.unit.reports.disagg', icon: 'icon-pie-chart' },
            //                                 { name: '能耗透视', href: 'root.home.unit.reports.heatmap', icon: 'icon-barcode' },
            //                                 { name: '历史比较', href: 'root.home.unit.reports.monthly', icon: 'icon-bar-chart' },
            //                                 { name: '能耗对比', href: 'root.home.unit.reports.regular', icon: 'icon-line-chart' },
            //                                 { name: "策略分析", href: 'root.home.unit.recommendations.strategies', icon: 'icon-flask' }
            //                             ],
            //         "优化方案":          [
            //                                 { name: "节能方案", href: 'root.home.unit.recommendations.summary', icon: 'icon-pagelines' },
            //                                 // { name: "实时监测", href: 'root.home.unit.recommendations.configuration', icon: 'icon-cog' }
            //                             ],
            //         "能源数据":          [
            //                                 { name: "实时能源数据", href: 'root.home.unit.charts.summary', icon: 'icon-bar-chart' }
            //                             ]
            //     },
            //     onClick: function(item, index, e){

            //         $scope.navtype = 2; // keep sitemap view on selection

            //         // Select clicked and deselect other sitemap items
            //         _.each($scope.sitemapConfig.data, function(categories){
            //             _.each(categories, function(next){
            //                 next.__selected = next == item;
            //             })
            //         })

            //         // EXCEPTION: Show Data page specific navigation
            //         if(item.href == 'root.charts.summary')  {
            //             $scope.navtype = 3;                  
            //             $ionicScrollDelegate.scrollTop();   
            //         }

            //         $scope.sitemapItem = item;
            //         $rootScope.$state.go(item.href, {id: $scope.selectedUnit.id});
            //     }
            // }
            

            // 3. Charts browser

            // $scope.chartsConfig = {
            //     template: 'template/energy-unit-groupped-list.html',
            //     data: [],
            //     onClick: function(item, index, e){
            //         //TODO: Highlight marker
            //         e.preventDefault();
            //         e.stopPropagation();
            //         $scope.navtype = 1;
            //         //$rootScope.$state.go('root.navigation');
            //     }
            // }


 
            // TODO: Simplify this
            // $scope.$watch(
            //     function(){
            //         return DataSource.EnergyUnits();
            //     }, 
            //     function(value){
            //         console.log('value ' , value);
            //         $scope.buildingListConfig.data = DataSource.EnergyUnits();//_.groupBy(EnergyUnitsOfType(1), 'campus');
            //         console.log('$scope.buildingListConfig.data ' , $scope.buildingListConfig.data);
            //     }
            // );


            // $scope.load = function(){

            //     var buildings = DataSource.EnergyUnits();
                
            //     var buildings = result.objects.filter(function (building) {
            //         return building.type == 1;
            //     });



            //     EnergyUnitFactory.getByType(1).then(function(result) {
            //         $scope.buildingListConfig.data = ;
            //     });
            // }

            

    }]);


// a way to manipulate data label line connectors
(function (H) {
    H.wrap(H.seriesTypes.pie.prototype, "drawDataLabels", function (p) {
        var x_offset = 5,
            y_offset = 12;

        p.call(this);

        H.each(this.points, function (p) {
            if (p.dataLabel && p.connector) {
                p.connector.attr({
                    d: [
                        "M",
                        p.dataLabel._pos.x + (p.labelPos[6] === "left" ? -x_offset : x_offset),
                        p.dataLabel._pos.y + y_offset,
                        "L",
                        p.labelPos[4],
                        p.labelPos[5]
                    ]
                });
            }
        });
    });
})(Highcharts)
