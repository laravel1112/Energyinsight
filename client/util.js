
var Promise=require('bluebird');
var $=require('./jquery');
var _=require('underscore');
var saveAs=require('./FileSaver');
module.exports={
    binarySearch:function(array, criteria,blurr){
        var minIndex = 0;
        var maxIndex = array.length - 1;
        var currentIndex;
        var currentElement;
     
        while (minIndex <= maxIndex) {
            if(blurr&&maxIndex-minIndex<=1){
                return (minIndex + maxIndex) / 2 | 0;
            }
            currentIndex = (minIndex + maxIndex) / 2 | 0;
            currentElement = array[currentIndex];
            var result=0;
            if(_.isFunction(criteria)){
                result=criteria(currentElement);
            }else if(typeof criteria=="number"){
                result=currentElement-criteria;
            }
            if(result<0){
                minIndex = currentIndex + 1;
            }else if(result>0){
                maxIndex = currentIndex -1;
            }else{
                return currentIndex;
            }
        }
        return -1;
    },

	 getRequestErrorMessage: function (request) {
            var message,
                msgDetail;

            // Can't really continue without a request
            if (!request) {
                return null;
            }

            // Seems like a sensible default
            message = request.statusText;

            // If a non 200 response
            if (request.status !== 200) {
                try {
                    // Try to parse out the error, or default to "Unknown"
                    message =  request.responseJSON.error || request.responseText||"Unknown Error";
                } catch (e) {
                    msgDetail = request.status ? request.status + " - " + request.statusText : "Server was not available";
                    message = "The server returned an error (" + msgDetail + ").";
                }
            }

            return message;
    },
    handleRequestError:function(response){
        console.log(response);
        Wholeren.notifications.clearEverything();
        var errors=response.responseJSON||{};
        var errortext=response.responseText||"";
        var redirect=response.redirect;
        var delay=response.delay||5;
        if(errors.invalidAttributes){
            for(var key in errors.invalidAttributes){
                if(errors.invalidAttributes.hasOwnProperty(key)){
                    var a=errors.invalidAttributes[key];
                    a.forEach(function(item){
                        Wholeren.notifications.addItem({
                        type: 'error',
                        message: JSON.stringify(item),
                        status: 'passive'
                        });
                    });
                }
            }                     
        }else{
            Wholeren.notifications.addItem({
                type: 'error',
                message: errortext,
                status: 'passive'
            });
        }

        if(redirect){
            Wholeren.notifications.addItem({
                type: 'error',
                message: 'redirecting',
                status: 'passive'
            });
            setTimeout(function(){
                //Wholeren.router.navigate(redirect,{trigger:true});  
                window.location.href = redirect;
            },delay*1000);
        }
    },
    handleRequestSuccess:function(response){
        Wholeren.notifications.clearEverything();
        var text=response.responseText||"";
        var redirect=response.redirect;
        var delay=response.delay||5;
         Wholeren.notifications.addItem({
                        type: 'success',
                        message: text,
                        status: 'passive'
                        });
        if(redirect){
            setTimeout(function(){
                //Wholeren.router.navigate(redirect,{trigger:true});  
                window.location.href = redirect;
            },delay*1000);
        }
    },
    showError:function(text){
        Wholeren.notifications.clearEverything();
        Wholeren.notifications.addItem({
            type: 'error',
            message: text,
            status: 'passive'
        });
    },
    ajaxGET:function(url,data){
        var defer=Promise.defer();
        $.ajax({
            url: url,
            data:data,
            type: 'GET',
            headers: {
                'X-CSRF-Token': $("meta[name='csrf-param']").attr('content')
            },
            success: function (data) { 
                defer.resolve(data);                        
            },
            error: function (xhr) {
                defer.reject(xhr);
            }
        });
        return defer.promise;
    },
    ajaxSyncGET:function(url){
        var defer=Promise.defer();
        $.ajax({
            async:false,
            url: url,
            type: 'GET',
            headers: {
                'X-CSRF-Token': $("meta[name='csrf-param']").attr('content')
            },
            success: function (data) { 
                defer.resolve(data);                        
            },
            error: function (xhr) {
                defer.reject(xhr);
            }
        });
        return defer.promise;
    },
    saveCSV:function(collection,colnames){

        var downloadName = 'CSV data '+(new Date()).toString('yyyy-MM-dd hhmmss');
        var keys = _.chain(collection.first().attributes).keys().sort().value();
        var csvContent = "";
        if(!colnames){
            csvContent += keys.join(',')+'\n';
            csvContent += collection.map(function(item) { 
                var cols = []
                _.each(keys, function(key) { 
                    var i=item.get(key);
                    var topush="";
                    if(key)
                    if(typeof i == "string"){

                    }else if (i!=null&&i!=undefined){
                        topush=i.toString();
                    }                    
                    if(topush.indexOf(/,\n/g)>-1){
                        topush="\""+topush+"\"";
                    }
                    cols.push(topush);
                }); 
                return cols.join(',') ;
            }).join('\n');
        }else{
            csvContent +=_.map(colnames,function(e){
                return e.label;
            }).join(',')+"\n";
            csvContent+=collection.map(function(item){
                var cols=_.map(colnames,function(e){
                    var key=e.name;
                    var i=item.get(key);
                    // If it is a select cell
                    if(e.cell._touse){
                        var selValue=_.find(e.cell._touse,function(f){
                            return f[1]==i;
                        });
                        if((selValue||[]).length>0){
                            i=selValue[0];
                        }
                    }
                    i=i||"";
                    if(typeof i !=='string'){
                        i=i.toString();
                    }
                    if(i.search(/[,\n]/g)>-1){
                        i="\""+i+"\"";
                    }
                    return i;
                }).join(",");
                return cols;
            }).join('\n');
            // csvContent += keys.map(function(e){
            //     var header=_.find(colnames,function(f){
            //         return f.name==e;
            //     });
            //     if((header||{}).label){
            //         return header.label;
            //     }else{
            //         return e;
            //     }
            // }).join(',')+'\n';
        }

        var blob=new Blob([csvContent],{type:'text/plain;charset=utf-8'});
        saveAs.saveAs(blob,'text.csv');

        // var encodedUri = encodeURI(csvContent);
        // var link = document.createElement("a");
        // link.setAttribute("href", encodedUri);
        // link.setAttribute("download", downloadName+".csv");
        // link.click();
    },
    getCookie:function(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    },
// This require sorted data and asec order
    timeRange:function(data,options){
        var start=options.starttime;
        var end=options.endtime;
        if(options.sharpTime){
            var t=new Date(options.starttime);
            options.starttime=new Date((t.getMonth()+1)+"/"+t.getDate()+"/"+t.getFullYear()).getTime();
            t=new Date(options.endtime);
            options.endtime=new Date((t.getMonth()+1)+"/"+(t.getDate()+1)+"/"+t.getFullYear()).getTime();
        }
        if(!start||!end){
            return [];
        }
        var toReturn=_.filter(data,function(d){
            if(d[0]>=start&&d[0]<end) return true;
        });
        return toReturn;
    },
    getAreaUnderCurve:function(data,options){
        var sum=0;
        var toReturn=[];
        options=options||{};
        // first filter out data error, 
        data=_.filter(data,function(d){
            if(d[1]==0) return false;
            return true;
        })
        for(var i=0;i<data.length-1;i++){
            if(options.weekdaysOnly){
                var d=new Date(data[i][0]);
                if(d.getDay()==6||d.getDay()==7) continue; // Skip these points
                d=new Date(data[i+1][0]);
                if(d.getDay()==6||d.getDay()==7) continue;
            }
            if(options.partitions){
                for(var j=0;j<options.partitions.length;j++){
                    var section=options.partitions[j];
                    var h1=new Date(data[i+1][0]).getHours();
                    var h2=new Date(data[i][0]).getHours();
                    if(section.start<section.end){
                        if(h1<section.start||h1>section.end||h2<section.start||h2>section.end){
                            continue;
                        }
                    }else{
                        if((h1>section.end&&h1<section.start)||(h2>section.end&&h2<section.start)){
                           continue ;
                        }
                    }
                    // Here means h1, h2 both in range.                     
                    var u=(data[i+1][0]-data[i][0])/3600000;// make it in units of hour
                    toReturn[j]=(toReturn[j]||0)+data[i][1]*u;
                }
            } 
            var u=(data[i+1][0]-data[i][0])/3600000;// make it in units of hour
            sum+=data[i][1]*u; // This is like enumerate integration
        }
        if(options.partitions)return toReturn;
        return sum;
    },
    getAverage:function(data,options){     
        var groupedData=_.groupBy(data,function(d){
            var date=new Date(d[0]);
            var day="0"+date.getDate();
            var month="0"+(date.getMonth()+1);
            var year=date.getFullYear();
            if(options.month){
                return year+"/"+month.slice(-2);    
            }else if(options.day){
                return year+"/"+month.slice(-2)+"/"+day.slice(-2);
            }
        });
        
        groupedData=_.map(groupedData,function(d){
            var da=new Date(d[0][0]);
            var interval=da.getHours()*60+da.getMinutes();
            da=new Date(d[d.length-1][0]);
            var interval2=24*60-da.getHours()*60-da.getMinutes();
            interval=Math.max(interval,interval2);
            var avg=60*24/d.length;
            return interval<avg*2
        });
        
        // Now for each group, calculate the power usage. 
        var summary=_.map(groupedData,function(d){
            var sum=0;
            var date="";
            for(var i=0;i<d.length-1;i++){
                var x=(d[i+1][0]-d[i][0])/3600000; // x interval in (h);
                sum+=d[i][1]*x; // Like enumerate integration
                if(options.month){
                    date= year+"/"+month.slice(-2);    
                }else if(options.day){
                    date= year+"/"+month.slice(-2)+"/"+day.slice(-2);
                }
            }
            return {date:date,total:sum};
        });
        return summary;        
    }    
 

}