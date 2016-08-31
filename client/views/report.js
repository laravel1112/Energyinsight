"use strict";
var $ = require('../jquery');
var Backbone= require('../backbone');
var Models = require('../models');
var JST=require('../JST');
var utility=require('../util');
var Highcharts=require('../highstock');
var _=require("underscore");
//var HS=require('highcharts-browserify');
var base=require('./base');
var GraphElements=require('./graphcs.js');

var Sidebar = require('./sidebar.js');


var Panel=base.extend({
    templateName:'report_summary',
    staticTemplate:true,
    initialize:function(options){
        base.prototype.initialize.apply(this, arguments);
        this.sidebar=options.sidebar;
        _.bindAll(this,"updateView");
        this.addHighcharts();
        this.model=new Backbone.Model({title:'核心能耗表现与综述', subtitle:'Core Performance And Summary'});
        if(this.sidebar.selectedBuilding){
            this.render();    
        }else{
            this.clear();
        }
    },
    addHighcharts:function(){

    },
    reRender:function(){
        this.clear();
        this.addHighcharts();
        if(this.sidebar.selectedBuilding)
            this.render();    

    },
    afterRender:function(){
        this.CalculateData().done(this.updateView);
    },
    afterRenderSubviews:function(){
        // After they are all rendered. Now start drawing the highchart stuff.
        // This have to happen AFTER it is added to the window. Because highchart auto resize depend on this element.
        (this.subviews||[]).forEach(function(v){
            if(_.isFunction(v.drawChart)){
                v.drawChart();
            }
        })
    },
    CalculateData:function(){
        return Promise.resolve();
    },
    updateView:function(data){

    }
});

