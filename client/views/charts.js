"use strict";
var $ = require('../jquery');
var Backbone= require('../backbone');
var Models = require('../models');
var JST=require('../JST');
var utility=require('../util');
// var CryptoJS=window.CryptoJS = require('browserify-cryptojs');
// require('browserify-cryptojs/components/md5');
var Highcharts=require('../highstock');
var _=require("underscore");
//var HS=require('highcharts-browserify');
var base=require('./base');

function iconSrc(options){
	var dir="/static/img/";
	var model=options.model;
	switch (model['type']||""){
		case 2: return options.selected==true?dir+"campus-on.png":dir+"campus-off.png";break;
		case 1: return options.selected==true?dir+"building-on.png":dir+"building-off.png";break;
		case 3: return options.selected==true?dir+"meter-on.png":dir+"meter-off.png";break;
		default:return "";
	}
}


var leftSideBar=base.extend({
	templateName:'chart_left',
	initialize:function(options){
		base.prototype.initialize.apply(this,arguments);
		this.centerView=options.centerView;
		_.bindAll(this,'showSerieInfo','unShowSeries','deSelect');
		this.seriesNum=0;
		this.colorHash=[
			{color:'#446e9b',status:false},// red
			{color:'#5cb85c',status:false},//blue
			{color:'#F0AD54',status:false},//green
			{color:'#d9534f',status:false}//yellow
		]
	},
	events:{

	},
	afterRender:function(){ // After the render of the frame, this is automatically called
		var backendUrl = "/api/energyunit/?format=json";
		var self=this;
		// var query = "select id,parentid,display_name,series_name from test_tree_2";
		// utility.ajaxGET(backendUrl,{'q': query}).then(function(data){
		utility.ajaxGET(backendUrl).then(function(data){
			data=data.objects;
			var treeNodes=_.map(data,function(e){
				return {
					id:e.id,
					parent:e.parent||'#',
					text:e.name,
					"a_attr": { "class": "show_tooltip popoverOption",
								"data-content":e.description||"",
								"data-trigger":"hover",
								 "data-placement":"bottom",
								 },
					icon:iconSrc({model:e,selected:false}),
					data:e
				}
			})
			$('#graph-tree').jstree({
				core:{
					themes:{
						name:'proton',
						responsive:true
					},
					data:treeNodes
				},
				"li": {
					"select_limit": 3
				},
				"plugins" : [ "sort" ]
			});	
			$('#graph-tree').on('changed.jstree',self.showSerieInfo);
			$('#graph-tree').on('deselect_all.jstree',self.unShowSeries);
			$('#graph-tree').on('after_open.jstree ready.jstree',function(){
				$('.popoverOption').popover();
			});	
		});
	},
	showSerieInfo:function(e,data){
	//$('#graph-tree').jqxTree('checkItem', e.args.element);
		var self=this;
		var node=data.node;
		var serieName=node.data['influxKey'];
		var event =data.event;
		//
		if(data.action=="select_node"){

			this.seriesNum++;
			if(this.seriesNum>4){
				data.instance.deselect_node(node);
				return;
			}
			data.instance.set_icon(node.id, "/static/img/loading.gif");
			//var colorcode="#" +CryptoJS.MD5(serieName).toString().substring(2,8);
			var availableColor=_.findWhere(this.colorHash,{status:false});;
			availableColor.status=true;
			availableColor.usedOn=node.id;
			var colorcode=availableColor.color;	
			//var colorcode="#" +CryptoJS.MD5(serieName).toString().substring(2,8);
			
			this.centerView.addSerie({color:colorcode,model:node.data}).then(function(){
				data.instance.set_icon(node.id, iconSrc({model:node.data,selected:true}));
				self.$('#'+node.id+"_anchor").css("background",colorcode);
			}).catch(function(err){
				data.instance.set_icon(node.id, iconSrc({model:node.data,selected:false}));
			})
			//  
				// 
			// })
			//  
			// })
		}else if(data.action=="deselect_node"){
			this.deSelect(node,data.instance);
			// this.centerView.removeSerie({item:{value:serieName}});
			// data.instance.set_icon(node.id, "/static/img/building-off.png");
			// self.$('#'+node.id+"_anchor").css("background","");
		}
	},
	unShowSeries:function(e,data){
		var self=this;
		data.node.forEach(function(id){
			self.deSelect(data.instance.get_node(id),data.instance);
		})
	},
	deSelect:function(node,instance){
		this.centerView.removeSerie({model:node.data});
		instance.set_icon(node.id, iconSrc({model:node.data,selected:false}));
		this.$('#'+node.id+"_anchor").css("background","");
		var color=_.findWhere(this.colorHash,{usedOn:node.id});
		if(color){
			color.usedOn="";
			color.status=false; 
		}
		this.seriesNum--;
	},
});
var centerContent=base.extend({
	templateName:'chart_center',
	cache:{},
	initialize:function(options){
		base.prototype.initialize.apply(this,arguments);
		_.bindAll(this,'resetNavigator');
	},
	afterRender:function(){

		//HS.$('#display-chart').highcharts
		this.infoView=new infoView({el:'#bottom_panel'});
		this.t; //This is a time out buffer
		var self=this;
		function afterSetExtremes(e){
			if(self.t){
				clearTimeout(self.t);
				self.t=setTimeout(function(){
					loadData()
				},500);
			}else{
				self.t=setTimeout(function(){
					loadData()
				},500);
			}
			function loadData(){
				self.charts.showLoading('Loading data');
				var promises=_.map(self.charts.series,function(i){
					if(i.name=='Navigator'||(i.options.id||"").indexOf("flag_for_")===0){
						return Promise.resolve({});
					}else{
						return utility.ajaxGET("/api/series/",{serieName:i.options.id,start:Math.round(e.min),end:Math.round(e.max)}).then(function(data){
							data=data[0]||{};
							var points=data.points||[];
							points=points.reverse();
							i.setData(points);
							self.infoView.setData({influxKey:i.options.id,data:points,color:i.color});// Now set the data in infoview. after all are set. Then let infoview to recalculate summary
						});	
					}
				});
				Promise.all(promises).then(function(data){
					self.charts.hideLoading();
					self.infoView.reCalculate();
					var keys=self.infoView.collection.map(function(i){return {event:i.get('eventseries'),origin:i.get('influxKey'),color:i.get('color')}});
					keys=_.filter(keys,function(e){return !!e.event});
					var seriesName=_.pluck(keys,"event").join(",");
					var originSeries=_.pluck(keys,"origin").join(",");
					var colors=_.pluck(keys,"color").join(",");		
					self.rightView.refetch({seriesName:seriesName,origin:originSeries,start:Math.round(e.min),end:Math.round(e.max),color:colors})//setTimeout(function(){
					//	self.rightView.refetch();
					//},500);
					
				})
			}
		}

		// Construct a navigation time
		this.defaultNavigatorData=[];
		var endDate=new Date();
		var startDate=new Date().setYear(endDate.getFullYear()-2); // This is long
		for(var i=startDate;i<endDate.getTime();i+=3600*1000){
			this.defaultNavigatorData.push([i,0]);
		}

		Highcharts.setOptions({global:{useUTC:false}})
		this.charts = new Highcharts.StockChart({

			chart: {
				renderTo : 'display-chart',
				type: 'areaspline',
				style: {
					fontFamily: 'Open Sans'
				}
			},

			title: {
				text: '实时能源数据'
			},
			legend: {
				enabled: false
			},
			navigator:{
				adaptToUpdatedData:false,
				series:{
					name:'Navigator',
					data:this.defaultNavigatorData
				},
				xAxis:{
					ordinal: false,
					type:'datetime',
					min:1378060179517
				}
			},
			rangeSelector: {
				buttons: [
				{
					type: 'day',
					count: 1,
					text: '1d'
				},{
					type: 'week',
					count: 1,
					text: '1w'
				}, {
					type: 'week',
					count: 6,
					text: '6w'
				}, {
					type: 'month',
					count: 1,
					text: '1M'
				},{
					type: 'month',
					count: 3,
					text: '3M'
				},{
					type: 'month',
					count: 6,
					text: '6M'
				},{
					type: 'year',
					count: 1,
					text: '1year'
				},{
					type: 'all',
					text: 'All',
					count: 0
				}],
				selected: 1,
				inputEnabled: true,
				inputDateFormat: '%Y-%m-%d'         
			},
			xAxis:{
				//minRange:3600*1000
				ordinal: false,
				type:'datetime',
				events : {
					afterSetExtremes : afterSetExtremes
				}
			},
			yAxis: {
				title: {
					text: '能耗 (kWh)'
				},
                plotLines: [{
                        value: 0,
                        width: 1,
                        color: 'silver'
				}]
			},
			tooltip: {
				// shared: false,
				valueSuffix: '',
				pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                valueDecimals: 2
			},
			credits: {
				enabled: false
			},
			plotOptions: {
				areaspline: {
					fillOpacity: 0.0
				},
				series: {
					lineWidth:2,
					states:{
						hover:{
							enable:true,
							lineWidth:2
						}
					},
					fillOpacity: 0.1,
					marker: {
						symbol: 'triangle'
					}
				},
				line: {
					marker: {
						symbol: 'triangle'
					},
					gapSize:2
				}

			},
			series:[]
			// chart: {
   //              renderTo: 'display-chart',
   //              type: 'spline'
   //          },
   //           title: {
   //          text: 'Custom tick positions'
   //      },

   //      subtitle: {
   //          text: 'through axis.tickPositions and axis.tickPositioner'
   //      },

   //      xAxis: {
   //      	ordinal: false,
   //          tickPositioner: function () {
   //              var positions = [],
   //                  tick = 1,
   //                  increment = 1;

   //              for (tick; tick - increment <= 8; tick += increment) {
   //                  positions.push(tick);
   //              }
   //              return positions;
   //          },
   //          tickInterval: 1
   //      },

   //      yAxis: {
   //          tickPositioner: function () {
   //              var positions = [],
   //                  tick = Math.floor(this.dataMin),
   //                  increment = Math.ceil((this.dataMax - this.dataMin) / 6);

   //              for (tick; tick - increment <= this.dataMax; tick += increment) {
   //                  positions.push(tick);
   //              }
   //              return positions;
   //          }
   //      },

   //      series: [{
   //          data: [
   //              [0, 1],
   //              [1, 3],
   //              [2, 2],
   //              [4, 4],
   //              [8, 3]
   //          ]
   //      }]
		});
	},
	resetNavigator:function(nav){
		if((this.charts.series||[]).length==1){
			if(nav){
				_.find(this.charts.series,function(i){return i.name=="Navigator"}).update(nav);
			}else{
				_.find(this.charts.series,function(i){return i.name=="Navigator"}).update({data:this.defaultNavigatorData});
			}
		}
	},
	addSerie:function(options){
		// this.$("#infor_panel").html='';
	
		var self=this;
		var model=options.model;

		var influxKey=model['influxKey']||'';
		if(influxKey.length>0){
			//Add it only if it does not exist
			var existserie=_.find(this.charts.series,function(i){return (i.options).id==influxKey});
			if(existserie){
				return  Promise.resolve({});
			}
			// panel_array.push(String(node.value));
			if(this.cache[influxKey]){
				// change the color of the cached series.
				var s=this.cache[influxKey];
				s.color=options.color||"#123456";
				model.data=s.data;
				this.resetNavigator({data:s.data});
				this.charts.addSeries(s);		
				this.infoView.collection.add(model);
				// Reset the extreme to trigger the AfterSetExtreme event
				var s=_.find(self.charts.series,function(i){return (i.options).id==influxKey});
				var ext=s.xAxis.getExtremes();
				s.xAxis.setExtremes(ext.min,ext.max);
				return Promise.resolve({});
			}
			//var test_query="select MEAN(value) from "+item.value+" group by time(100m) where time > now() - 2y";
			//return utility.ajaxGET(backendUrl, {'q': test_query}).then(function(data){
			return utility.ajaxGET("/api/series/",{serieName:influxKey}).then(function(data){
				data=data[0]||{};
				var points=data.points||[];
				points=points.reverse();
				var serie= {
					gapSize: 1,
					id:data.name,
					name:data.name.substring(data.name.lastIndexOf(".")+1),
					// color: "#" + CryptoJS.enc.Hex.stringify(data.name).substring(2, 8),
					color:options.color||'#123467',
					data : points
				}
				self.resetNavigator({data:points});
				model.data=points;
				self.charts.addSeries(serie); //add new serie
				self.infoView.collection.add(model);
				// Reset the extreme to trigger the AfterSetExtreme event
				var s=_.find(self.charts.series,function(i){return (i.options).id==influxKey});
				var ext=s.xAxis.getExtremes();
				s.xAxis.setExtremes(ext.min,ext.max);
				self.cache[influxKey]=serie;
				return Promise.resolve({new:true});
			});          
		}else{
			return Promise.resolve({new:false});
		}
	},

	removeSerie:function(options){
		var model=options.model;
		var series=this.charts.series||[];
		this.infoView.collection.remove(model);
		if(model){
			var toRemove=_.find(series,function(i){return (i.options||{}).id==model['influxKey']})
			if(toRemove) toRemove.remove();
			toRemove=_.find(series,function(i){return (i.options||{}).id=='flag_for_'+model['influxKey']});
			if(toRemove) toRemove.remove();
		}
		//if After remove, there is only navigator. then set it to flat. 
		this.resetNavigator();
		return this;
	},
	displayEvent:function(collection,options){
		var es=collection.toJSON();
		es=_.map(es,function(e){
			return {
				name:e.event_msg,
				id:e.origin,
				title:e.title,
				x: e.time,
			};
		});
		// Array of list of events for each series
		var eventSeries=_.groupBy(es,function(e){return e.id});
		for(var key in eventSeries){
			var flagSerie={
				id:'flag_for_'+key,
				type:'flags',
				onSeries:key,
				shape:'triangle',
				rotate:90,
				//color:'black',
				style: {
					textAlign: 'center'
				},
				width: 12,
				height: 12,
				data:eventSeries[key]

			}

			// If the series exist
			var attachTo=_.find(this.charts.series,function(i){return (i.options||{}).id==key});
			if(attachTo){
				var serie=_.find(this.charts.series,function(i){return (i.options||{}).id=='flag_for_'+key});
				if(serie){
					serie.setData(eventSeries[key]);
				}else{
					this.charts.addSeries(flagSerie);	
				}	
			}						
		}
		// eventSeries.forEach(function(s){
		// 	var flagserie={
		// 		type:'flag',
		// 		onSeries:''
		// 	}
		// 	// If series contain this name, then add it.
		// 	if(this.charts.series,)
		// })

		// var ids=_.groupBy(this.charts.series,function(s){return (s.options||{}).id});
		
	},
	// options should contain series name and symbol object {marker, x, y}
	addEvent:function(options){
		var series=_.find(this.charts.series,{name:options.name});
		if(!series) return;
		var index=utility.binarySearch(series.points,function(data){
			return data.x-options.symbol.x;
		},false);
		if(index>0){
			var p=series.points[index];
			// series.points[index].update({
		 //        // marker: {
		 //        //     symbol: 'square',
		 //        //     fillColor: "#A0F",
		 //        //     radius: 5
		 //        // }
		 //        marker: {
   //                  symbol: 'url(http://www.highcharts.com/demo/gfx/snow.png)'
   //              }
		 //    });
	        p.update({
				marker: {
					symbol: 'square',
					fillColor: "#A0F",
					lineColor: "A0F0",
					radius: 5
				}
			},true,true);
			this.charts.redraw();
		}else{
			series.addPoint(options.symbol,true,true);
		}
	},
	removeEvent:function(options){
		var series=_.find(this.charts.series,{name:options.name});
		if(!series) return;
		var index=utility.binarySearch(series.points,function(data){
			return data[0]-options.symbol.x;
		},false);
		if(index>0){
			series.points[index].update({
		        marker:null
		    });
		}	
	}
});
var infoView=base.extend({
	templateName:'info_panel',
	initialize:function(options){
		base.prototype.initialize.apply(this,arguments);
		this.collection=new Backbone.Collection(null);
		this.centerView=options.centerView;
		_.bindAll(this,'reRender');
		this.collection.on('update',this.reRender);
		this.render();
	},
	afterRender:function(){

		// this.$('#infoTableBottom').dataTable();
		
		$('#infoTableBottom').dataTable({
            responsive: true,
            paging: true,
            searching: false,
            bInfo: false,
            bSort: true,
            orderMulti: false,
			dom: 'T<"clear">rti'
        });
        this.$('.popoverOption').popover({ trigger: "hover" });
	},
	templateData:function(){
		if (this.collection) {
			var toreturn=this.collection.toJSON()
			for(var i=0;i<4;i++){
				if(!toreturn[i]){
					toreturn[i]={};
				}
			}
			return toreturn;
		}
		return {};
	},
	setData:function(option){// Look for model by ID. then change the data
		var s=this.collection.find(function(i){return i.get('influxKey')==option.influxKey});
		s.set('data',option.data);
		s.set('color',option.color);
	},
	reCalculate:function(){
		var self=this;
		Promise.resolve().then(function(){
			self.collection.forEach(function(e){
				var data=e.get('data')||[];
				var byDay=_.groupBy(data,function(d){
					var date=new Date(d[0]);
					var day="0"+date.getDate();
					var month="0"+(date.getMonth()+1);
					var year=date.getFullYear();
					return year+"/"+month.slice(-2)+"/"+day.slice(-2);
				})
				// check the head and tail see if they have enough data.
				// basically if the interval between midnight to first point, or last point to midnight next day is too big. then cut it
				byDay=_.filter(byDay,function(d){
					var da=new Date(d[0][0]);
					var interval=da.getHours()*60+da.getMinutes();
					da=new Date(d[d.length-1][0]);
					var interval2=24*60-da.getHours()*60-da.getMinutes();
					interval=Math.max(interval,interval2);
					var avg=60*24/d.length;
					return interval<avg*2
				})
				var dailyResult=_.map(byDay,function(d){
					 var result={sum:0,min:99999,max:0}
					 var currentMax=0,currentMin=999999,currentSum=0;
					 for(var i=0;i<d.length-1;i++){
					 	var u=(d[i+1][0]-d[i][0])/3600000;// make it in units of hour
					 	result.sum+=d[i][1]*u; // This is like enumerate integration
					 	var td=new Date(d[i][0]).getHours();
					 	var td2=new Date(d[i+1][0]).getHours();
					 	if(td===td2){
					 		currentSum+=d[i][1]*u;
					 	}else{
					 		result.max=Math.max(result.max,currentSum);
					 		result.min=Math.min(result.min,currentSum);
					 		currentSum=0;
					 	}
					 }
					result.max=Math.max(result.max,currentSum);
				 	result.min=Math.min(result.min,currentSum);
				 	if(result.sum==0){
				 		console.log(result);
				 	}
					return result;
				});
				var usage=_.pluck(dailyResult,"sum");
				var hmax=_.pluck(dailyResult,"max");
				var hmin=_.pluck(dailyResult,"min");
				if(usage.length>0){
					e.set("dailymax",Math.max.apply(Math,usage).toFixed(2));
					e.set("dailymin",Math.min.apply(Math,usage).toFixed(2));
					e.set("dailyavg",(_.reduce(usage,function(s,u){return s+u},0)/usage.length).toFixed(2));
					e.set("hourlymax",Math.max.apply(Math,hmax).toFixed(2));
					e.set("hourlymin",Math.max.apply(Math,hmin).toFixed(2));
					
				}else{
					e.set("dailymin",0);
					e.set("dailymax",0);
					e.set("dailyavg",0);
					e.set("hourlymax",0);
					e.set("hourlymin",0)
				}
				//e.avg=Math.mean.apply(Math,usage);
			})
			self.reRender();
		})

	},
	reRender:function(){
		this.render();
	}
});
var rightSideBar=base.extend({
	templateName:'chart_right',
	initialize:function(options){
		base.prototype.initialize.apply(this,arguments);
		_.bindAll(this,'reRender');
		this.centerView=options.centerView;
		this.collection=new Models.Collections.SimpleCollection(null,{url:'/api/events/'});// This is collection of events
		this.collection.on('update',this.reRender);
		this.render();
	},
	refetch:function(options){
		if(!(options||{}).seriesName){
			this.collection.reset();
			return;
		}

		this.collection.setGetParameter({seriesName:options.seriesName,origin:options.origin,start:options.start,end:options.end,color:options.color})
		this.collection.reset();
		this.collection.fetch({
			error:function(err){
				console.log(err);
			},
			success:function(model){
				console.log(model);
			}
		});
	},
	reRender:function(){
		this.render();
		this.collection.models.reverse();
		this.centerView.displayEvent(this.collection);
	},
	afterRender:function(){
		this.$('#infoTableRightTop').dataTable({
            responsive: true,
            paging: false,
            scrollY:400,
            searching: false,
            bInfo: false,
            bSort: false,
            orderMulti: false,
			dom: 'T<"clear">rtip'
        });
	}

});

module.exports=base.extend({
	templateName:'chart',
	initialize: function (options) {
		this.el=options.el;
		this.render();
	},
	afterRender:function(){
		this.centerView=new centerContent({el:'.center-content'});
		this.rightView=new rightSideBar({el:'.aside-right-content',centerView:this.centerView});
		this.leftView = new leftSideBar({ el: '.aside-left-content', centerView: this.centerView });
		this.centerView.rightView=this.rightView;
		this.centerView.render();
		this.leftView.render();
		this.rightView.render();
	}

	// changePane: function (pane) {
	//     if (!pane) {
	//         return;
	//     }
	//     this.sidebar.showContent(pane);
	// },
});