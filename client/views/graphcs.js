"use strict";
var $ = require('../jquery');
var Backbone= require('../backbone');
var Models = require('../models');
var JST=require('../JST');
var utility=require('../util');
//var CryptoJS=window.CryptoJS = require('browserify-cryptojs');
//require('browserify-cryptojs/components/md5');
var Highcharts=require('../highstock/highstock.src.js');
var _=require("underscore");
//var HS=require('highcharts-browserify');
var base=require('./base');

var HighStockTimeSeries=base.extend({
	initialize:function(options){
		base.prototype.initialize.apply(this,arguments);
	},
	afterRender:function(){
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
					if(i.name=='Navigator'){
						return Promise.resolve({});
					}else{
						return utility.ajaxGET("/api/series/",{serieName:i.options.id,start:Math.round(e.min),end:Math.round(e.max)}).then(function(data){
							data=data[0]||{};
							var points=data.points||[];
							points=points.reverse();
							i.setData(points);
						});	
					}
				});
				Promise.all(promises).then(function(data){
					self.charts.hideLoading();			
				})
			}
		}

		
		this.charts = new Highcharts.StockChart({

			chart: {
				renderTo : this.el,
				type: 'areaspline'
			},

			global:{
				useUTC:false
			},

			title: {
				text: 'Real Time Energy Data'
			},
			/*
			colors: ['#2f7ed8','#8bbc21', '#910000', '#1aadce', 
			'#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a'],
			*/
			legend: {
				enabled:true,
			},
			navigator:{
				adaptToUpdatedData:false
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
				type:'datetime',
				events : {
					afterSetExtremes : afterSetExtremes
				},
			},
			yAxis: {
				title: {
					text: 'Energy Usage (kWh)'
				},
                plotLines: [{
                        value: 0,
                        width: 2,
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
				series: { marker: { enabled: false } },
			},
			series:[]
		});
	},
	addSerie:function(options){
		var self=this;
		var model=options.model;
		this.infoView.collection.add(model);
		var influxKey=model['influxKey']||'';
		if(influxKey.length>0){
			//Add it only if it does not exist
			var existserie=_.find(this.charts.series,function(i){return (i.options).id==influxKey});
			if(existserie){
				return  Promise.resolve({});
			}
			if(this.cache[influxKey]){
				this.charts.addSeries(this.cache[influxKey]);
				// Reset the extreme to trigger the AfterSetExtreme event
				var s=_.find(self.charts.series,function(i){return (i.options).id==influxKey});
				var ext=s.xAxis.getExtremes();
				s.xAxis.setExtremes(ext.min,ext.max);
				return Promise.resolve({});
			}
			return utility.ajaxGET("/api/series/",{serieName:influxKey}).then(function(data){
				data=data[0]||{};
				var points=data.points||[];
				// data.forEach(function(p){
				//   json_array.push(p);  
				// })
				points=points.reverse();
				var serie= {
					id:data.name,
					name:data.name.substring(data.name.lastIndexOf(".")+1),
					// color: "#" + CryptoJS.enc.Hex.stringify(data.name).substring(2, 8),
					color:options.color||'#123467',
					data : points
				}
				self.charts.addSeries(serie); //add new serie
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
		return this;
	},
	displayEvent:function(collection,options){
		var es=collection.toJSON();
		es=_.map(es,function(e){
			return {
				name:e.name,
				title:'event',
				x:e.x,
				text:e.value
			};
		});
		// Array of list of events for each series
		var eventSeries=_.groupBy(es,function(e){return e.name});
		for(var key in eventSeries){
			var flagSerie={
				id:'flag_for_'+key,
				type:'flags',
				onSeries:key,
				shape:'circlepin',
				width:16,
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
	},
});

var HighchartGraphPanel=base.extend({
	templateName:'graph_element',
	// This should include information about the chart. chartoptions, panel style(width,background etc)
	// Also the chart title as a label. 
	initialize:function(options){
		base.prototype.initialize.apply(this,arguments);
		this.templateName=options.templateName||this.templateName;
		this.chartOptions=_.extend(this.chartOptions||{},options.chartOptions);
		if(options.el){
			this.el=options.el;
			this.selector=options.el;
		}else{
			this.$el=$('<div></div>').addClass(options.class);
		}
		
	},
	drawChart:function(options){
		this.$('.chartContainer').highcharts(this.chartOptions);
	},
	getHighchartObject:function(){
		return this.$('.chartContainer').highcharts();
	}
});

var HighchartPanelSmall=HighchartGraphPanel.extend({
	templateName:'graph_panel_small',
});

var HighchartPanelSmall2=HighchartGraphPanel.extend({
	templateName:'graph_panel_small2',
});

var Timeline=base.extend({
	templateName:'graph_timeline',
	initialize:function(options){
		base.prototype.initialize.apply(this,arguments);
		this.$el=$('<div></div>').addClass(options.class);
	},
})
var Gadget=base.extend({
	templateName:'graph_gadget',
	initialize:function(options){
		base.prototype.initialize.apply(this,arguments);
		this.templateName=options.templateName||this.templateName;
		if(options.el){
			this.el=options.el;
		}else{
			this.$el=$('<div></div>').addClass(options.class);
		}
	},
	setModel:function(model){
		if( model instanceof Backbone.Model){
			this.model=model
		}else{
			this.model=new Models.Models.simpleModel(model);
		}
	}
})

module.exports={
	HighchartGraphPanel:HighchartGraphPanel,
	TimeSeries:HighStockTimeSeries,
	Timeline:Timeline,
	HighchartPanelSmall:HighchartPanelSmall,
	HighchartPanelSmall2:HighchartPanelSmall2
}