var Summary=Panel.extend({
	templateName:'report_summary',
    staticTemplate:true,
	initialize:function(options){
	    base.prototype.initialize.apply(this, arguments);
        this.sidebar=options.sidebar;
        _.bindAll(this,"updateView");

	    /*
        *
        *
        *   TODO:   DONUT CHART is not longer available in REPORT SUMMARY, use AREA CHART instead
        *           see BASE.HTML for client script and REPORT_SUMMARY.HBS for #AREACHART
        *
        */
        
		// Right now this is static, but it can be saved on server
       // this.addSubview(new GraphElements['Gadget']({model:{},el:''}));
       
        // this.addSubview(new GraphElements['HighchartPanelSmall']({
        //     model:{title:'One day consumption'},
        //     el:'#areaChart1',
        //     chartOptions:{
        //                 chart: {
        //                     type: 'area'
        //                 },
        //                 xAxis: {
        //                     allowDecimals: false,
        //                     labels: {
        //                         formatter: function () {
        //                             return this.value; // clean, unformatted number for year
        //                         }
        //                     },
        //                     lineWidth: 0,
        //                     minorGridLineWidth: 0,
        //                     lineColor: 'transparent',
        //                     minorTickLength: 0,
        //                     tickLength: 0
        //                 },
        //                 title: {
        //                     text: null
        //                 },
        //                 gridLineWidth: 0,
        //                 yAxis: {
        //                     labels: {
        //                         enabled: false,
        //                         formatter: function () {
        //                             return this.value / 1000 + 'kw';
        //                         }
        //                     },
        //                     title: {text: null},
        //                     lineWidth: 0,
        //                     minorGridLineWidth: 0,
        //                     lineColor: 'transparent',
        //                     minorTickLength: 0,
        //                     tickLength: 0
        //                 },
        //                 tooltip: {
        //                     pointFormat: '{series.name} data <b>{point.y:,.0f}</b><br/> in {point.x}'
        //                 },
        //                 plotOptions: {
        //                     area: {
        //                         pointStart: 2000,
        //                         marker: {
        //                             enabled: false,
        //                             symbol: 'circle',
        //                             radius: 2,
        //                             states: {
        //                                 hover: {
        //                                     enabled: true
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 },
        //                 series: [{
        //                     name: 'Sample',
        //                     data: [null, null, null, null, null, 6, 11, 32, 110, 235, 369, 640,
        //                         1005, 1436, 2063, 3057, 4618, 6444, 9822, 15468, 20434, 24126,
        //                         27387, 29459, 31056, 31982, 32040, 31233, 29224, 27342, 26662,
        //                         26956, 27912, 28999, 28965, 27826, 25579, 25722, 24826, 24605,
        //                         24304, 23464, 23708, 24099, 24357, 24237, 24401, 24344, 23586,
        //                         22380, 21004, 17287, 14747, 13076, 12555, 12144, 11009, 10950,
        //                         10871, 10824, 10577, 10527, 10475, 10421, 10358, 10295, 10104]
        //                 }]
        //             }
        // }))
        this.addHighcharts();
        this.model=new Backbone.Model({title:'核心能耗表现与综述', subtitle:'Core Performance And Summary'});
        if(this.sidebar.selectedBuilding){
            this.render();    
        }else{
            this.clear();
        }
	},
    addHighcharts:function(){
        this.addSubview(new GraphElements['HighchartPanelSmall']({
            model:{title:'One day consumption'}, el:'#donutGraph1',chartOptions: {
                chart: {
                    type: 'solidgauge'
                },

                title: null,

                pane: {
                    center: ['50%', '85%'],
                    size: '140%',
                    startAngle: -90,
                    endAngle: 90,
                    background: {
                        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                        innerRadius: '60%',
                        outerRadius: '100%',
                        shape: 'arc'
                    }
                },

                tooltip: {
                    enabled: false
                },

                plotOptions: {
                    solidgauge: {
                        dataLabels: {
                            y: 5,
                            borderWidth: 0,
                            useHTML: true
                        }
                    }
                },

                yAxis: {
                    min: 0,
                    max: 8000,
                    title: {
                        text: '今日能耗',
                        y: -75
                    },
                    stops: [
                        [0.1, '#55BF3B'], // green
                        [0.5, '#DDDF0D'], // yellow
                        [0.9, '#DF5353'] // red
                    ],
                    labels: {
                        y: 16
                    }
                },

                credits: {
                    enabled: false
                },

                series: [{
                    name: 'Consumption',
                    dataLabels: {
                        format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                            ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y:.1f}</span><br/>' +
                               '<span style="font-size:12px;color:silver">kwh</span></div>'
                    }
                }]
            }
        }));
        this.addSubview(new GraphElements['HighchartPanelSmall']({
            model:{title:'One day consumption'}, el:'#donutGraph2',chartOptions: {
                chart: {
                    type: 'solidgauge'
                },

                title: null,

                pane: {
                    center: ['50%', '85%'],
                    size: '140%',
                    startAngle: -90,
                    endAngle: 90,
                    background: {
                        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                        innerRadius: '60%',
                        outerRadius: '100%',
                        shape: 'arc'
                    }
                },

                tooltip: {
                    enabled: false
                },

                plotOptions: {
                    solidgauge: {
                        dataLabels: {
                            y: 5,
                            borderWidth: 0,
                            useHTML: true
                        }
                    }
                },

                yAxis: {
                    min: 0,
                    max: 8000,
                    title: {
                        text: '今日能耗',
                        y: -75
                    },
                    stops: [
                        [0.1, '#55BF3B'], // green
                        [0.5, '#DDDF0D'], // yellow
                        [0.9, '#DF5353'] // red
                    ],
                    labels: {
                        y: 16
                    }
                },

                credits: {
                    enabled: false
                },

                series: [{
                    name: 'Consumption',
                    dataLabels: {
                        format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                            ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y:.1f}</span><br/>' +
                               '<span style="font-size:12px;color:silver">kwh</span></div>'
                    }
                }]
            }
        }));
    },
    CalculateData:function(){
        var self=this;
        if(this.sidebar.selectedBuilding){
            var building=this.sidebar.selectedBuilding.id;
            var curtime=new Date();
            var lastmonth=(curtime.getMonth()+11)%12+1;
            var year=lastmonth==12?curtime.getFullYear()-1:curtime.getFullYear();
            var lastMonthStart=new Date(lastmonth+"/01/"+year);
            return utility.ajaxGET("/api/getAllMeters/",{serieName:building,start:lastMonthStart.getTime(),end:curtime.getTime()}).then(function(data){
                data=data[0]||{};
                var points=data.points||[];
                points=points.reverse();
                var lastMonthToday=new Date(lastmonth+"/"+curtime.getDate()+"/"+year);
                var lastWeekStart=new Date(curtime);
                lastWeekStart.setDate(lastWeekStart.getDate()-7);
                var yesterday=new Date(curtime);
                yesterday.setDate(yesterday.getDate()-1);
                var thisMonthStart=new Date((curtime.getMonth()+1)+"/01/"+curtime.getFullYear());

                // Now get the subset of data
                var lastMonthData=utility.timeRange(points,{starttime:lastMonthStart.getTime(),endtime:thisMonthStart.getTime(),sharpTime:true});
                var lastMonthEnergy=utility.getAreaUnderCurve(lastMonthData);
                var lastMonthPeak=utility.getAreaUnderCurve(lastMonthData,{partitions:[{start:8,end:22}]});
                // Last Month Same period compare to this month
                var lastMonthCorespondData=utility.timeRange(points,{starttime:lastMonthStart.getTime(),endtime:lastMonthToday.getTime(),sharpTime:true});
                var lastMonthSamePeriod=utility.getAreaUnderCurve(lastMonthCorespondData);
                var thisMonthSamePeriod=utility.getAreaUnderCurve(utility.timeRange(points,{starttime:thisMonthStart.getTime(),endtime:curtime.getTime()}));
                // Get last week, 5 business days energy
                var lastWeekData=utility.timeRange(points,{starttime:lastWeekStart.getTime(),endtime:curtime.getTime(),sharpTime:true});
                var lastWeekEnergy=utility.getAreaUnderCurve(lastWeekData,{weekdaysOnly:true});
                var lastWeekPeak=utility.getAreaUnderCurve(lastWeekData,{weekdaysOnly:true,partitions:[{start:8,end:22}]})[0];
                // Get Yesterday energy
                var yesterdayData=utility.timeRange(lastWeekData,{starttime:yesterday.getTime(),endtime:yesterday.getTime(),sharpTime:true})
                var yesterdayEnergy=utility.getAreaUnderCurve(yesterdayData);
                var yesterdayPeak=utility.getAreaUnderCurve(yesterdayData,{partitions:[{start:8,end:22}]})[0];
                // Get Today energy
                var todayData=utility.timeRange(lastWeekData,{starttime:curtime.getTime(),endtime:curtime.getTime(),sharpTime:true});
                var todayEnergy=utility.getAreaUnderCurve(todayEnergy);
                var todayPeak=utility.getAreaUnderCurve(todayEnergy,{partitions:[{start:8,end:22}]})[0];
                return Promise.resolve({
                    lastMonthEnergy:lastMonthEnergy,
                    lastMonthPeak:lastMonthPeak,
                    lastMonthCompare:(thisMonthSamePeriod/lastMonthSamePeriod-1),
                    thisMonthSamePeriod:thisMonthSamePeriod,
                    dailyAverage:lastWeekEnergy/5,
                    peakAverage:lastWeekPeak/5,
                    yesterdayEnergy:yesterdayEnergy,
                    yesterdayPeak:yesterdayPeak,
                    todayEnergy:todayEnergy,
                    todayPeak:todayPeak
                })
            });
        }else{
            return Promise.resolve({});
        }
    },
    updateView:function(data){
        this.$('#monthly-total').html((data.thisMonthSamePeriod||0).toFixed(2));
        this.$('#compare-last-month').html((data.lastMonthCompare||0).toFixed(2));
        this.$('#last-month-per-m').html((data.lastMonthEnergy||0).toFixed(2));
        this.$('#last-month-peak').html((data.lastMonthPeak/data.lastMonthEnergy||0).toFixed(2));
        this.$('#yesterday-energy').html((data.yesterdayEnergy||0).toFixed(2)+"kWh");
        this.$('#average-energy').html((data.dailyAverage||0).toFixed(2)+"kWh");
        this.$('#yesterday-peak').html((data.yesterdayPeak||0).toFixed(2)+"kWh");
        this.$('#average-peak').html((data.peakAverage||0).toFixed(2)+"kWh");
        var ch=this.subviews[0].getHighchartObject();
        ch.yAxis[0].setExtremes(null,data.dailyAverage*2||8000);
        ch.series[0].setData([data.todayEnergy]);
        ch=this.subviews[1].getHighchartObject(); // Peak chart
        ch.yAxis[0].setExtremes(null,data.peakAverage*2||8000);
        ch.series[0].setData([data.todayPeak]);
    },
	
});

