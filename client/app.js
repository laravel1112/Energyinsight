(function(){
	var $ = require('./jquery');
    var Backbone = require('./backbone');
    var _ = require('underscore');
    var Handlebars = require('handlebars');
global.Equota={
		Views:{},
		Models:{},
        Collections: {},
        notifications:{},
		router:null
    };
    _.extend(Equota, Backbone.Events);
var Router=require('./Router');
var Models=require('./models');
var View=require('./views/index.js');
    
    
var init=function(){
    Equota.router = new Router();
        //Equota.notifications = new View.Notification.collection({ model: [] });
    Equota.Views=View;
    Equota.Models=Models;      
	Backbone.history.start({
		pushState:true,
		hashChange:false,
        root: '/'
	});
};
init();

}());