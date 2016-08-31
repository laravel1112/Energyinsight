angular.module('app.controllers.home.summary', [])

    .controller('homeCtrl', [
        '$ionicHistory', '$scope', '$rootScope', '$state', 'toastr', 'toastrConfig', '$timeout', '$http', '$window', 'uiGridConstants', 'EnergyUnitFactory', 'AllMetersService','MiscSelectionFactory', 'geoService', '$mdSidenav', 'platformService', '$templateCache',
        function ($ionicHistory, $scope, $rootScope, $state, toastr, toastrConfig, $timeout, $http, $window, uiGridConstants, EnergyUnitFactory, AllMetersService,MiscSelectionFactory, geoService, $mdSidenav, platformService, $templateCache) {





            /********************************************************************
             *
             *
             *  Table
             *
             *
            *********************************************************************/

            // $scope.getGridHeight = function() {
            //     var headerHeight = 75;
            //     var minLength = Math.max($scope.gridOptions1.data.length, 3); // At least 3;
            //     return {
            //         height: (Math.min($scope.gridOptions1.paginationPageSize, minLength) * $scope.gridOptions1.rowHeight + headerHeight) + "px"
            //     };
            // };


            // var numberAsStringSortFn = function(a, b, c, d, e) {
            //     var valA = parseInt(c.entity.value);
            //     var valB = parseInt(d.entity.value);
            //     if (valA == valB) return 0;
            //     if (valA < valB) return -1;
            //     return 1;
            // };
            // var usageTemplate= '<div ng-if="row.entity.usage">{{row.entity.usage}}</div><div ng-if="!row.entity.usage">评估进行中 </div>';
            // var saving_moneyTemplate= '<div ng-if="row.entity.saving_money">{{row.entity.saving_money}}</div><div ng-if="!row.entity.saving_money">评估进行中 </div>';
            // var saving_co2Template= '<div ng-if="row.entity.saving_co2">{{row.entity.saving_co2}}</div><div ng-if="!row.entity.saving_co2">评估进行中 </div>';
            // $scope.gridOptions = {
            //     enableRowSelection: true,
            //     enableRowHeaderSelection: false,
            //     multiSelect: false,
            //     enableSelectAll: false,
            //     rowHeight: 55,
            //     enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
            //     columnDefs: [
            //         { field: 'campus', displayName: '区域名称', width: "*", resizable: true, headerCellClass: 'green', enableColumnMenu: false, sort: { direction: uiGridConstants.ASC } },
            //         { field: 'name', displayName: '建筑名称', width: "*", resizable: true, headerCellClass: 'green', enableColumnMenu: false, },
            //         { field: 'type', displayName: '能效等级', width: 200, resizable: true, headerCellClass: 'green', enableColumnMenu: false, cellClass: 'text-center', sortingAlgorithm: numberAsStringSortFn, type: 'number', cellTemplate: '<uib-rating ng-model="row.entity.value" max="5" state-on="\'icon-star\'" state-off="\'hide-star\'" readonly="true">{{row.entity.value}}</uib-rating>' },
            //         // { field: 'usage', displayName: '总能耗', cellTemplate:usageTemplate,width: "*", resizable: true, headerCellClass: 'green', enableColumnMenu: false, cellClass: 'text-center', sortingAlgorithm: numberAsStringSortFn, type: 'number' },
            //         // { field: 'saving_money', displayName: '总节能潜力', cellTemplate:saving_moneyTemplate,width: "*", resizable: true, headerCellClass: 'green', enableColumnMenu: false, cellClass: 'text-center', sortingAlgorithm: numberAsStringSortFn, type: 'number' },
            //         // { field: 'saving_co2', displayName: '碳排减少空间', cellTemplate:saving_co2Template, width: "*", resizable: true, headerCellClass: 'green', enableColumnMenu: false, cellClass: 'text-center', sortingAlgorithm: numberAsStringSortFn, type: 'number' },
            //     ]
            // }

            // var url = 'api/energyunit/?format=json';

            // //TODO: CACHE THIS
            // $http.get(url/*, {cache: $templateCache}*/).then(function(result) {
            //     $scope.gridOptions.data = result.data.objects;
            // },function(err){
            //     console.log('err', err);
            // });

            // $scope.gridOptions.onRegisterApi = function(gridApi) {
            //     $scope.gridApi1 = gridApi;
            //     $scope.gridApi1.selection.on.rowSelectionChanged($scope, function (row) {
            //         $state.go('root.recommendations.summary', { id: row.entity.id });
            //     });
            // };


            /********************************************************************
            *
            *
            *  News feed
            *
            *
            *********************************************************************/


            // $scope.showNews = function(item) {
            //     $scope.selectedNews = item;
            //     $scope.newsFeedSwiper.swiper.slideNext();
            // }

            // $scope.hideNews = function(item) {
            //     $scope.newsFeedSwiper.swiper.slidePrev();
            // }


            // $scope.onNewsHeadlinesReady = function(swpr) {
            // console.log('onNewsHeadlinesReady ' , swpr);
            //     $scope.newsHeadlinesSwiper = swpr;
            // }

            // $scope.onNewsReady = function(swpr) {
            //     $scope.newsFeedSwiper = swpr;
            // }

            // $scope.getCategoryColor = function(categ){
            //     switch(categ){
            //         case '建议': return 'orange';
            //         case '新闻': return 'blue';
            //         case '报警': return 'magenta';
            //         default: return '#aaa';
            //     }
            // }

            // $scope.onBack = function(){
            //     console.log('on back button clicked');
            //     $scope.newsVisible = !$scope.newsVisible;
            // }


            //MiscSelectionFactory.get({name:'blog_post'}).then(function(result){
                //$scope.newsItems=$scope.convertTo(result.objects, 'created', false);
                // $timeout(function () {
                //     $scope.newsFeedSwiper.swiper.update(true);
                //     $scope.newsHeadlinesSwiper.swiper.update(true);
                // }, 5000);

            // var swiper = new Swiper('.swiper-container', {
            //})
            //     scrollbar: '.swiper-scrollbar',
            //     scrollbarHide: true,
            //     slidesPerView: 'auto',
            //     centeredSlides: true,
            //     spaceBetween: 30,
            //     grabCursor: true
            // });
        }
    ])    

    .controller('mapCtrl', [
        '$ionicHistory', '$scope', '$rootScope', '$state', 'toastr', 'toastrConfig', '$timeout', '$http', '$window', 'uiGridConstants', 'EnergyUnitFactory', 'DataSource', 'AllMetersService','MiscSelectionFactory', 'geoService', '$mdSidenav', 'platformService', '$templateCache',
        function ($ionicHistory, $scope, $rootScope, $state, toastr, toastrConfig, $timeout, $http, $window, uiGridConstants, EnergyUnitFactory, DataSource, AllMetersService,MiscSelectionFactory, geoService, $mdSidenav, platformService, $templateCache) {


            /********************************************************************
             *
             *
             *  Baidu map
             *
             *
            *********************************************************************/


            var longitude = 121.47537;
            var latitude = 31.232844;

            $scope.mapOptions = {
                center: {
                    longitude: longitude,
                    latitude: latitude
                },
                enableScrollWheelZoom: false,
                zoom: 10,
                city: 'ShangHai',
                markers: [],
                onMarkerClick: function (marker) {
                    if (marker){
                        $scope.$apply(function () {
                            $rootScope.$state.go('root.reports.summary', { id: marker.id });
                        });
                    }
                },
                onMarkerTap: function(marker){
                    if(marker){

                        $rootScope.$apply(function(){
                            _.each(DataSource.EnergyUnits(), function(next){
                              next.__selected = next.id == marker.id;
                              next.__highlighted = false;
                            });
                        });

                        toastrConfig.positionClass = 'bottom-left';
                        toastrConfig.maxOpened = 1; 
                        toastrConfig.closeHtml = '<button class="svg-building"></button>';
                        toastrConfig.autoDismiss = true;
                        toastrConfig.toastClass = 'custom-toast';
                        toastrConfig.target = '.map-marker-toast'; //TODO: change this
                        toastrConfig.templates = {
                            toast: 'templates/unit.toast.html',
                            progressbar: 'templates/toast.progressbar.html'
                        };
                        console.log('marker ' , marker);

                        toastr.info(marker.name, marker.data_campus, { 
                            extraData: marker.id,
                            closeButton: true,
                            extendedTimeOut: 60000,
                            timeOut: 60000,
                            onTap: function(toast){
                                $rootScope.setActiveView('subnav');
                                $rootScope.go('root.home.unit', { id: toast.scope.extraData });
                            }
                        });
                    }
                },
                onMarkerMouseOver: function(target){
                    var building = _.find(DataSource.EnergyUnits(), function(item){
                        return item.id == target.id;
                    });

                    $rootScope.$apply(function(){
                        building.__highlighted = true;
                    })
                },
                onMarkerMouseOut: function(e){
                    $rootScope.$apply(function(){

                        var building = _.find(DataSource.EnergyUnits(), function(item){
                            return item.id == e.target.customInfo.id;
                        });

                        building.__highlighted = false;
                    })


                }
            };

            $scope.zoomIn = function(){
                $scope.mapOptions.zoom = $scope.mapOptions.zoom + 1;
            }

            $scope.zoomOut = function(){
                $scope.mapOptions.zoom = $scope.mapOptions.zoom - 1;
            }

            if(platformService.isMobile){
                $scope.mapOptions.scaleCtrl = false;
                $scope.mapOptions.navCtrl = false;
            }

            // TODO: Simplify this
            $scope.$watchCollection(function(){
                return DataSource.EnergyUnits();
            }, 
                function(value){
                    $scope.loadData();
                }
            );


            //Watch for authorization to load data
            $scope.$watch(function(){
                            return $rootScope.isAuthorized();        
                        }, 
                        function(value){
                            if(value){
                                $timeout(function(){
                                    $scope.loadData();
                                })
                            }
                        }
            );


            DataSource.changed().then(function(){

            });

            // Load data for markers
            $scope.loadData = function(){
                //TODO: REFACTOR THIS AND CACHE DATA
                //$http.get('api/energyunit/?format=json&type__name=Building').then(function(result) {

                    //var buildingList = DataSource.EnergyUnits(); //result.data.objects;

                    /******************************************************
                    *
                    * Map related after 2016.01.03 modifications
                    *
                    *******************************************************/

                    _.forEach(DataSource.EnergyUnits(), function(building){
                        
                        
                        // fallback gps
                        building.buildingParam=building.buildingParam||{};

                        var geoPoint = building.GPSlocation ? building.GPSlocation.split(',') : [];
                        // marker preset
                        var marker = {
                            id: building.id,
                            source: building,
                            name: building.name,
                            data_campus: building.campus,
                            data_rating: building.value,
                            icon: 'static/image/building_icon3.png',
                            iconHover: 'static/image/building_icon4.png',
                            width: 49,
                            height: 60,
                            title: building.name,
                            content: '<a href="reports/' + building.id + '/summary">进入报告页</a>' //UGLY, but no other way
                        }
                        if(geoPoint.length==2){
                            $scope.mapOptions.markers.push(angular.extend(marker,
                                {
                                    longitude: geoPoint[0],
                                    latitude: geoPoint[1]
                                }
                            ));
                        }else{
                            geoService.toGPS(building.id).then(
                                function(success)
                                {
                                    //address to gps
                                    $scope.mapOptions.markers.push(angular.extend(marker,
                                        {
                                            longitude: success.location.lng,
                                            latitude: success.location.lat
                                        }
                                    ));
                                },
                                function(failure)
                                {
                                    //TODO: Error handling and log service
                                    //console.log('cannot get GPS coordinate due to incorrect address');
                                }
                            );
                        }
                        // retriving address

                    });
                // },function(err){
                //     console.log('err', err);
                // });

            }


            $timeout(function(){
                $scope.loadData();
            })

        }
    ]);




    //  TODO: DELETE ME
    //  MOVED: ../account/account.login.js

    // .controller('loginCtrl',[
    // '$scope', '$rootScope','$state', 'accountService', 'localStorageService',function ($scope, $rootScope, $state,accountService,localStorageService) {
        
    //     $scope.signin=function(){
    //     var formData={
    //         username:$scope.username,
    //         password:$scope.password
    //     }
    //     accountService.signin(formData).then(
    //         function(token){
    //             localStorageService.set('token',token);
    //             $state.go('root.home')
    //         },
    //         function(err){
    //             console.log(err);
    //         })

    //     }
    // }]);