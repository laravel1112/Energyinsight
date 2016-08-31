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
var Views=require('./index');

var Navbar = base.extend({
	initialize: function (options) {
		this.el=options.el;
		this.MenuViews=Views;
		this.menu = this.$('ul#main-navbar');

	},
	models: {},
	events: {
		'click ul#main-navbar>li': 'switchView'// Only switch view for the left main menus
	},

	switchView:function (e) {
		var item = $(e.currentTarget),
		id = item.find('a').attr('href').substring(1).replace('/','');
		if(id){
			e.preventDefault();
			this.showView(id);
		}
	},

	showView:function (id,options) {
		var self = this;
		Equota.router.navigate('/'+id + '/',{trigger:false,replace:false});
		if (this.currentView && id === this.currentView.id) {
			return;
		}
		if(this.currentView){
			if(_.isFunction(this.currentView.clear)){
				this.currentView.clear();
			}
		}
		var toDisplay=this.MenuViews[id];
		if(toDisplay){
			this.currentView =new toDisplay({ el: '.wrapper',pane:(options||{}).pane }); 
			this.currentView.id=id;
			this.setActive(id);
		}
	},
	setActive: function (id) {
		this.menu.find('li').removeClass('active');
		this.menu.find('a[href*=' + id + ']').parent().addClass('active');        
	}
});

module.exports=Navbar;