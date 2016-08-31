"use strict";
var $ = require('../jquery');
var Backbone= require('../backbone');
var Models = require('../models');
var JST=require('../JST');
var utility=require('../util');
var Highcharts=require('../highstock');
var _=require("underscore");
var Backform=require('../backform');
//var HS=require('highcharts-browserify');
var base=require('./base');

function getTranslatedLabel(txt){
	var hash={"description":"介绍",
	"type":"类型",
	"name":"名称",
	"value":"信息",
	"address":"地址",
	"buildingarea":"建筑范围",
	"yearbuild":"建筑年份",
	"manufacturer":"制造商",
	"modelname":"型号",
	"samplerate":"取点频率",
	"gpslocation":"GPS位置",
	"category":"类别"
	};
	return hash[txt]||txt;
}
function displayField(txt){
	//var fieldHash={"id":false,"buildingparam":false,"campus":false,"campusparam":false,"influxkey":false,"meterparam":false,"parent":false}
	var fieldHash={"gpslocation":true,"category":true,"name":true,"type":true,"value":true}
	return !!fieldHash[txt.toLowerCase()];
}

function iconSrc(options){
	var dir="/static/img/";
	var model=options.model;
	switch (model['type']||""){
		case 2:
		case "/api/unittype/Campus/": return options.selected==true?dir+"campus-on.png":dir+"campus-off.png";break;
		case 1:
		case "/api/unittype/Building/": return options.selected==true?dir+"building-on.png":dir+"building-off.png";break;
		case 3:
		case "/api/unittype/Meter/": return options.selected==true?dir+"meter-on.png":dir+"meter-off.png";break;
		default:return "";
	}
}

var leftSideBar=base.extend({
	templateName:'chart_left',
	initialize:function(options){
		base.prototype.initialize.apply(this,arguments);
		_.bindAll(this,'showSerieInfo','unShowSeries');
		this.seriesNum=0;
		this.centerView=options.centerView;
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
					check_callback:true,
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
			if(this.seriesNum>1){
				data.instance.deselect_node(node);
				return;
			}
			this.centerView.switchModel(node.data);
		}
	},
	unShowSeries:function(e,data){
		this.seriesNum=0;
	},
	deSelect:function(node,instance){
		this.seriesNum--;
	},
});

