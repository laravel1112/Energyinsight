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

module.exports={
    'sales':main.baseDataView.extend({
        collectionName:'Comission',
        collectionUrl:'/SalesComission/',
        title:'销售佣金列表',
        paginator:true,
        renderOptions:{month:true},
        templateName:'default',
        constructColumns:function(){
            var self=this;
            return util.ajaxGET('/salesGroup/').then(function(data){
                var myselect=BackgridCells.SelectCell({name:'销售组',values:_.map(data,function(e){return [e.salesGroup,e.id]})});
                self.columns=[
                {name:'chineseName',label:'学生名字',editable:false,cell:'string'},
                {name:'nickname',label:'销售名字',editable: false,cell:'string'},
                {name:'UserCount',label:'老师人数',editable:false,cell:'integer'},
                {name:'contractSigned',label:'签约时间',editable:false,cell:'date'},
                {name:'contractPrice',label:'签约金额',editable:false,cell:'number'},
                {name:'altPrice',label:'服务总价',editable:false,cell:'number'},
                {name:'amountBeforeGoal',label:'完成目标金额',editable:false,cell:'number'},
                {name:'goal',label:'离目标还剩',editable:false,cell:'number'},
                {name:'amountAfterGoal',label:'超过目标金额',editable: false,cell:'number'},
                {name:'role',label:'销售/专家',editable:false,cell:'string'},
                {name:'salesGroup',label:'销售组',editable:false,cell:myselect},
                {name:'percent',label:'超过目标佣金百分比',editable: false,cell:Backgrid.NumberCell.extend({decimals:3})},
                {name:'comission',label:'合同佣金',editable:false,cell:'number'},
                ];

                return Promise.resolve({});
            }); 
        },
        destroy: function () {
            this.$el.removeClass('active');
            this.undelegateEvents();
        },
        afterRender:function(){
            this.$el.attr('id', this.id);
            this.$el.addClass('active');
        },   
    }),
    'teacher':main.baseDataView.extend({
        collectionName:'Comission',
        collectionUrl:'/ServiceComission/',
        title:'申请老师佣金列表',
        paginator:true,
        renderOptions:{month:true},
        templateName:'default',
        constructColumns:function(){
            var self=this;
            return Promise.all([util.ajaxGET('/ServiceProgress/')]).spread(function(progress,data){
                 var progressselect=BackgridCells.SelectCell({name:'Progress',values:_.map(progress,function(e){return [e.serviceProgress,e.id]})});
                 var totalCell=BackgridCells.Cell.extend({
                    render:function(){
                        var totalScore=this.model.get('thisMonthScore')||0+this.model.get('decidedScore')||0+this.model.get('appliedScore')||0+this.model.get('acceptedScore')||0
                        this.$el.html(totalScore);
                        return this;
                    }
                });
                self.columns=[
                    {name:'cName',label:'用户名字',editable:false,cell:'string'},
                    {name:'nickname',label:'老师名字',editable: false,cell:'string'},
                    {name:'realServiceType',label:'服务类型',editable: false,cell:'string'},
                    {name:'indate',label:'进入服务时间',editable:false,cell:BackgridCells.MomentCell},
                    //{name:'user',label:'老师',editable:false,cell:'number'},
                    //{name:'servLevel',label:'文书level',editable:false,cell:levelselect},
                    {name:'lastProgress',label:'月初进度',editable:false,cell:progressselect},
                    {name:'curProgress',label:'月末进度',editable:false,cell:progressselect},
                    {name:'decidedH',label:'本月选校高中数',editable:false,cell:'number'},
                    {name:'appliedH',label:'本月提交高中数',editable:false,cell:'number'},
                    {name:'decidedCC',label:'本月选校语言cc数',editable:false,cell:'number'},
                    {name:'appliedCC',label:'本月提交语言cc数',editable:false,cell:'number'},
                    {name:'decidedU',label:'本月选校U/master数',editable:false,cell:'number'},
                    {name:'appliedU',label:'本月提交U/master数',editable:false,cell:'number'},
                    {name:'thisMonthScore',label:'本月进度积分',editable:false,cell:'number'},
                    {name:'decidedScore',label:'本月选校积分',editable:false,cell:'number'},
                    {name:'appliedScore',label:'本月提交积分',editable:false,cell:'number'},
                    {name:'acceptedScore',label:'本月录取积分',editable:false,cell:'number'},
                    {name:'',label:'本月总积分',editable:false,cell:totalCell},
                   // {name:'extra',label:'Extra',cell:'number'},
                    // {name:'startComission',label:'月初佣金',editable: false,cell:'number'},
                    // {name:'endComission',label:'月末佣金',editable: false,cell:'number'},
                    // {name:'monthlyComission',label:'本月佣金',editable:false,cell:'number'},
                    // {name:'final',label:'佣金',cell:'number'}
                    ];
                return Promise.resolve({});
            });
            
        },
        destroy: function () {
            this.$el.removeClass('active');
            this.undelegateEvents();
        },
        afterRender:function(){
            this.$el.attr('id', this.id);
            this.$el.addClass('active');
        },    
    })
}
var assis=main.baseDataView.extend({
    collectionName:'Comission',
    collectionUrl:'/AssistantComission/',
    title:'申请老师佣金列表',
    paginator:true,
    renderOptions:{month:true},
    templateName:'default',
    constructColumns:function(){
        this.columns=[{name:'chineseName',label:'客户名字',editable: false,cell:'string'},
        //{name:'contract',label:'Contract',editable:false,cell:'string'},
        {name:'user',label:'User',editable: false,cell:'string'},
        {name:'createdAt',label:'咨询时间',editable:false,cell:'Date'},
        {name:'contractPaid',label:'付款时间',editable:false,cell:'Date'},
        {name:'email',label:'邮件数',editable: false,cell:'number'},
        {name:'comission',label:'佣金',editable: false,cell:'number'},
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