"use strict";
var $ = require('../jquery');
var Backbone= require('../backbone');
var Models = require('../models');
var JST=require('../JST');
var utility=require('../util');
//var CryptoJS=window.CryptoJS = require('browserify-cryptojs');
//require('browserify-cryptojs/components/md5');
var Highcharts=require('../highstock');
var _=require("underscore");
var base=require('./base');
var GraphElements=require('./graphcs.js');
var BaiduAPI=require('../BDMap')({ak:"KRNQDv3desnEOULRaeOsmyvI"});

var table=base.extend({ // This will later be organized to modular. For not it is only used in home page
	templateName:'table',
	initialize:function(options){
		_.bindAll(this,'reRender');
		this.setElement(options.el);
		this.collection=new Models.Collections.SimpleCollection([],{url:'/api/energyunit/?format=json'});
		this.collection.on('update',this.reRender);
		this.collection.fetch();
	},
	afterRender:function(){

	    var myTable = $('#infoTableRightTop').dataTable({
	        scrollY: "200px",
            responsive: true,
			paging: false,
			searching: false,
			bInfo: false,
			bSort: true,
			orderMulti: true,
			bDeferRender: true,
			fnInitComplete: function (o) {
			    // Immediately scroll to row 1000
			}
	    });

	    var tableHeadHeight = $('.dataTables_scrollHead').find('th label').outerHeight();
	    var newHeight = $('#infoTableRightTop').closest('.table-div').innerHeight() - tableHeadHeight; //WARNING: 
	    $("#infoTableRightTop_wrapper .dataTables_scrollBody").height(newHeight);
	    myTable.fnSettings().oScroll.sY = newHeight + 'px';
	    myTable.fnDraw();
	    //myTable.fnSettings().oScroller.fnMeasure();


	},

	templateData:function(){
		if (this.collection) {
			var toReturn=_.filter(this.collection.toJSON(),function(e){ return e.type==1});
			return toReturn;
		}
		return {};
	},

	reRender:function(){
		this.render();
	},

})

var headline=base.extend({
	templateName:'home_carousel',
	initialize:function(options){
		_.bindAll(this,'reRender','refetch');
		this.setElement(options.el);
		this.collection=new Models.Collections.SimpleCollection([],{url:'/api/events/'});
		this.collection.on('update',this.reRender);
		//this.collection.fetch();
		// This is static right now. until the api function is made
		// this.collection.add([
		// 	{name:'user.demouser.CampusBBB.Building006',value:'购物中心六号楼当日用电超出预期12%',x:1438405560000},
		// 	{name:'user.demouser.CampusBBB.Building006',value:'购物中心六号楼仪表异常报错',x:1438506760000},
		// 	{name:'enernoc_10',value:'商业中心十号楼峰值用电预警',x:1438605760000},
		// 	{name:'enernoc_12',value:'服务企业十二号楼制冷系统需要定期维护',x:1438705860000},
		// 	{name:'enernoc_109',value:'学校109教学楼夜间用电超出预定值',x:1438805960000},
		// 	]);
	},
	refetch:function(buildingCollection){
		var meters=_.pluck(_.filter(buildingCollection.toJSON(),function(i){
			return i.type==3&&(i.eventseries||"")!=""; 
		}),"eventseries").join(",");
		this.collection.setGetParameter({format:"json",limit:"5",seriesName:meters});
		this.collection.fetch();
	},
	reRender:function(){// Now the collection have influxdb event key, get these events

		this.render();
	},
	templateData:function(){
		var first=true;
		if (this.collection) {
			var toReturn=_.map(this.collection.toJSON(),function(e){
			    e.date=new Date(e.time).toDateString();
			    if(first==true){
			    	e.active=true;
			    	first=false;
			    }else{
			    	e.active=false;
			    }
			    return e
			});
			return toReturn;
		}
		return {};
	},
	afterRender:function(){
		this.$el.carousel("pause").removeData();
		this.$el.carousel();
	}
})

