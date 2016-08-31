var Backbone = require('./backbone');
//var PageableCollection=require('backbone.paginator');
$ = require('./jquery');
var util=require('./util.js');
Backbone.$ = $;
Models = {};
Collections = {};
var _=require('underscore');
var simpleModel=Backbone.Model.extend({
        urlRoot:function(){
            var base=this._url||_.result(this.collection,'_url')||_.result(this.collection,'url')||urlError();
            if(base.indexOf('?')>0){
                return base.substring(0,base.indexOf('?'));
            }else{
                return base;
            }
        },
        initialize:function(attrs,options){
            this._url=(options||{})._url;
        },
        setGetParameter:function(options){
            this.param=options;
        },
        setURL:function(options){
            this._url=options._url;
        },
        parse:function(response){
            // if(response.createdAt){
            //     if(!isNaN(new Date(response.createdAt).getTime())){
            //         response.createdAt=new Date(response.createdAt);
            //     }
            // }
            return response;
        },
        toString:function(){
            var toReturn='';
            for (var i in this.attributes){
                if(i!='id'&&i!='createdAt'&&i!='updatedAt'){
                    toReturn+=this.attributes[i];
                }
            }
            return toReturn;
        }
    });
var syncModel=simpleModel.extend({
    initialize:function(attrs,options){
        options=options||{};
        this._url=options._url;
        delete options['_url'];
        Backbone.Model.prototype.initialize.apply(this, arguments);
        this.on("change", function (model, options) {
            if (options && options.save === false) return;
            var prevAttr=model._previousAttributes;
            model.save(model.changed,{patch:true,error:function(model,response){
                model.set(prevAttr,{save:false});
                util.handleRequestError(response);
            },save:false});
        });
    },
    parse:function(response){
        return response;
    }
});
var simpleCollection=Backbone.Collection.extend({
        model: simpleModel,
        param:{},
        url:function(){
            var toReturn=this._url;
            var param="";
            console.log(this.param);
            for (var key in this.param){
                if(this.param.hasOwnProperty(key)&&this.param[key]!=null){
                    param+=key+"="+encodeURIComponent(this.param[key])+"&";
                }
            }
            if(param){
                toReturn+="?"+param
            }

            return toReturn;
        },
        initialize:function(models,options){
            options=options||{};
            this.name=options.name;
            this._url=options.url;
            delete options.name;
            delete options.url;
        },
        parse:function(response){
            if( Array.isArray(response.objects)){
                // This is django model return. objects contain array of "rows" in db
                return response.objects;
            }
            if(Array.isArray(response)){
                if(Array.isArray((response[0]||{}).points)){
                    // This is influxDB results. Have to map the points to json obj
                    var toReturn=[];
                    response.forEach(function(s){
                        // InfluxDB returns multiple series, each s is a serie
                        var header=s.columns;
                        var points=s.points;
                        delete s.columns;
                        delete s.points;

                        points.forEach(function(p){
                            var obj={};
                            for(var a=0;a<header.length;a++){
                                obj[header[a]]=p[a];
                                obj.title="E";
                                _.extend(obj,s);
                            }
                            toReturn.push(obj);
                        })
                    })
                    return toReturn;
                }
                return response;
                
            }

            
        },
        setGetParameter:function(options){
            this.param=options;
        }
    });
var syncCollection=simpleCollection.extend({
    model:syncModel
});

Models={
    simpleModel: simpleModel,
    syncModel:syncModel,
};
Collections={
    SimpleCollection:simpleCollection,
    SimpleSyncCollection:syncCollection,
    SimplePageCollection:Backbone.PageableCollection.extend({
        model: syncModel,
        param:{},
        url:function(){
            var toReturn=this._url;
            var param="";
            for (var key in this.param){
                if(this.param.hasOwnProperty(key)&&this.param[key]!=null){
                    param+=key+"="+encodeURIComponent(this.param[key])+"&";
                }
            }
            if(param){
                toReturn+="?"+param
            }

            return toReturn;
        },
        initialize:function(models,options){
            this.mode="client";
            this.state={pageSize:20};
            options=options||{};
            this.name=options.name;
            this._url=options.url;
            delete options.name;
            delete options.url;
        },
        setGetParameter:function(options){
            this.param=options;
        }
    })
}



module.exports = { Models: Models,Collections:Collections };