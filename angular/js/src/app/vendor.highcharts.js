require('highchartsng');
var Highcharts = require('Highcharts');
require('Highcharts3D')
var HighchartsAdapter = require('HighchartsAdapter');
var HighchartsMore = require('HighchartsMore');
var HighchartsSolidGauge = require('HighchartsSolidGauge');
require('HighchartsHeatmap');
require('HighchartsBoost');


// Highcharts global configuration

Highcharts.theme = {
    global: {
            /**
             * Use moment-timezone.js to return the timezone offset for individual
             * timestamps, used in the X axis labels and the tooltip header.
             */
            getTimezoneOffset: function (timestamp) {
                return -480;// +8 time zone
            }
    },
    //colors: ['#856CA3', '#5793F3', '#9EDA18', '#FFE519', '#FD9C35', '#DD4444', '#BD3B47', '#DD4D79'],
    colors: ['#856CA3', '#5793F3', '#9EDA18', '#ffcc00', '#FD9C35', '#DD4444', '#BD3B47', '#DD4D79'],
    chart: {
        backgroundColor: null,
        style: {
            fontFamily: "Dosis, sans-serif"
        }
    },
    title: {
        style: {
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
        }
    },
    tooltip: {
        borderWidth: 0,
        backgroundColor: 'rgba(219,219,216,0.8)',
        shadow: false
    },
    legend: {
        itemStyle: {
            fontWeight: 'bold',
            fontSize: '13px'
        }
    },
    xAxis: {
        gridLineWidth: 1,
        labels: {
            style: {
                fontSize: '12px'
            }
        }
    },
    yAxis: {
        minorTickInterval: 'auto',
        title: {
            style: {
                textTransform: 'uppercase'
            }
        },
        labels: {
            style: {
                fontSize: '12px'
            }
        }
    },
    plotOptions: {
        candlestick: {
            lineColor: '#404048'
        },
        // series:{
        //  cropThreshold
        // }
    },

    lang: {
        resetZoom: ''
    },
    // General
    background2: '#F0F0EA'

};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);    



    /**
     * This plugin extends Highcharts in two ways:
     * - Use HTML5 canvas instead of SVG for rendering of the heatmap squares. Canvas
     *   outperforms SVG when it comes to thousands of single shapes.
     * - Add a K-D-tree to find the nearest point on mouse move. Since we no longer have SVG shapes
     *   to capture mouseovers, we need another way of detecting hover points for the tooltip.
     */
    (function (H) {
        var Series = H.Series,
            each = H.each;

        /**
         * Create a hidden canvas to draw the graph on. The contents is later copied over
         * to an SVG image element.
         */
        Series.prototype.getContext = function () {
            if (!this.canvas) {
                this.canvas = document.createElement('canvas');
                this.canvas.setAttribute('width', this.chart.chartWidth);
                this.canvas.setAttribute('height', this.chart.chartHeight);
                this.image = this.chart.renderer.image('', 0, 0, this.chart.chartWidth, this.chart.chartHeight).add(this.group);
                this.ctx = this.canvas.getContext('2d');
            }
            return this.ctx;
        };

        /**
         * Draw the canvas image inside an SVG image
         */
        Series.prototype.canvasToSVG = function () {
            this.image.attr({ href: this.canvas.toDataURL('image/png') });
        };

        /**
         * Wrap the drawPoints method to draw the points in canvas instead of the slower SVG,
         * that requires one shape each point.
         */
        H.wrap(H.seriesTypes.heatmap.prototype, 'drawPoints', function () {
            var ctx = this.getContext();

            if (ctx) {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                // draw the columns
                each(this.points, function (point) {
                    var plotY = point.plotY,
                        shapeArgs;

                    if (plotY !== undefined && !isNaN(plotY) && point.y !== null) {
                        shapeArgs = point.shapeArgs;

                        ctx.fillStyle = point.pointAttr[''].fill;
                        ctx.fillRect(shapeArgs.x, shapeArgs.y, shapeArgs.width, shapeArgs.height);
                    }
                });

                this.canvasToSVG();

            } else {
                this.chart.showLoading('Your browser doesn\'t support HTML5 canvas, <br>please use a modern browser');

                // Uncomment this to provide low-level (slow) support in oldIE. It will cause script errors on
                // charts with more than a few thousand points.
                 arguments[0].call(this);
            }
        });
        H.seriesTypes.heatmap.prototype.directTouch = false; // Use k-d-tree
    }(Highcharts));







// function handler(event) {
//     var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
//     event = $.event.fix(orgEvent);
//     event.type = "mousewheel";
    
//     // Old school scrollwheel delta
//     if ( event.wheelDelta ) { delta = event.wheelDelta/120; }
//     if ( event.detail     ) { delta = -event.detail/3; }
    
//     // New school multidimensional scroll (touchpads) deltas
//     deltaY = delta;
    
//     // Gecko
//     if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
//         deltaY = 0;
//         deltaX = -1*delta;
//     }
    
//     // Webkit
//     if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
//     if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
//     console.log(delta);
//     console.log(deltaX);
//     console.log(deltaY);

//     // Add event and delta to the front of the arguments
//     args.unshift(event, delta, deltaX, deltaY);
     
//     console.log('args ' , args);
//     console.log('$.event ' , $.event);
//     console.log('$.event.handle ' , $.event.handle);
//     return $.event.handle.apply(this, args);
// }

// $.event.special.mousewheel = {
//     setup: function() {
//         if ( this.addEventListener ) {
//             for ( var i=types.length; i; ) {
//                 this.addEventListener( types[--i], handler, false );
//             }
//         } else {
//             this.onmousewheel = handler;
//         }
//     },
    
//     teardown: function() {
//         if ( this.removeEventListener ) {
//             for ( var i=types.length; i; ) {
//                 this.removeEventListener( types[--i], handler, false );
//             }
//         } else {
//             this.onmousewheel = null;
//         }
//     }
// };

// $.fn.extend({
//     mousewheel: function(fn) {
//         return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
//     },
    
//     unmousewheel: function(fn) {
//         return this.unbind("mousewheel", fn);
//     }
// });


