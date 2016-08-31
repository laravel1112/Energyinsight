/**
 * New node file
 */
"use strict";
var Backbone = require('./backbone');
Equota.Views=require('./views/');
var Navview=require('./views/navbar.js');
module.exports=Backbone.Router.extend({
    root:'',
	routes: function(){
        //return {'admin/settings(/:pane)/' : 'settings'};
        var toReturn={};
        /*
        * These are admin routes. 
        */ 
        toReturn['home/']='home';
        toReturn['charts/']='charts';
        toReturn['report(/:id)/']='report';
        toReturn['recommendation(/:id)/']='recommendation';
        toReturn['signin/']='signin';
        toReturn['user_admin/']='user_admin';
        toReturn[':menu/:submenu']='handl'
        return toReturn;
        // }
    },
    home:function(){
        if(!Equota.navView){
            Equota.navView=new Navview({el:'.navbar'});
        }
        Equota.navView.showView('home');
        Equota.navView.id='home';
    },
    charts: function () {
        if(!Equota.navView){
            Equota.navView=new Navview({el:'.navbar'});
        }
        Equota.navView.showView('charts');
        Equota.navView.id='chart';
    },
    report:function(id){
        if(!Equota.navView){
            Equota.navView=new Navview({el:'.navbar'});
        }
        Equota.navView.showView('report',{pane:id});
        Equota.navView.id='report';
    },
    recommendation:function(id){
        if(!Equota.navView){
            Equota.navView=new Navview({el:'.navbar'});
        }
        Equota.navView.showView('recommendation',{pane:id});
        Equota.navView.id='recommendation';
    },
    signin:function(id){
        if(!Equota.navView){
            Equota.navView=new Navview({el:'.navbar'});
        }
        Equota.navView.showView('signin',{pane:id});
        Equota.navView.id='signin';
    },
    user_admin:function(){
        if(!Equota.navView){
            Equota.navView=new Navview({el:'.navbar'});
        }
        Equota.navView.showView('user_admin');
        Equota.navView.id='user_admin';  
    }
	
});