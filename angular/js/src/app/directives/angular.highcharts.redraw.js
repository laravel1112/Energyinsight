angular.module('highcharts.redraw', [])
    .directive('highchartsRedraw', ['$parse', '$timeout', '$window', '$rootScope', '$ionicScrollDelegate', function ($parse, $timeout, $window, $rootScope, $ionicScrollDelegate) {
        return {
            transclude: true,
            replace: false,
            link: function ($scope, element, attrs) {
                $timeout(function(){

                    var config = $parse(attrs.config)($scope);
                    var chart = config.getHighcharts();

                    config.func = function (chart1) {
                        $timeout(function(){
                            $ionicScrollDelegate.resize();
                            $timeout(function(){
                                chart1.redraw();
                                chart1.reflow();
                            })
                        })
                    }

                    $scope.$watchCollection(chart.series, function (newValue, oldValue) {
                        // $timeout(function(){
                        //     if(chart){
                        //         console.log('changed');
                        //         chart.redraw();
                        //         chart.reflow();
                        //     }
                        // },5000)
                    });

                    var onResizeEvent = $rootScope.$on('window:resize', function(){

                        //$ionicScrollDelegate.resize(); 
                        // chart.redraw();
                        // chart.reflow();
                    });

                    $(window).resize(function() {
                        $rootScope.$broadcast('window:resize');
                    });

                    $scope.$on('$destroy', function(){
                        onResizeEvent();
                    });
                })
            }
        }
    }])

    .directive('highchartsPanning', ['$timeout', '$parse', function($timeout, $parse){
        // Runs during compile
        return {
            replace: false,
            link: function($scope, iElm, iAttrs, controller) {

                var chart;

                function Handler() {
                    
                    var ticking = false;
                    var lastDeltaX = 0;


                    function requestTick(args, extremes) {
                        if(!ticking) {
                            requestAnimationFrame(function(){
                                return update(args, extremes);
                            });
                        }
                        ticking = true;
                    }


                    function update(args, extremes) {
                        var newMinX;
                        var NewMaxX;
                        var xExtremes = extremes;
                        var range = extremes.max - extremes.min;
                        var step = Math.floor(range * .05);

                        // left and right 

                        if (args.direction == 4) {

                            // RIGHT
                            // limit to START of data
                            newMinX = xExtremes.dataMin < xExtremes.min - step ? xExtremes.min - step : xExtremes.dataMin;
                            newMaxX = xExtremes.dataMin < xExtremes.min - step ? xExtremes.max - step : xExtremes.max;
                            chart.xAxis[0].setExtremes(newMinX, newMaxX);
                        }
                        else if (args.direction == 2) {

                            // LEFT
                            // limit to END of data
                            newMinX = xExtremes.dataMax > xExtremes.max + step ? xExtremes.min + step : xExtremes.min;
                            newMaxX = xExtremes.dataMax > xExtremes.max + step ? xExtremes.max + step : xExtremes.dataMax;
                            chart.xAxis[0].setExtremes(newMinX, newMaxX);
                        }

                        //TODO: up and down

                        ticking = false;
                    }

                    this.move = function move(deltaX, deltaY, velocityX, velocityY, evt){

                        if(!chart) return;

                        requestTick(evt, chart.xAxis[0].getExtremes());

                    }
                    this.zoom = function(delta){

                        if(!chart) return;

                        busy = true;

                        var xMin = chart.xAxis[0].getExtremes().min;
                        var xMax = chart.xAxis[0].getExtremes().max;
                        var xdMin = chart.xAxis[0].getExtremes().dataMin;
                        var xdMax = chart.xAxis[0].getExtremes().dataMax;
                        var yMin = chart.yAxis[0].getExtremes().dataMin;
                        var yMax = chart.yAxis[0].getExtremes().dataMax;
                       
                        newMin = xMin;
                        newMax = xMax;

                        var diff = xMax - xMin;
                        var diffData = xdMax - xdMin;

                        if(delta > 0)
                        {
                            //zoomin
                            if(diff > diffData * .05)
                            {
                                newMin = xMin + diff * .05; //moment(xMin).add(1, 'month').valueOf();
                                newMax = xMax - diff * .05; //moment(xMax).subtract(1, 'month').valueOf();
                            }
                        }
                        else
                        {
                            //zoomout
                            if(diff < diffData)
                            {

                                newMin = xMin - diff * .05 < xdMin ? xdMin : xMin - diff * .05; //moment(xMin).add(1, 'month').valueOf();
                                newMax = xMax + diff * .05 > xdMax ? xdMax : xMax + diff * .05; //moment(xMax).subtract(1, 'month').valueOf();
                            }
                        }

                        // horizontal panning


                        chart.xAxis[0].setExtremes(newMin, newMax);

                        // vertical panning
                        //chart.yAxis[0].setExtremes(yMin + (1 - zoomRatio) * yMax, yMax * zoomRatio);
                    }
                };

                var handler = new Handler();

                $scope.onPanning = function(args){
                    var deltaX = 0;
                    if(args.direction == 4) //right
                        deltaX = 1;

                    if(args.direction == 2) // left
                        deltaX = -1;

                    if(deltaX != 0)
                        handler.move(deltaX, args.deltaY, args.velocityX, args.velocityY, args);
                }

                $scope.onTap = function(args){
                    console.log('onTap', args);
                }

                $scope.onPinching = function(args){
                    handler.zoom(args.scale >= 1 ? 1 : -1);
                }

                $scope.onDoubletap = function(args){
                    handler.zoom(1);
                }

                $timeout(function() {
                    var config = $parse(iAttrs.config)($scope);

                    config.func = function (chart1) {
                        chart = chart1;
                    }

                    iElm.on('mousewheel', function(e) {
                        handler.zoom(e.deltaY);
                    });
                    

                    // OLD: Zoom In/Out
                    //
                    // var setZoom = function(delta) {
                    //     if(!chart) return;

                    //     var xMin = chart.xAxis[0].getExtremes().min;
                    //     var xMax = chart.xAxis[0].getExtremes().max;
                    //     var xdMin = chart.xAxis[0].getExtremes().dataMin;
                    //     var xdMax = chart.xAxis[0].getExtremes().dataMax;
                    //     var yMin = chart.yAxis[0].getExtremes().dataMin;
                    //     var yMax = chart.yAxis[0].getExtremes().dataMax;
                       
                    //     newMin = xMin;
                    //     newMax = xMax;

                    //     var diff = xMax - xMin;
                    //     var diffData = xdMax - xdMin;

                    //     if(delta > 0)
                    //     {
                    //         //zoomin
                    //         if(diff > diffData * .1)
                    //         {
                    //             newMin = xMin + diff * .1; //moment(xMin).add(1, 'month').valueOf();
                    //             newMax = xMax - diff * .1; //moment(xMax).subtract(1, 'month').valueOf();
                    //         }
                    //     }
                    //     else
                    //     {
                    //         //zoomout
                    //         if(diff < diffData)
                    //         {
                    //             newMin = xMin - diff * .1; //moment(xMin).add(1, 'month').valueOf();
                    //             newMax = xMax + diff * .1; //moment(xMax).subtract(1, 'month').valueOf();
                    //         }
                    //     }

                    //     // horizontal panning
                    //     chart.xAxis[0].setExtremes(newMin, newMax);
                        
                    //     // vertical panning
                    //     //chart.yAxis[0].setExtremes(yMin + (1 - zoomRatio) * yMax, yMax * zoomRatio);
                    // };




                    //
                    // OLD: Old panning implementation version
                    //      using hammerjs now to support touch gestures
                    // 
                    // 
                    //  var newMin = 0;
                    //  var newMax = 0;
                    //
                    // iElm.bind('mousedown', function(e) {
                    //     mouseDown = 1;
                    // });

                    // iElm.bind('mouseup', function(e) {
                    //     mouseDown = 0;
                    // });
                    //
                    // iElm.bind('mousemove', function(e) {
                    //     if(!chart) return;
                    //     return;
                    //     if (mouseDown == 1) {

                    //         var xExtremes = chart.xAxis[0].getExtremes();
                    //         var range = xExtremes.max - xExtremes.min;
                    //         var step = range * .05;

                    //         // left and right 

                    //         if (e.pageX > lastX) {

                    //             // tap slide right

                    //             // limit to START of data

                    //             var newMin = xExtremes.dataMin < xExtremes.min - step ? xExtremes.min - step : xExtremes.dataMin;
                    //             var newMax = xExtremes.dataMin < xExtremes.min - step ? xExtremes.max - step : xExtremes.dataMin + range;

                    //             $scope.$apply(function(){
                    //                 chart.xAxis[0].setExtremes(newMin, newMax);
                    //             })
                    //         }
                    //         else if (e.pageX < lastX) {

                    //             // tap slide left

                    //             // limit to END of data

                    //             var newMin = xExtremes.dataMax > xExtremes.max + step ? xExtremes.min + step : xExtremes.dataMax - range;
                    //             var newMax = xExtremes.dataMax > xExtremes.max + step ? xExtremes.max + step : xExtremes.dataMax;

                    //             $scope.$apply(function(){
                    //                 chart.xAxis[0].setExtremes(newMin, newMax);
                    //             });

                    //         }

                    //         // up and down 

                    //         if (e.pageY > lastY) {
                    //             var ydiff = 1 * (e.pageY - lastY);
                    //             var yExtremes = chart.yAxis[0].getExtremes();
                    //             $scope.$apply(function(){
                    //                 chart.yAxis[0].setExtremes(yExtremes.min + ydiff, yExtremes.max + ydiff);
                    //             });
                    //         }
                    //         else if (e.pageY < lastY) {
                    //             var ydiff = 1 * (lastY - e.pageY);
                    //             var yExtremes = chart.yAxis[0].getExtremes();
                    //             $scope.$apply(function(){
                    //                 chart.yAxis[0].setExtremes(yExtremes.min - ydiff, yExtremes.max - ydiff);
                    //             });
                    //         }
                    //     }
                    //     lastX = e.pageX;
                    //     lastY = e.pageY;
                    // }); // -- mousemove

                }); // -- timeout

            }
        };
    }]);

    // (function(H) {
    //     H.wrap(H.Chart.prototype.initReflow = function () {
    //         var chart = this;
            
    //         var redraw = function (e) {
    //             if(chart && chart.options) {
    //                 setTimeout(function(){
    //                     chart.reflow(e);
    //                     chart.redraw(e);
    //                 });
    //             }
    //         };


    //         H.addEvent(window, 'resize', redraw);
    //         H.addEvent(chart, 'destroy', function () {
    //             H.removeEvent(window, 'resize', redraw);
    //         });
    //     });
    // })(Highcharts)