var Disaggregation=Panel.extend({
    templateName:'report_agg',
    staticTemplate:true,
    initialize:function(options){


        

        Panel.prototype.initialize.apply(this,arguments);
        // Right now this is static, but it can be saved on server 每月能耗趋势图


        this.model=new Backbone.Model({title:'能耗构成解析', subtitle:'Energy Disaggregation'});
        this.render();
    },
    addHighcharts:function(){
        var colors = Highcharts.getOptions().colors,
        categories = ["照明", "取暖", "制冷", "设备", "动力", "其他"],
        data = [{
            y: 15,
            color: colors[0],
            drilldown: {
                name: '1 Subpart1',
                categories: ['室外', ' 室内'],
                data: [4, 11],
                color: colors[0]
            }
        }, {
            y: 13,
            color: colors[1],
            drilldown: {
                name: '2 Subpart1',
                categories: ['蒸汽锅炉', '电取暖'],
                data: [9, 4],
                color: colors[1]
            }
        }, {
            y: 45,
            color: colors[2],
            drilldown: {
                name: '3 Subpart1',
                categories: ['离心机组', '冷水泵', '冷却塔'],
                data: [23, 15, 7],
                color: colors[2]
            }
        }, {
            y: 24,
            color: colors[3],
            drilldown: {
                name: '4 Subpart1',
                categories: ['控制机房', '厨房用电','游泳池','其他'],
                data: [2, 10, 8, 4],
                color: colors[3]
            }
        }, {
            y: 20,
            color: colors[4],
            drilldown: {
                name: '5 Subpart1',
                categories: ['生活水泵', '其他动力'],
                data: [12, 8],
                color: colors[4]
            }
        }, {
            y: 30,
            color: colors[5],
            drilldown: {
                name: '6 Subpart1',
                categories: ['其他用电'],
                data: [30],
                color: colors[5]
            }
        }],

        topLevelData = [],
        subLevelData = [],
        i,
        j,
        dataLen = data.length,
        drillDataLen,
        brightness;


        // Build the data arrays
        for (i = 0; i < dataLen; i += 1) {

            // add browser data
            topLevelData.push({
                name: categories[i],
                y: data[i].y,
                id: i,
                color: data[i].color
            });

            // add version data
            drillDataLen = data[i].drilldown.data.length;
            for (j = 0; j < drillDataLen; j += 1) {
                brightness = 0.2 - (j / drillDataLen) / 5;
                subLevelData.push({
                    name: data[i].drilldown.categories[j],
                    y: data[i].drilldown.data[j],
                    parentId: i,
                    color: Highcharts.Color(data[i].color).brighten(brightness).get()
                });
            }
        }


        this.addSubview(new GraphElements['HighchartGraphPanel']({model:{title:'能耗分解'},el:'#graph1',chartOptions:{
            chart: {
                type: 'pie'
            },

            title: {
                text: ''
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    innerSize: 0,
                    depth: 45,
                    allowPointSelect: false,
                    cursor: 'pointer',
                    showInLegend: true
                },
                series: {

                    point: {
                        events: {
                            legendItemClick: function () {
                                var id = this.id;
                                var data = this.series.chart.series[1].data;
                                $.each(data, function (i, point) {

                                    if (point.parentId == id) {
                                        if(point.visible)
                                            point.setVisible(false);
                                        else
                                            point.setVisible(true);
                                    }

                                });
                            }
                        }
                    }

                }
            },
            credits: {
                enabled: false
            },
            series: [{
                name: "Source",
                colorByPoint: true,
                size: '60%',
                data: topLevelData,
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    color: 'white',
                    distance: -49
                }
            },{
                name: "Sub-source",
                colorByPoint: true,
                size: '80%',
                innerSize: '60%',
                data: subLevelData,
                showInLegend: false
            }]
        }}));
    },
});


