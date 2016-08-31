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
var main=require('./data.js');
var Sidebar=require('./sidebar');
var base=require('./base');



var Settings={};


Settings.comissionLookup=Settings.hierarchy.extend({
    collectionUrl:'/ComissionLookup/',
    title:'销售佣金设定',
    filterFields:['rolename'],
   // filterFields:['puppet','boss'],
    constructColumns:function(){
        var self=this;
        var editable=false;
        if(parseInt(this.rank||"1")==3){
            editable=true;
        }
        return util.ajaxGET('/contract/getAllOptions/').then(function(AllOptions){
            var t=_.map(AllOptions['SalesGroup'],function(e){return [e.salesGroup,e.id]});
            t.push(['任何销售组',0]);
            var salesgroup=BackgridCells.SelectCell({name:"SalesGroup",values:t});
            t=_.map(AllOptions['Lead'],function(e){return [e.lead,e.id]});
            t.push(['Any Lead',0]);
            var lead=BackgridCells.SelectCell({name:"Lead",values:t});
            var leadDetail=lead.extend({
                optionValues:function(){
                    var l=this.model.get('lead')||0;
                    var shrunk=_.where(AllOptions['LeadDetail'],{lead:l});
                    var toadd=_.map(shrunk,function(e){return [e.leadDetail,e.id]});
                    toadd.push(['Any LeadDetail',0]);
                    return [{name:'LeadDetail',values:toadd}];
                }
            });
            
            self.columns=[
                {name:'lead',label:'Lead种类',editable:editable,cell:lead},
                {name:'leadDetail',label:'lead种类细分',editable:editable,cell:leadDetail},
                {name:'salesGroup',label:'销售组',editable:editable,cell:salesgroup},
                {name:'alone',label:'是否独立',editable:editable,cell:'boolean'},
                {name:'rolename',label:'销售角色',editable:editable,cell:'string'},
                {name:'comission',label:'佣金百分比',editable:editable,cell:Backgrid.NumberCell.extend({decimals:3})},
                {name:'',label:'Delete',cell:BackgridCells.DeleteCell}
            ];
            // self.selectFields=[
            // {name:'puppet',options:_.map(user,function(e){return [e.nickname,e.id]})},
            // {name:'boss',options:_.map(user,function(e){return [e.nickname,e.id]})},
            // ];
            return Promise.resolve({});
        });
    },

});

module.exports=Settings;