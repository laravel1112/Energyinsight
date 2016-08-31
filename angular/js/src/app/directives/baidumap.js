/**
 *  A directive which helps you easily show a baidu-map on your page.
 *
 *
 *  Usages:
 *
 *      <baidu-map options='options'></baidu-map>
 *
 *      options: The configurations for the map
 *            .center.longitude[Number]{M}: The longitude of the center point
 *            .center.latitude[Number]{M}: The latitude of the center point
 *            .zoom[Number]{O}:         Map's zoom level. This must be a number between 3 and 19
 *            .navCtrl[Boolean]{O}:     Whether to add a NavigationControl to the map
 *            .scaleCtrl[Boolean]{O}:   Whether to add a ScaleControl to the map
 *            .overviewCtrl[Boolean]{O}: Whether to add a OverviewMapControl to the map
 *            .enableScrollWheelZoom[Boolean]{O}: Whether to enableScrollWheelZoom to the map
 *            .city[String]{M}:         The city name which you want to display on the map
 *            .markers[Array]{O}:       An array of marker which will be added on the map
 *                   .longitude{M}:                The longitude of the marker
 *                   .latitude{M}:                 The latitude of the marker
 *                   .icon[String]{O}:             The icon's url for the marker
 *                   .width[Number]{O}:            The icon's width for the icon
 *                   .height[Number]{O}:           The icon's height for the icon
 *                   .title[String]{O}:            The title on the infowindow displayed once you click the marker
 *                   .content[String]{O}:          The content on the infowindow displayed once you click the marker
 *                   .enableMessage[Boolean]{O}:   Whether to enable the SMS feature for this marker window. This option only available when title/content are defined.
 *
 *  @author      Howard.Zuo
 *  @copyright   Jun 9, 2015
 *  @version     1.2.0
 *
 *  @author fenglin han
 *  @copyright 6/9/2015
 *  @version 1.1.1
 * 
 *  Usages:
 *
 *  <baidu-map options='options' ></baidu-map>
 *  comments: An improvement that the map should update automatically while coordinates changes
 *
 *  @version 1.2.1
 *  comments: Accounding to 史魁杰's comments, markers' watcher should have set deep watch equal to true, and previous overlaies should be removed
 *
 */

'use strict';

var checkMandatory = function (prop, desc) {
    if (!prop) {
        throw new Error(desc);
    }
};

var defaults = function (dest, src) {
    for (var key in src) {
        if (typeof dest[key] === 'undefined') {
            dest[key] = src[key];
        }
    }
};

