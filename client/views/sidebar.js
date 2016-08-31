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

module.exports = base.extend({
	templateName:'report_side',
	submenu:'report',
	initialize: function (options) {
		this.el=options.el;
        _.bindAll(this,'renderBuildingSelect');
		this.submenu=options.submenu;
		this.MenuViews=options.MenuViews;
		this.MenuTitle=options.MenuTitle;
		//this.render();
		this.menu = this.$('.settings-menu');
        this.collection=new Models.Collections.SimpleCollection([],{url:'/api/energyunit/?format=json&'});
        this.collection.on('update',this.renderBuildingSelect);
        this.collection.fetch();
	},
	models: {},
	events: {
		'click .settings-menu li': 'switchPane',
        'click .woBorderDropdown>li':'switchBuilding'
	},
    switchBuilding:function(e){
    	if(e instanceof Backbone.Model){
			this.selectedBuilding = e;
        }else{
        	var item=e.currentTarget;
	        var link=$(item).children('a').attr('href').replace("#","");
    	    this.selectedBuilding = this.collection.find({ id: parseInt(link) });
        }
        this.$('button').html(this.selectedBuilding.get('name'));
        if(this.pane)this.pane.reRender();
    },
    renderBuildingSelect:function(){
        var self=this;
        var data=this.collection.filter(function(e){
            return (e.get('type')||0)==1;
        });
        this.$('.woBorderDropdown').empty();
        data.forEach(function(b){
            self.$('.woBorderDropdown').append('<li><a href="#' + b.get('id') + '">' + b.get('name') + '</a></li>');
        });
        this.switchBuilding(data[0]);
    },
	render: function (options) {

		var ml = this.template(options);
		if (ml[0] != '<') {
			ml = ml.substring(1);
		}
		this.$el.html(ml);
		var container=this.$('.settings-menu>ul')
		for(var key in this.MenuTitle){
			if (this.MenuTitle.hasOwnProperty(key)){
				container.append('<li class="list-group-item"><a href="#'+key+'"><i class="fa fa-bar-chart"></i>'+this.MenuTitle[key]+'</a></li>');
			}
		}
		return this;
	},
	switchPane: function (e) {
		e.preventDefault();
		var item = $(e.currentTarget),
		id = item.find('a').attr('href').substring(1);

		this.showContent(id);
	},

	showContent: function (id) {
	    this.setActive(id);
		
		var self = this,
			model;
		Equota.router.navigate('/'+this.submenu+'/' + id + '/');
		//myApp.trigger('urlchange');
		if (this.pane && id === this.pane.id) {
			return;
		}
		if(this.pane){
			if(_.isFunction(this.pane.cleanup)){
				this.pane.cleanup();
			}
			if(_.isFunction(this.pane.destroy)){
				this.pane.destroy();
			}
		}
		var toDisplay=this.MenuViews[id];
		if(toDisplay){
			this.pane =new toDisplay({ el: '.content',sidebar:this }); 
		}else{
		   // this.pane=new this.MenuViews.Pane({ el: '.content' });
		}
		//this.pane.render();
		//this.pane.afterRender();
	},
	setActive: function (id) {
		this.menu = this.$('.settings-menu');
		this.menu.find('li').removeClass('active');
		this.menu.find('a[href=#' + id + ']').parent().addClass('active');        
	}
});