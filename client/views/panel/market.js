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
	'general':main.baseDataView.extend({
    title:'Lead分析',
    paginator:true,
    filterFields:['salesGroup','lead'],
    collectionName:'General',
    minScreenSize:0,
    renderOptions:{month:true},
    collectionParam:{url:'/Market/General/'},
    templateName:'default',
    constructColumns:function(){
         this.columns=[
        {name:'salesGroup',label:'销售组',editable:false,cell:'string'},
        {name:'lead',label:'Lead',editable:false,cell:'string'},
        {name:'count',label:'咨询量',editable:false,cell:'number'},
        {name:'signcount',label:'签约量',editable:false,cell:'number'},
        {name:'income',label:'签约价',editable:false,cell:'number'},
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
}