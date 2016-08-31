var Backbone=require('backbone');
var _=require('underscore');
var Backbone=require('./backbone.modal')(_,Backbone);
Backbone=require('./backbone.paginator')(_,Backbone);
var $=require('../jquery');
Backbone.$=$;
//require('backbone-forms');
module.exports=Backbone;