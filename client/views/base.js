"use strict";
var _=require('underscore');
var $ = require('../jquery');
var Backbone= require('../backbone');
var JST=require('../JST');
module.exports=Backbone.View.extend({
	templateName: "widget",
    staticTemplate:false,
	template: function (data) {
		if(this.templateName){
			return JST[this.templateName](data);	
		}else{
			return "";
		}		
	},
	initialize:function(options){
		Backbone.View.prototype.initialize.apply(this,arguments);
		this.el=options.el;
	},

	templateData: function () {
		if (this.model) {
			if(this.model.toJSON){
				return this.model.toJSON();
			}else{
				return this.model;
			}
		}

		if (this.collection) {
			return this.collection.toJSON();
		}

		return {};
	},

	render: function (options) {
		if (_.isFunction(this.beforeRender)) {
			this.beforeRender();
		}
		if(options){
			this.$el.html(this.template(options));
		}else{
			this.$el.html(this.template(this.templateData()));			
		}
		if (_.isFunction(this.afterRender)) {
			this.afterRender();
		}
		if (_.isFunction(this.beforeRenderSubviews)){
			this.beforeRenderSubviews();
		}
		this.renderSubviews();
		if(_.isFunction(this.afterRenderSubviews)){
			this.afterRenderSubviews();
		}
		return this;
	},
	renderSubviews:function(){
		var self=this;
		(this.subviews||[]).forEach(function(v){
			if(self.staticTemplate){
                v.setElement(v.$el.selector||self.$(v.selector));
                v.render();
            }else{
                self.$el.append(v.render.$el);
            }
		});
	},
	addSubview: function (view) {
		if (!(view instanceof Backbone.View)) {
			throw new Error("Subview must be a Backbone.View");
		}
		this.subviews = this.subviews || [];
		this.subviews.push(view);
		return view;
	},
	clear:function(){
		if (this.subviews) {
			this.removeSubviews();
		}
		this.stopListening();
		this.$el.empty();
	},
	// Removes any subviews associated with this view
	// by `addSubview`, which will in-turn remove any
	// children of those views, and so on.
	removeSubviews: function () {
		var children = this.subviews;

		if (!children) {
			return this;
		}

		_(children).invoke("remove");

		this.subviews = [];
		return this;
	},

	// Extends the view's remove, by calling `removeSubviews`
	// if any subviews exist.
	remove: function () {
		if (this.subviews) {
			this.removeSubviews();
		}
		return Backbone.View.prototype.remove.apply(this, arguments);
	}
});