var baiduMapDir = function (baiduMapApi, $timeout) {

    // Return configured, directive instance

    return {
        restrict: 'E',
        scope: {
            'options': '='
        },
        template: '<div style="width: 100%; height: 100%;"></div>',
        link: function ($scope, element, attrs) {
            var map,
                hoverTimeout,
                previousMarkers = [],
                opts = $scope.options,
                defaultOpts = {
                    navCtrl: true,
                    scaleCtrl: true,
                    overviewCtrl: true,
                    enableScrollWheelZoom: true,
                    zoom: 10
                };

            //Methods
            var openInfoWindow,
                mark;

            // track global mouse position to workaround mouseout event 
            var currentMousePos = { x: -1, y: -1 };
            $(element).mousemove(function(event) {
                currentMousePos.x = event.pageX;
                currentMousePos.y = event.pageY;
            });


            defaults(opts, defaultOpts);
            checkMandatory(opts.center, 'options.center must be set');
            checkMandatory(opts.center.longitude, 'options.center.longitude must be set');
            checkMandatory(opts.center.latitude, 'options.center.latitude must be set');
            checkMandatory(opts.city, 'options.city must be set');

            $timeout(function() {
                baiduMapApi.load().then(function() {

                    // create map instance
                    map = new BMap.Map(element.find('div')[0]);
                    //$(map).height($(window).height());

                    //$(window).resize(function() {
                    //    //$('#map_canvas').height($(window).height());
                    //    console.log($(element).parent().width(), 'x', $(element).parent().height());
                    //    console.log($(element).width(), 'x', $(element).height());
                    //});

                    // init map, set central location and zoom level
                    map.centerAndZoom(new BMap.Point(opts.center.longitude, opts.center.latitude), opts.zoom);
                    if (opts.navCtrl) {
                        // add navigation control
                        map.addControl(new BMap.NavigationControl());
                    }
                    if (opts.scaleCtrl) {
                        // add scale control
                        map.addControl(new BMap.ScaleControl());
                    }
                    if (opts.overviewCtrl) {
                        //add overview map control
                        map.addControl(new BMap.OverviewMapControl());
                    }
                    if (opts.enableScrollWheelZoom) {
                        //enable scroll wheel zoom
                        map.enableScrollWheelZoom();
                    } else {
                        map.disableScrollWheelZoom();
                    }
                    // set the city name
                    map.setCurrentCity(opts.city);


                    if (!opts.markers) {
                        return;
                    }

                    $scope.$watch('options.zoom', function(newValue, oldValue) {

                        if(newValue > oldValue)
                            map.zoomIn();
                        else
                            map.zoomOut();

                        //opts = $scope.options;
                        //map.centerAndZoom(new BMap.Point(opts.center.longitude, opts.center.latitude), opts.zoom);
                        //mark();

                    }, true);

                    $scope.$watch('options.center', function(newValue, oldValue) {

                        opts = $scope.options;
                        map.centerAndZoom(new BMap.Point(opts.center.longitude, opts.center.latitude), opts.zoom);
                        mark();

                    }, true);

                    $scope.$watch('options.markers', function(newValue, oldValue) {

                        mark();

                    }, true);

                    mark();
                },function(err){
                    console.log(err);
                });
            });


            //create markers
            openInfoWindow = function(infoWin) {
                return function() {
                    this.openInfoWindow(infoWin);
                };
            };

            mark = function() {

                var i = 0;

                for (i = 0; i < previousMarkers.length; i++) {
                    if (opts.onMarkerClick) {
                        previousMarkers[i].removeEventListener('click', opts.onMarkerClick(marker));
                    }
                    else {
                        previousMarkers[i].removeEventListener('click', openInfoWindow(infoWindow2));
                    }
                    map.removeOverlay(previousMarkers[i]);
                }
                previousMarkers.length = 0;

                for (i = 0; i < opts.markers.length; i++) {
                    var marker = opts.markers[i];
                    var pt = new BMap.Point(marker.longitude, marker.latitude);
                    var marker2, icon, iconHover;

                    marker2 = new BMap.Marker(pt);

                    if (marker.icon) {
                        icon = new BMap.Icon(marker.icon, new BMap.Size(34, 48/*marker.width, marker.height*/));
                        marker2.setIcon(icon);
                    }
                    if (marker.iconHover) {
                        iconHover = new BMap.Icon(marker.iconHover, new BMap.Size(34, 48/*marker.width, marker.height*/));
                    }

                    // hack to make icon selected, directive shouldn't aware of private data source
                    if(marker.source.__selected)
                        marker2.setIcon(iconHover);

                    
                    // add marker to the map
                    map.addOverlay(marker2);
                    previousMarkers.push(marker2);

                    if (marker.name) {
                        //var label = new BMap.Label(marker.name, { offset: new BMap.Size(0, -20) });
                        //label.setStyle({ background: "#f00", width: "100px", display: "block", color: "#333", cursor: "pointer" });
                        marker2.setTitle (marker.name);
                    }

                    if (!marker.title && !marker.content) {
                        return;
                    }
                    var infoWindow2 = new BMap.InfoWindow('<p>' + (marker.title ? marker.title : '') + '</p><p>' + (marker.content ? marker.content : '') + '</p>', {
                        enableMessage: !!marker.enableMessage
                    });


                    marker2['customInfo'] = marker;

                    //TODO: improve this
                    marker2.addEventListener('mouseover', function (e) {
                        

                        if(hoverTimeout)
                            window.clearTimeout(hoverTimeout);

                        hoverTimeout = setTimeout(function(){
                            var markerPos = map.pointToPixel(e.point);
                            var distance = Math.sqrt( (markerPos.x-currentMousePos.x)*(markerPos.x-currentMousePos.x) + (markerPos.y-currentMousePos.y)*(markerPos.y-currentMousePos.y) );

                            //hack
                            if(distance > 20) return;        

                            if (iconHover)
                                e.target.setIcon(iconHover);

                            if(opts.onMarkerMouseOver)
                                opts.onMarkerMouseOver(e.target.customInfo);

                            e.target.setTop(true);

                        }, 1);


                    });

                    marker2.addEventListener('mouseout', function(e) {
                        var selected = e.target.customInfo.source.__selected;
                        if (icon && !selected){
                            console.log('not selected' , e.target.customInfo.source.__selected);
                            e.target.setIcon(icon);
                            e.target.setTop(false);
                        }
                        else if(e.target.customInfo.source.__selected) {
                            console.log('selected' , e.target.customInfo.source.__selected);
                            e.target.setTop(true);
                        }
                        
                        if(opts.onMarkerMouseOut)
                            opts.onMarkerMouseOut(e);

                    });

                    if(opts.onMarkerTap)
                    {
                        marker2.addEventListener('click', function(e) {
                            e.target.setTop(true);
                            return opts.onMarkerTap(e.target.customInfo);
                        });
                    }
                    // else
                    // {
                    //     marker2.addEventListener('click', openInfoWindow(infoWindow2));
                    // }

                    //keep this just in case if we choose to use direct navigation on click 
                    //if (opts.onMarkerClick) {
                    //    marker2.addEventListener('click', function (e) {
                    //        return opts.onMarkerClick(this.customInfo)
                    //    });
                    //} else {
                    //    marker2.addEventListener('click', openInfoWindow(infoWindow2));
                    //}
                }
            };




        }
    };
};

var baiduMap = angular.module('baiduMap', []);
baiduMap.directive('baiduMap', ['baiduMapApi', '$timeout', baiduMapDir]);
baiduMap.factory('baiduMapApi', ['$window', '$q', function lazyLoadApi($window, $q) {
    var deferred = $q.defer(),
        load;
    $window.initMap = function () {
        deferred.resolve();
    }
    load = function () {

        if (deferred.promise.$$state.status == 1) {
            deferred.resolve();
        } else {
            var script = document.createElement('script')
            script.src = 'http://api.map.baidu.com/api?v=2.0&ak=KRNQDv3desnEOULRaeOsmyvI&callback=initMap'
            document.body.appendChild(script)
        }
        return deferred.promise;

    }

    

    return {
        load: load
    }
}]);