module.exports=base.extend({
 	templateName:'home',
 	staticTemplate:true,
	initialize: function (options) {
		_.bindAll(this,'drawBuilding');
		this.setElement(options.el);
		// this.addSubview(new GraphElements['HighchartPanelSmall2']({model:{title:''},el:'#chart',chartOptions:{
		// 	chart: {
		// 		type: 'bar',
  //               style: {
		// 			fontFamily: 'Open Sans'
		// 		}
		// 	},
		// 	title: {
		// 		text: '主要楼宇能耗开销百分比',
  //               style: {
		// 			color: '#13843C',
		// 			fontWeight: 'bold'
		// 		}
		// 	},

		// 	xAxis: {
		// 		categories: ['商业一号楼', '商业二号楼', '三号楼', '教育楼宇100','A区五号楼', '教学楼111'],
		// 		title: {
		// 			text: null
		// 		}
		// 	},
		// 	yAxis: {
		// 		min : 0,
		// 		max : 100,
		// 		title: {
		// 			text: '',
		// 			align: 'high'
		// 		},
		// 		labels: {
		// 			overflow: 'justify'
		// 		}
		// 	},
		// 	tooltip: {
		// 		valueSuffix: '%'
		// 	},
		// 	plotOptions: {
		// 		bar: {
		// 			dataLabels: {
		// 				enabled: true
		// 			}
		// 		},
		// 		series: {
		// 			pointWidth: 20,
  //                   pointPadding: 22,
		// 			lineWidth: 1
		// 		}
		// 	},

		// 	legend : {
		// 		enabled : false
		// 	},
		// 	credits: {
		// 		enabled: false
		// 	},
		// 	series: [{
		// 		data: [{y:30, color: '#87C359'}, {y:34, color: '#87C359'}, {y:36, color: '#87C359'},
		// 			{y:40, color: '#d9534f'}, {y:54, color: '#d9534f'}, {y:59, color: '#d9534f'}],

		// 		dataLabels: {
  //                   enabled: true,
  //                   format: '{y} %'

  //               }
		// 	}]
		// }}))
		this.addSubview(new GraphElements['HighchartPanelSmall2']({model:{title:''},el:'#chart',chartOptions:{
			chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: 0,
                            plotShadow: false
                        },
                        title: {
                            text: '69%',
                            align: 'center',
                            verticalAlign: 'middle',
                            style: { fontSize: "40px", fontWeight: 'bold' },
                            x: -115,
                            y: 15
                        },
                        tooltip: {
                            pointFormat: '<b>{point.percentage:.1f}%</b>'
                        },
                        legend: {
                            enabled: true,
                            layout: 'vertical',
                            align: 'right',
                            width: 220,
                            verticalAlign: 'middle',
                            itemMarginBottom: 20,
                            borderWidth: 0,
                            useHTML: true,
                            title: {
                                style: {
                                    fontWeight: 'bold'
                                }
                            }
                        },
                        plotOptions: {
                            pie: {
                                showInLegend: true,
                                dataLabels: {
                                    enabled: false,
                                    distance: -50,
                                    style: {
                                        fontWeight: 'bold',
                                        color: 'white',
                                        textShadow: '0px 1px 2px black'
                                    }
                                },
                                center: ['50%', '50%']
                            }
                        },
                        series: [
                            {
                                type: 'pie',
                                innerSize: '50%',
                                data: [
                                    ['A区一号楼', 69],
                                    ['A区二号楼', 21],
                                    ['A区三号楼', 10]
                                ]
                            }
                        ]
		}}))
		this.render();
	},
	afterRender:function(){
		var promise=Promise.defer();
		this.ready=promise.promise;
		var self=this;
		window.InitializeBDMap=function(){
			promise.resolve({});
		}
		$.getScript("http://api.map.baidu.com/api?v=2.0&ak=KRNQDv3desnEOULRaeOsmyvI&callback=InitializeBDMap").fail(function(err){
			console.log(err);
		});
		this.potentialView=new table({el:'.indexPageLeftChart'});
		this.headlineView=new headline({el:'#carousel-example-vertical'});
		this.potentialView.collection.on('update',this.drawBuilding);
		this.potentialView.collection.on('update',this.headlineView.refetch);
		// this.$("#carousel-example-vertical").carousel("pause").removeData();
		// this.$("#carousel-example-vertical").carousel();
	},
	createDefaultMap:function(){
		var x = 121.47537;
		var y = 31.232844;
		this.BaiduMap=new BMap.Map("allmap");
		this.BaiduMap.addControl(new BMap.NavigationControl());
		this.BaiduMap.disableScrollWheelZoom();
		this.BaiduMap.centerAndZoom(new BMap.Point(x,y),8)
	},
	drawBuilding:function(collection){
		var self=this;
		this.ready.then(function(){
			var buildings=_.filter(collection.toJSON(),function(b){
				return b['type']==1&&(b['GPSlocation']||"")!="";
			})
			var d=_.pluck(buildings,'GPSlocation').join(";");
			//坐标转换完之后的回调函数
			BaiduAPI.geoconv({from:3,to:5,coords:d,dataType:"jsonp"}).then(function (data){
				//添加谷歌marker和label
				var icon = new BMap.Icon("/static/img/building_icon.png", new BMap.Size(48, 48), {
					anchor: new BMap.Size(10, 30),
					infoWindowAnchor: new BMap.Size(10, 0)
				});
				var widthbound=[999,0];
				var heightbound=[999,0];
				if(buildings.length==data.result.length){
					self.BaiduMap = new BMap.Map("allmap");
					self.BaiduMap.addControl(new BMap.NavigationControl());
					self.BaiduMap.disableScrollWheelZoom();
					for(var i=0;i<buildings.length;i++){
						var e=data.result[i];
						widthbound[1]=Math.max(e.x,widthbound[1]);
						widthbound[0]=Math.min(e.x,widthbound[0]);
						heightbound[0]=Math.min(e.y,heightbound[0]);
						heightbound[1]=Math.max(e.y,heightbound[1]);
						
						var point=new BMap.Point(e.x,e.y);
						var marker = new BMap.Marker(point, {icon: icon});
						self.BaiduMap.addOverlay(marker);
						var label = new BMap.Label(buildings[i].name, {offset:new BMap.Size(0,-20)});
						marker.setLabel(label); //添加百度label

					}
					var center=[(widthbound[1]+widthbound[0])/2,(heightbound[1]+heightbound[0])/2]
					var dif=Math.max(widthbound[1]-widthbound[0],heightbound[1]-heightbound[0],0.1);
					var zoom=Math.floor(9-Math.log(dif)/Math.log(2));
					// self.BaiduMap.addEventListener("tilesloaded",function(){//加载完成时,触发 
					// 	self.BaiduMap.panBy(140,120); 
					// });
					//var cp;
					// self.BaiduMap.addEventListener("dragend", function showInfo(){ //监听中心点位置
					// 	cp = self.BaiduMap.getCenter();
					// 	window.setTimeout(function(){ self.BaiduMap.panTo(new BMap.Point(113.262476, 23.185625)); }, 1000);
					// });
					//self.BaiduMap.panBy(140,120); 
					//window.setTimeout(function(){ self.BaiduMap.panTo(new BMap.Point(113.262476, 23.185625)); }, 2000);
					//self.BaiduMap.setCenter(new BMap.Point(125.47537,31.232844));
					//self.BaiduMap.centerAndZoom(new BMap.Point(121.47537,31.232844), 7);
					//self.BaiduMap.addControl(new BMap.NavigationControl());
				    //self.BaiduMap.disableScrollWheelZoom();
				    console.log(self.BaiduMap);
					self.BaiduMap.centerAndZoom(new BMap.Point(center[0],center[1]), zoom);
					//self.BaiduMap.centerAndZoom(new BMap.Point(121.47537,31.232844), 7);
				}else{
					self.createDefaultMap();
				}
				
				// var markergg = new BMap.Marker(ggPoint, {icon: icon});
				// self.BaiduMap.addOverlay(markergg); //添加谷歌marker
				// var labelgg = new BMap.Label("Building 1", {offset: new BMap.Size(0,-20)});
				// markergg.setLabel(labelgg); //添加谷歌label
				//self.BaiduMap.setCenter(point);
			}).fail(function(err){
				self.createDefaultMap();
			});
		})
	},
	afterRenderSubviews:function(){
		(this.subviews||[]).forEach(function(v){
			if(_.isFunction(v.drawChart)){
				v.$('.chartContainer').css({"height":"300px"})
				v.drawChart();
			}
		})
	}
});
