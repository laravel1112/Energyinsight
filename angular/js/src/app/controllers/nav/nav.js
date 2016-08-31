 
angular.module('app.controllers.nav', [])
    .controller('unitsCtrl', [
        '$ionicHistory', '$ionicScrollDelegate', '$ionicViewSwitcher', '$scope', '$rootScope', '$state', 'toastr', 'toastrConfig', '$timeout', '$http', '$window', 'uiGridConstants', 'EnergyUnitFactory', 'DataSource', 'AllMetersService','MiscSelectionFactory', 'geoService', '$mdSidenav', 'platformService', '$templateCache',
        function ($ionicHistory, $ionicScrollDelegate, $ionicViewSwitcher, $scope, $rootScope, $state, toastr, toastrConfig, $timeout, $http, $window, uiGridConstants, EnergyUnitFactory, DataSource, AllMetersService,MiscSelectionFactory, geoService, $mdSidenav, platformService, $templateCache) {


            $scope.buildingListConfig = {
                template: 'template/energy-unit-groupped-list.html',
                data: DataSource.EnergyUnits(),
                datasource: function(){
                    var units = DataSource.EnergyUnits();
                    var evens = _.filter(units, function(obj) {
                        return !$scope.search.term || $scope.search.term.length == 0 || obj.name.toLowerCase().indexOf($scope.search.term.toLowerCase()) >= 0;
                    });

                    return evens;
                },
                filter: function(){
                  return searchTerm;
                },
                onMouseEnter: function(e, item){
                    //item.__highlighted = true;
                },
                onMouseLeave: function(e, item){
                    item.__highlighted = false;
                },
                onClick: function(item, index, e){
                    $ionicViewSwitcher.nextDirection('forward');
                    //TODO: Highlight marker
                    // $scope.navtype = 1; // to sitemap
                    
                    _.each($scope.buildingListConfig.datasource(), function(next){
                      next.__selected = next.id == item.id;
                      next.__highlighted = false;
                    })

                    console.log('item ' , item.id, item);
                    $rootScope.$state.go('root.home.unit', {id: item.id});

                    // Content is hidden and map is shown at energyunit selection view
                    // Hereby switch to sitemap or display user last visited section, but for selected unit

                    // item.__selected = true;
                    // $scope.selectedUnit = item;

                    // if($scope.sitemapItem) {
                    //   $rootScope.$state.go($scope.sitemapItem.href,  {id: $scope.selectedUnit.id});
                    // }

                }
            }
        }
    ])

    .controller('sitemapCtrl', [
        '$ionicHistory', '$ionicScrollDelegate', '$ionicViewSwitcher', '$scope', '$rootScope', '$state', 'toastr', 'toastrConfig', '$timeout', '$http', '$window', 'uiGridConstants', 'EnergyUnitFactory', 'DataSource', 'AllMetersService','MiscSelectionFactory', 'geoService', '$mdSidenav', 'platformService', '$templateCache',
        function ($ionicHistory, $ionicScrollDelegate, $ionicViewSwitcher, $scope, $rootScope, $state, toastr, toastrConfig, $timeout, $http, $window, uiGridConstants, EnergyUnitFactory, DataSource, AllMetersService,MiscSelectionFactory, geoService, $mdSidenav, platformService, $templateCache) {

            $scope.load = function(){
                $scope.selectedUnit = _.find(DataSource.EnergyUnits(), function(item){
                    return item.id == $rootScope.$stateParams.id;
                });

                // watch datasource for changes to update selected energy unit
                DataSource.changed().then(function(){
                    $scope.load();
                })
            }

            // initial load
            $scope.load();
            

            $scope.sitemapConfig = {
                template: 'template/sitemap.html',
                data: 
                {
                    "能源报告":          [
                                            { name: '综述指标', href: 'root.home.unit.reports.summary', icon: 'svg-monitor' },
                                            { name: 'DAILY', href: 'root.home.unit.reports.daily', icon: 'svg-monitor' },
                                            { name: '能耗构成', href: 'root.home.unit.reports.disagg', icon: 'svg-pie-chart' },
                                            { name: '历史比较', href: 'root.home.unit.reports.monthly', icon: 'svg-calendar' },
                                            { name: '能耗对比', href: 'root.home.unit.reports.regular', icon: 'svg-combo-chart' },
                                        ],
                    "优化方案":          [
                                            { name: "异常警报", href: 'root.home.unit.reports.alerts', icon: 'svg-alert' },
                                            { name: "节能方案", href: 'root.home.unit.recommendations.summary', icon: 'svg-light-bulb' },
                                            //{ name: "实时监测", href: 'root.home.unit.recommendations.configuration', icon: 'icon-cog' }
                                        ],
                    "分析工具":          [
                                            { name: "实时诊断", href: 'root.home.unit.tools.analysis', icon: 'svg-settings' },
                                            { name: "策略分析", href: 'root.home.unit.tools.strategies', icon: 'svg-flask' },
                                        ],
                },
                onClick: function(item, index, e){

                    $scope.navtype = 2; // keep sitemap view on selection

                    // Select clicked and deselect other sitemap items
                    _.each($scope.sitemapConfig.data, function(categories){
                        _.each(categories, function(next){
                            next.__selected = next == item;
                        })
                    })

                    // show content on mobile
                    $rootScope.setActiveView('content');

                    // EXCEPTION: Show Data page specific navigation
                    if(item.href == 'root.charts.summary')  {
                        $scope.navtype = 3;                  
                        $ionicScrollDelegate.scrollTop();   
                    }

                    $scope.sitemapItem = item;
                    $ionicViewSwitcher.nextDirection('forward');
                    $rootScope.$state.go(item.href, { id: $rootScope.$stateParams.id});
                }
            }
            

        }
    ])