var centerView=base.extend({

	initialize:function(options){
		base.prototype.initialize.apply(this,arguments);
		this.editModel=new Models.Models.simpleModel();
		this.listenTo(this.editModel,'change',this.reRender);
		_.bindAll(this,'render','switchModel','reRender');
	},
	events:{
		"click #deletenode":"deletenode"
	},
	render:function(){
		var CSRF_TOKEN=utility.getCookie("csrftoken");
		var self=this;
		this.$('#editor').empty();
		if(this.model){
			this.$('#editor').append('<button type="submit" id="deletenode" class="btn">删除该节点</button>');
			var attr=this.model.attributes;
			var fields=[];
			for (var key in attr){
	            if(attr.hasOwnProperty(key)&&key!='resource_uri'){
	            	if(displayField(key)){
	            		fields.push({name:key,label:getTranslatedLabel(key.toLowerCase()),control:"uneditable-input"});
	            		//fields.push({name:key,label:key.toUpperCase(),control:"uneditable-input"});
	            	}
	        	}
	        }
	        this.unedtableform=new Backform.Form({
				model:this.model,
				fields: fields
			});
			this.$('#editor').append(this.unedtableform.render().el);
		}
		if(this.editModel.get('id')&&this.model){
			var attr=this.editModel.attributes;
			var fields=[];
			for (var key in attr){
	            if(attr.hasOwnProperty(key)&&key!='resource_uri'){
	            	if(key=="id"){
	            		//fields.push({name:key,label:key.toUpperCase(),control:"uneditable-input"});
	            	}else{
	            		fields.push({name:key,label:getTranslatedLabel(key.toLowerCase()),control:"input"});
	            	}
	        	}
	        }
	        fields.push({control:"button",label:"保存"});
			this.form=new Backform.Form({
				//el:'#editor',
				model:self.editModel,
				fields: fields,
				events: {
				    "submit": function(e) {
				      e.preventDefault();
				      this.model.save(null,{
				      	beforeSend :function(xhr){c
					        xhr.setRequestHeader('X-CSRFToken', CSRF_TOKEN);
					    }
				      }).done(function(result) {
				        alert("Form saved to server!");
				      });
				      return false;
				    }
				}
			});
			this.$('#editor').append(this.form.render().el);
		}
		if(this.model){
			var type="";
			switch(this.model.get('type')){
				case 1: type ="/api/unittype/Building/";break;
				case 2: type="/api/unittype/Campus/";break;
				case 3: type="/api/unittype/Meter/";break;
			}
			var newNode=new Models.Models.simpleModel({parent:{pk:this.model.id},campus:{pk:this.model.get('campus')},type:type});
			newNode.setURL({_url:"/api/energyunit/"});
			this.addNodeForm=new Backform.Form({
				model:newNode,
				fields:[
					{name:"type",label:getTranslatedLabel("type"),control:"select", defaults:type,options: [
				        {label: "建筑", value: "/api/unittype/Building/"},
				        {label: "楼宇", value: "/api/unittype/Campus/"},
				        {label: "表", value: "/api/unittype/Meter/"},
			      	]},
					{name:"name",label:getTranslatedLabel("name"),control:"input"},
					{name:"value",label:getTranslatedLabel("value"),control:"input"},
					{control:"button",label:"添加该节点",name:'sub'}
				],
				events: {
				    "submit": function(e) {
				      e.preventDefault();
				      this.model.save(null,{
				      	beforeSend :function(xhr){
					        xhr.setRequestHeader('X-CSRFToken', CSRF_TOKEN);
					    },
					    success:function(model){
					    	console.log(model);
					    },
					    error:function(model,result){
					    	if(result.statusText!="CREATED"){
					    		// error
					    	}else{
					    		var instance = $('#graph-tree').jstree(true);
					    		var src=model.toJSON();
					    		var n={
									id:src.id,
									parent:src.parent||'#',
									text:src.name,
									"a_attr": { "class": "show_tooltip popoverOption",
												"data-content":src.description||"",
												"data-trigger":"hover",
												 "data-placement":"bottom",
												 },
									icon:iconSrc({model:src,selected:false}),
									data:src
								}
								var parent=instance.get_node((src.parent||{}).pk)||'#';
					    		instance.create_node(parent,n);
					    	}
					    }
				      });
				      return false;
				    }
				}
			});
			this.$('#editor').append(this.addNodeForm.render().el);
		}
	},
	reRender:function(){
		if(this.form){
			this.form.remove();
			//this.render();
		}
		if(this.addNodeForm){
			this.addNodeForm.remove();
		}
		this.render();
	},
	switchModel:function(model){
		var type=model['type'];
		var id,urlbase;
		switch(type){
			case 1: id=model['buildingparam'];
			urlbase='/api/buildingparam/';break;
			case 2: id=model['campusparam'];
			urlbase='/api/campusparam/';break;
			case 3: id=model['meterparam'];
			urlbase='/api/meterparam/';break;
		}
		this.model=new Models.Models.simpleModel(model);
		this.model.setURL({_url:"/api/energyunit/"});
		this.editModel=new Models.Models.simpleModel({id:id});
		this.listenTo(this.editModel,'change',this.reRender);
		//this.editModel.clear({silent:true});
		//this.editModel.set({id:id},{silent:true});
		this.editModel.setURL({_url:urlbase});
		this.editModel.fetch();
		//this.model.trigger('change');
		//this.model.fetch();
	},
	deletenode:function(){
		var self=this;
		if(this.model){
			this.model.destroy().then(function(data){
				var instance = $('#graph-tree').jstree(true);
  				instance.delete_node(instance.get_selected());
  				self.model=null;
  				//self.editModel=null;
  				self.editModel.trigger('change');
			});
		}
	}


})
module.exports=base.extend({
	templateName:'user_admin',
	initialize: function (options) {
		this.el=options.el;
		this.render();
	},
	afterRender:function(){
		this.centerView=new centerView({el:'.center-content'});
		this.leftView=new leftSideBar({el:'.aside-left-content',centerView:this.centerView});
		this.leftView.render();
		this.centerView.render();
	}

});