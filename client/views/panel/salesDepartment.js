"use strict";
var _=require('lodash');
var Promise=require('bluebird');
var moment=require('moment');
var $ = require('../jquery');
var Backgrid=require('../backgrid');
var Backbone= require('../backbone');
var Obiwang = require('../models');
var validator=require('../validator.js');
var util=require('../util');
var BackgridCells=require('../backgrid.cell.js');
var Backform=require('../backform');
var JST=require('../JST');
var main=require('./data');
var base=require('./base');
var Sidebar=require('./sidebar');

var DatabaseView=main.basePaneView.extend({
    templateName:'default',
    renderOptions:{month:true},
    events: {
        'click .button-alt':'refetch',
        'click .button-save':'save'
    },
    requrestUrl:'general',
    initialize:function(options){
        main.basePaneView.prototype.initialize.apply(this,arguments);
        this.render({title:this.title,options:this.renderOptions});
    },
    refetch:function(){
        var month=$('#month').val()||'';
        var year=$('#year').val()||'';
        if(month.length<0||year.length<0) return;
        var query="month="+month+"&year="+year;
        $('.content').html("");
        var self=this;
        $.ajax({
                url: '/market/'+self.requrestUrl+'/?'+query,
                type: 'GET',
                headers: {
                    'X-CSRF-Token': $("meta[name='csrf-param']").attr('content')
                },
                success: function (msg) {
                    self.result=msg;
                    self.displayQuery(msg);
                },
                error: function (xhr) {
                    Wholeren.notifications.clearEverything();
                    Wholeren.notifications.addItem({
                        type: 'error',
                        message: util.getRequestErrorMessage(xhr),
                        status: 'passive'
                    });
                }
            });
    },
    save:function(e){
        var col=new Backbone.Collection(this.result);
        util.saveCSV(col);
    },
    displayQuery:function(data){

        var tab=$('<table/>');
        if(!data) return;
        var keys=_.keys(data[0]);
        var headline=$('<tr/>');
        keys.forEach(function(ele){
            var attr=$('<th/>').text(ele);
            headline.append(attr);
        });
        tab.append(headline);
        //Now insert every row
        data.forEach(function(row){
            var curRow=$('<tr/>');
            keys.forEach(function(key){
                curRow.append($('<td/>').text(row[key]));
            });
            tab.append(curRow);
        });
        $('.content').html(tab);
    },
    afterRender: function () {
        this.$el.attr('id', this.id);
        this.$el.addClass('active');
    }

});

var SalesSummary={};
SalesSummary.view1=DatabaseView.extend({
    collectionParam:{url:'contractOfSaleAndExpert'},
    requrestUrl:'contractOfSaleAndExpert',
    constructColumns:function(){
         this.columns=[
        {name:'salesGroup',label:'销售组',editable:false,cell:'string'},
        {name:'lead',label:'Lead',cell:'string'},
        {name:'count',label:'咨询量',cell:'number'},
        {name:'signcount',label:'签约量',cell:'number'},
        {name:'income',label:'签约价',cell:'number'},
        ];
        return Promise.resolve({});
    },
});
SalesSummary.view2=DatabaseView.extend({
    requrestUrl:'MonthlyChange'
});
SalesSummary.view3=main.baseDataView.extend({
    title:'每月销量',
    paginator:true,
    collectionName:'General',
    minScreenSize:0,
    renderOptions:{month:true},
    collectionParam:{url:'/Market/MonthlyGoal/'},
    templateName:'default',
    constructColumns:function(){
         this.columns=[
        {name:'nickname',label:'老师名字',editable:false,cell:'string'},
        {name:'goal',label:'目标金额',cell:'number'}
        ];
        return Promise.resolve({});
    },
    destroy: function () {
        this.$el.removeClass('active');
        this.undelegateEvents();
    },
    afterRender:function(){
        this.$el.attr('id', this.id);
        this.$el.addClass('active');
    },
});
SalesSummary.view4=SalesSummary.view3.extend({
    title:'Sales Role ',
    renderOptions:{nofield:true},
    minScreenSize:0,
    collectionParam:{url:'/SalesRole/'},
    constructColumns:function(){
        this.columns=[
        {name:'salesRole',label:'角色名称',editable:false,cell:'string'},
        {name:'comissionPercent',label:'佣金百分比',cell:Backgrid.NumberCell.extend({decimals:3})},
        {name:'flatComission',label:'非百分比佣金',cell:'number'}
        ];

        return Promise.resolve({});
     },
     refetch:function(e){
        this.collection.setdate({year:null,month:null});
        this.collection.reset();
        if(this.collection.fullCollection)this.collection.fullCollection.reset();
        this.collection.fetch({reset:true});
    },
});
SalesSummary.view5=SalesSummary.view4.extend({
    title:'Service Type Comission',
    collectionParam:{url:'/ServiceType/'},
    constructColumns:function(){
        this.UL=new Obiwang.Collections['UserLevel']();
        var grid2=new Backgrid.Grid({columns:[{name:'userLevel',label:'老师等级',editable:false,cell:'string'},
        {name:'userComission',label:'等级佣金百分比',cell:'number'}],collection:this.UL});
        $('.table-wrapper').append(grid2.render().el);
        this.UL.fetch();
        this.columns=[
        {name:'serviceType',label:'服务名称',editable:false,cell:'string'},
        {name:'category',label:'类型',editable:false,cell:'string'},
        {name:'comission',label:'百分比佣金',cell:Backgrid.NumberCell.extend({decimals:3})}
        ];

        return Promise.resolve({});
    },
    afterRender:function(){

        this.$el.attr('id', this.id);
        this.$el.addClass('active');
     },
});


module.exports=SalesSummary;