var ConsumptionTrends=Panel.extend({
	templateName:'report_consumptionTrends',
    staticTemplate:true,
	initialize:function(options){
        Panel.prototype.initialize.apply(this,arguments);
		// Right now this is static, but it can be saved on server
        this.model=new Backbone.Model({title:'各项能耗每月与月内趋势分析', subtitle:'Energy Usage Percentage Trend'});
        this.render();
	},
    addHighcharts:function(){
        this.addSubview(new GraphElements['HighchartGraphPanel']({model:{title:'每月能耗分解趋势图'},el:'#graph1',chartOptions:{
            chart: {
                type: 'column'
            },
            title: {
                text: '_',
                style: {'color': 'white'}
            },
            xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            yAxis: {
                title: {
                    text: '占总能耗%'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }],
                min: 0,
                max: 100
            },
            tooltip: {
                valueSuffix: '%'
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                borderWidth: 0
            },
             plotOptions: {
                column: {
                    stacking: 'percent'
                    //dataLabels: {
                    //    enabled: true,
                    //    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                    //    style: {
                    //        textShadow: '0 0 3px black'
                    //    }
                    //}
                }
            },
            series: [{
                name: '照明',
                data: [15.16,17.00,17.46,17.12,19.29,12.42,13.22,18.95,16.95,14.42,15.71,13.30]
            }, {
                name: '取暖',
                data: [16.69,17.47,18.08,17.95,15.10,22.96,16.56,15.98,16.95,16.41,16.38,17.43]
            }, {
                name: '制冷',
                data: [16.69,17.47,18.58,14.52,17.64,17.75,15.56,16.55,17.29,13.95,16.05,17.09]
            }, {
                name: '设备',
                data: [17.86,13.95,17.71,17.59,17.77,15.14,16.89,13.58,16.15,17.47,13.90,15.94]
            }, {
                name: '动力',
                data: [14.10,17.47,15.34,16.41,15.10,15.87,18.89,18.95,16.15,19.93,18.76,17.20]
            }, {
                name: '其他',
                data: [19.51,16.65,12.84,16.41,15.10,15.87,18.89,15.98,16.50,17.82,19.21,19.04]
            }],

            credits: {
                enabled: false
            }
        }}));

        this.addSubview(new GraphElements['HighchartGraphPanel']({model:{title:'每月能耗分解趋势图'},el:'#graph2',chartOptions:{
            chart: {
                type: 'area'
            },
            title: {
                text: '_',
                style: {'color': 'white'}
            },
            xAxis: {
                categories: ['1', '2', '3', '4', '5', '6',
                '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18',
                '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30']
            },
            yAxis: {
                title: {
                    text: '占总能耗%'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }],
                min: 0,
                max: 100
            },
            tooltip: {
                valueSuffix: '%'
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                borderWidth: 0
            },
             plotOptions: {
                area: {
                    stacking: 'percent',
                    lineWidth: 0,
                    marker: {
                        enabled: false
                    }
                }
            },
            series: [{
                name: '照明',
                data: [19.20,17.02,17.41,19.64,17.90,16.01,15.64,16.89,18.87,16.90,16.55,14.95,17.48,14.91,16.56,16.83,16.86,15.17,17.83,16.58,20.16,17.34,18.63,15.38,19.69,18.42,20.49,11.95,13.06,13.91,12.29]
            }, {
                name: '取暖',
                data: [17.20,19.00,19.92,18.27,16.02,13.57,16.62,16.49,14.51,18.17,18.50,17.63,17.91,15.18,16.43,19.72,19.48,16.59,15.60,21.59,17.64,19.35,21.31,21.31,18.77,18.42,17.05,17.78,15.07,17.39,17.20]
            }, {
                name: '制冷',
                data: [14.90,14.44,16.57,16.76,14.80,18.31,17.46,19.32,17.55,15.50,16.55,14.95,17.05,16.53,14.72,17.24,18.33,19.75,19.92,14.16,15.28,14.71,14.75,13.14,14.92,15.63,17.05,18.22,19.25,18.50,18.28]
            }, {
                name: '设备',
                data: [16.28,18.09,16.99,15.11,16.02,19.46,17.46,15.14,16.49,18.17,18.50,17.21,15.76,17.07,16.03,14.21,15.71,20.22,19.92,14.16,15.28,14.71,14.75,15.87,12.62,15.95,13.61,17.35,16.82,19.89,20.43]
            }, {
                name: '动力',
                data: [17.20,19.00,15.60,17.17,19.25,17.03,17.46,15.14,16.49,18.17,16.55,17.21,15.76,19.38,17.48,13.66,13.42,15.32,13.23,17.10,12.91,15.02,14.16,19.07,18.77,18.09,17.91,20.85,17.90,16.55,12.60]
            }, {
                name: '其他',
                data: [15.21,12.46,13.51,13.05,16.02,15.62,15.36,17.03,16.09,13.09,13.35,18.05,16.05,16.94,18.79,18.34,16.20,12.95,13.51,16.41,18.74,18.89,16.39,15.22,15.23,13.49,13.90,13.85,17.90,13.77,19.20]
            }],
            credits: {
                enabled: false
            }
        }}));
    }
});


