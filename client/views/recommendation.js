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

var Sidebar=require('./sidebar.js');

var Recommendation=base.extend({
	templateName:'report_recommendation',
	initialize:function(options){
		base.prototype.initialize.apply(this,arguments);
		// Right now this is static, but it can be saved on server 每月能耗趋势图
		this.model=new Backbone.Model({title:'节能建议与策划', subtitle:'Optimization and Recommendation'});
		this.render();
        this.$('#table1').dataTable( {
            responsive: true,
            paging: true,
            searching: false,
            bInfo: true,
            bSort : true,
            orderMulti: true
        });
	},
    reRender:function(){
        this.clear();
        this.render();
    }
});

// Configuration tab in Recommendations  
var Configuration = base.extend({
    templateName: 'report_configuration',
    initialize: function (options) {
        this.model = new Backbone.Model({ title: 'Configuration title', subtitle: 'Configuration description' });
        base.prototype.initialize.apply(this, arguments);
        this.render();
    },
    reRender: function () {
        this.clear();
        this.render();
    }
});


var MenuViews={
    'Recommendation': Recommendation,
    'Configuration': Configuration,
}

//TODO: extend it to support leading icons
var ReportTitle={
    'Recommendation': '节能建议',
    'Configuration': 'Config'

}
var MainView=base.extend({
    defaultView:'Recommendation',
    templateName:'report',
    initialize: function (options) {

        $(".settings-content").removeClass('active');
        this.render();
        this.sidebar = new Sidebar({
            el: '.settings-sidebar',
            submenu:'recommendation',
            MenuViews:MenuViews,
            MenuTitle:ReportTitle
        });
        this.sidebar.render();
        if(!options.pane){
            Equota.router.navigate('recommendation/'+this.defaultView+'/',{trigger:false,replace:true});
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
module.exports=MainView;