var Monthly=Panel.extend({
    templateName:'report_monthly',
    staticTemplate:true,
    initialize:function(options){
        Panel.prototype.initialize.apply(this,arguments);
 

        this.model=new Backbone.Model({title:'全年各项能耗总计分析', subtitle:'Annual Energy Consumption'});
        this.render();


    },
    addHighcharts:function(){
        this.addSubview(new GraphElements['HighchartGraphPanel']({
            model:{title:'每月能耗趋势图'},
            el:'#graph1',
            chartOptions:{
                chart: {
                    alignTicks: false
                },
                title: {
                    text: '_',
                    style: {'color': 'white'}
                },
                xAxis: {
                    categories: ['Aug 2014', 'Sep 2014', 'Oct 2014', 'Nov 2014', 'Dec 2014',
                        'Jan 2015', 'Feb 2015', 'Mar 2015', 'Apr 2015', 'May 2015', 'June 2015', 'July 2015']
                },

                yAxis: [{ // Primary yAxis
                    labels: {
                        format: '{value}°C',
                        style: {
                            color: '#2C5384'
                        }
                    },
                    title: {
                        text: '平均温度',
                        style: {
                            color: '#2C5384'
                        }
                    },
                    opposite: true,
                    min: 0,
                    max: 40,
                    tickInterval: 5

                }, { // Secondary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: '总用电量',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        format: '{value} MWh',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    }

                }, { // Tertiary yAxis
                    gridLineWidth: 0,
                    title: {
                        text: '空气湿度',
                        style: {
                            color: '#C0504D'
                        }
                    },
                    labels: {
                        format: '{value} ％',
                        style: {
                            color: '#C0504D'
                        }
                    },
                    opposite: true,
                    min: 20,
                    tickInterval:10
                }],
                tooltip: {
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
                    shared: true
                },
                plotOptions: {
                    column: {
                        stacking: 'normal'
                    }
                },
                credits: {
                    enabled: false
                },
                series: [{
                        type: 'column',
                        name: '照明',
                        data: [70, 110, 95, 90, 80, 100, 120, 90, 95, 90, 120, 110],
                        yAxis: 1
                }, {
                    type: 'column',
                    name: '取暖',
                    data: [110, 100, 70, 110, 140, 200, 190, 125, 90, 120, 115, 105],
                    yAxis: 1
                }, {
                    type: 'column',
                    name: '制冷',
                    data: [300, 290, 210, 120, 94, 10, 20, 30, 95, 120, 220, 245],
                    yAxis: 1
                }, {
                    type: 'column',
                    name: '设备',
                    data: [130, 90, 90, 95, 90, 80, 95, 90, 120, 110, 105, 90],
                    yAxis: 1
                }, {
                    type: 'column',
                    name: '动力',
                    data: [90, 80, 95, 90, 120, 100, 120, 90, 95, 90, 120, 110],
                    yAxis: 1
                }, {
                    type: 'column',
                    name: '其他',
                    data: [115, 100, 90, 105, 120, 110, 110, 90, 80, 95, 90, 120],
                    yAxis: 1
                }, {
                     name: '空气湿度',
                     type: 'spline',
                     yAxis: 2,
                     data: [68, 65, 55, 54, 49, 42, 46, 38, 49, 55, 64, 61],
                     marker: {
                        enabled: false
                     },
                     dashStyle: 'shortdot',
                     tooltip: {
                        valueSuffix: ' mb'
                     },
                     showInLegend: false,
                     color: '#C0504D'
                }, {
                    name: '室外温度',
                    type: 'spline',
                    data: [31.7, 29.5, 27.5, 20.1, 14.2, 12.5, 14.5, 19.8, 24.2, 29.1, 30.5, 33.1],
                    tooltip: {
                        valueSuffix: ' °C'
                    },
                    showInLegend: false,
                    color: '#2C5384'
                }]
            }
        }));
    }
});
var Trend=Panel.extend({
	templateName:'report_trend',
    staticTemplate:true,
    initialize:function(options){
		Panel.prototype.initialize.apply(this,arguments);
		// Right now this is static, but it can be saved on server 每月能耗趋势图
		this.model=new Backbone.Model({title:'能耗趋势与外部因素分析', subtitle:'Daily Energy Consumption and External Factors'});
		this.render();
	},
    addHighcharts:function(){
        this.addSubview(new GraphElements['HighchartGraphPanel']({model:{title:'每日能耗趋势图'},el:'#graph2',chartOptions:{
            chart: {
                alignTicks: false
            },
            title: {
                text: '_',
                style: {'color': 'white'}
            },
            xAxis: {
                categories: ['1', '2', '3', '4', '5','6', '7', '8', '9', '10', '11', '12', '13', '14', '15',
                '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30']
            },
            //yAxis: {
            //    min: 0,
            //    title: {
            //        text: '能耗 （kWh）'
            //    }
            //},
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}°C',
                    style: {
                        color: '#2C5384'
                    }
                },
                title: {
                    text: '平均温度',
                    style: {
                        color: '#2C5384'
                    }
                },
                opposite: true,
                min: 0,
                max: 40,
                tickInterval: 5

            }, { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: '总用电量',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: '{value} kWh',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                }

            }, { // Tertiary yAxis
                gridLineWidth: 0,
                title: {
                    text: '空气湿度',
                    style: {
                        color: '#C0504D'
                    }
                },
                labels: {
                    format: '{value} ％',
                    style: {
                        color: '#C0504D'
                    }
                },
                opposite: true,
                min: 0,
                max: 90,
                tickInterval: 5
            }],
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
                shared: true
            },
            plotOptions: {
                area: {
                    stacking: 'normal',
                    lineWidth: 0,
                    marker: {
                        enabled: false
                    }
                }
            },
            credits: {
                enabled: false
            },
            series: [{
                type: 'area',
                name: '照明',
                data: [70, 110, 95, 90, 80, 100, 120, 90, 95, 90, 120, 110, 105, 90, 120, 115, 105, 105, 125, 90, 120, 110, 140, 140, 115, 105, 125, 90, 120, 90],
                yAxis: 1
            }, {
                type: 'area',
                name: '取暖',
                data: [110, 100, 70, 110, 140, 200, 190, 125, 90, 120, 115, 105, 125, 90, 120, 110, 140, 140, 200, 190, 125, 90, 120, 115, 120, 115, 105, 125, 90, 120],
                yAxis: 1
            }, {
                type: 'area',
                name: '制冷',
                data: [300, 290, 210, 120, 94, 10, 20, 30, 95, 120, 220, 245, 190, 125, 90, 120, 115, 105, 125, 90, 120, 95, 120, 220, 245, 190, 125, 90, 120, 110],
                yAxis: 1
            }, {
                type: 'area',
                name: '设备',
                data: [130, 90, 90, 95, 90, 80, 95, 90, 120, 110, 105, 90, 120, 115, 105, 125, 90, 120, 110, 140, 140, 170, 120, 115, 105, 125, 105, 90, 120, 115],
                yAxis: 1
            }, {
                type: 'area',
                name: '动力',
                data: [90, 80, 95, 90, 120, 100, 120, 90, 95, 90, 120, 110, 100, 120, 90, 95, 120, 110, 105, 90, 120, 115, 105, 125, 90, 120, 115, 105, 125, 95],
                yAxis: 1
            }, {
                type: 'area',
                name: '其他',
                data: [115, 100, 90, 105, 120, 110, 110, 90, 80, 95, 90, 120, 100, 120, 90, 95, 125, 90, 120, 115, 105, 125, 90, 120, 90, 120, 115, 105, 125, 110],
                yAxis: 1
            },

             {
                 name: '空气湿度',
                 type: 'spline',
                 yAxis: 2,
                 data: [
                     {
                         y: 71,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/snow.png)'
                         }
                     }, 72,

                     {
                         y: 67,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/sun.png)'
                         }
                     }, 69,
                     {
                         y: 65,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/sun.png)'
                         }
                     },64,
                     {
                         y: 63,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/sun.png)'
                         }
                     }, 69,
                     {
                         y: 73,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/snow.png)'
                         }
                     }, 74,
                     {
                         y: 75,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/snow.png)'
                         }
                     }, 71,
                     {
                         y: 68,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/snow.png)'
                         }
                     }, 64,
                     {
                         y: 64,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/sun.png)'
                         }
                     }, 62,
                     {
                         y: 65,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/sun.png)'
                         }
                     }, 64,
                     {
                         y: 63,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/sun.png)'
                         }
                     }, 63,
                     {
                         y: 62,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/sun.png)'
                         }
                     },71,
                     {
                         y: 72,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/snow.png)'
                         }
                     },75,
                     {
                         y: 77,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/snow.png)'
                         }
                     },75,
                     {
                         y: 76,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/snow.png)'
                         }
                     }, 74,
                     {
                         y: 71,
                         marker: {
                             symbol: 'url(http://www.highcharts.com/demo/gfx/sun.png)'
                         }
                     }, 68],
                 marker: {
                    enabled: true
                 },
                 dashStyle: 'shortdot',
                 tooltip: {
                    valueSuffix: ' mb'
                 },
                 showInLegend: false,
                 color: '#C0504D'

            },
            {
                name: '室外温度',
                type: 'spline',
                data: [32.7, 31.5, 32.5, 33.1, 34.2, 34.5, 35.5, 31.8, 27.2, 26.1, 23.5, 28.1, 32.4, 31.5, 30.5, 31.8, 31.2, 34.1, 35.3, 37.1, 35.5, 28.1, 26.2, 25.5, 24.5, 25.8, 29.2, 31.1, 30.5, 31.8],
                tooltip: {
                    valueSuffix: ' °C'
                },
                 marker: {
                    symbol: 'diamond'
                },
                showInLegend: false,
                color: '#2C5384'
            }
            ]
        }}));
    }
});
var Recommendation=Panel.extend({
	templateName:'report_recommendation',
	initialize:function(options){
		Panel.prototype.initialize.apply(this,arguments);
		// Right now this is static, but it can be saved on server 每月能耗趋势图
		this.model=new Backbone.Model({title:'节能建议与策划', subtitle:'Optimization and Recommendation'});
		this.render();
        this.$('#table1').dataTable( {
            responsive: true,
            paging: true,
            searching: false,
            bInfo: true,
            bSort : false,
            orderMulti: true
        });
	},
});
var Regular=Panel.extend({
    staticTemplate:true,
    templateName:'report_section',
	initialize:function(options){
		Panel.prototype.initialize.apply(this,arguments);
		this.model=new Backbone.Model({title:'常轨能耗指标分析', subtitle:'Energy Efficiency and Metrics'});
		this.render();
	},
    addHighcharts:function(){
        this.addSubview(new GraphElements['HighchartGraphPanel']({model:{title:'能耗效率'},el:'#graph1',chartOptions:{
            chart: {
                type: 'column'
            },
            title: {
                text: '能源效率历史表现'
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec'
                ],
                crosshair: true
            },
            yAxis: {
                min: 0,
                title: {
                    text: '能源效率'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                name: '我的企业',
                data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

            }, {
                name: '行业同等',
                data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]

            }, {
                name: '优质企业',
                data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0, 59.6, 52.4, 65.2, 59.3, 51.2]

            }]
        }}));
        this.addSubview(new GraphElements['Timeline']({model:{title:'节能指标发展进度'},class:'col-lg-4'}));
    }
});





var MenuViews={
	'summary':Summary,
    'disagg':Disaggregation,
	'monthly':Monthly,
	'trend':Trend,
	'recom':Recommendation,
	'regular':Regular


}

//TODO: extend it to support leading icons
var ReportTitle={
	'summary':'综述指标',
    'disagg':'能耗构成',
	'monthly':'历史比较',
	'trend':'月内趋势',
	'regular':'能耗对比',
    //'recom':'节能建议'

}
var ReportView=base.extend({
    defaultView:'summary',
 	templateName:'report',
	initialize: function (options) {

        $(".settings-content").removeClass('active');
		this.render();
		this.sidebar = new Sidebar({
			el: '.settings-sidebar',
			submenu:'report',
			MenuViews:MenuViews,
			MenuTitle:ReportTitle
		});
		this.sidebar.render();
        if(!options.pane){
            Equota.router.navigate('report/'+this.defaultView+'/',{trigger:false,replace:true});
            this.changePane(this.defaultView);
        }else{
            this.changePane(options.pane);
        }
		// this.listenTo(Equota.router, 'route:report', this.changePane);
	},
	changePane: function (pane) {
		if (!pane) {
			return;
        }
		this.sidebar.showContent(pane);
	},
});

module.exports=ReportView;
