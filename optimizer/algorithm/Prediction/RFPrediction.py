#!/usr/bin/python
# -*- coding: utf-8 -*-

'''
Filename: Prediction_test.py
Description: predict test

Author: Simo
Change Activity:
    2016.7.17 Created
    
'''

from optimizer.algorithm.predictor import *
import pandas as pd
import numpy as np
import csv
import os
import csv
import numpy as np
import matplotlib.pyplot as plt
import time
from scipy.cluster.vq import kmeans, vq, whiten
from scipy.spatial.distance import cdist
from sklearn import metrics
import matplotlib
from datetime import datetime
import math
from sklearn import tree
from sklearn.ensemble import RandomForestRegressor
from backend.models import EnergyUnit
from backend.models import WeatherStation
from utils.weather_test import *
import json

from algorithm.optimizerbase import *

#from algorithm.Prediction.RFFunctionSet import *
from RFFunctionSet import *
import sys
reload(sys)
sys.setdefaultencoding("utf-8")

class RFPredictor(Optimizerbase):

	def __init__(self, objList=None,request=None):
        '''
        Description: input tempList, featureList, objList;

        Args:
            tempList: list, meter id of temperature
            featureList: list, meter ids except for temperature
            objList: list, meter id of predicted object
        '''
        # the request and objList are inputed from views.py predict_series api
        self.objList = objList
        self.request = request
        #mode: local file mode, url mode(with request), server mode run (optimizerbase)

        #if request:
        #if not request,from local and

       
#TODO:      
# Two modes: if pass request then use getseries(when called by backend webserver), otherwise give an url and user information(ipython notebook case) 
# directly call getweather api
    
    


    def new_Predictor(self,freq = 'auto'):

        series_name = [EnergyUnit.objects.filter(id = self.objList[0]).influxKey]

                
        
            

        #    tipTime = datetime.fromtimestamp(OptimizerBase.get_series_tip_utc(self, series_name), tz=pytz.timezone('Asia/Shanghai'))

        #    start_utc = tipTime - timedelta(days = 30)

        #    tipTime = start_utc + timedelta(days = 20)

        #    startTime = start_utc.replace(hour=0, minute=0, second=0, microsecond=0)

        #    endTime = tipTime.replace(hour=0, minute=0, second=0, microsecond=0)
        Client = loadClient()
        
        try:
            # maybe need int(objList[0]), not sure for now
            param = self.request.POST
            if len(param)==0:
                param=json.loads(self.request.body)
            
            else:
                start_utc=long(unix_time(datetime.today().replace(year=datetime.today().year-1)))

            if 'end_utc' in param:
                end_utc=long(param['end_utc'])
            else:
                end_utc=long(unix_time(datetime.today()))

            # start and end for prediction base
            if 'base_end_utc' in param:
                values['end_utc'] = param['base_end_utc']
                base_end_utc = long(param['base_end_utc'])
            else:
                if 'start_utc' in param:
                    values['end_utc'] = param['start_utc']
                    base_end_utc = long(param['start_utc'])
                else:
                    # Should we use optimizerbase get series tip utc? or just pass?
                    pass

            if 'base_start_utc' in param:
                values['start_utc'] = param['base_start_utc']
            else:
                base_start_utc = base_end_utc - 3*30*24*60*60   # default 3 month
                values['start_utc'] = base_start_utc
            
            values['isExternalRequest'] = True
            values['time_format'] = 's'
            values['erase_flag']= False
            
            data = urllib.urlencode(values)
            
            # need to pass address
            url = address + "/api/getseries/"+str(self.objList[0])+"/"
            
            result = loadClien.sendingRequestToDB(url, data)

            ts = result[0]['points'][0][0]

            if freq == 'auto':

                    ts = ts.resample('60Min', fill_method='pad')
            else :

                    ts = ts.resample(freq,fill_method ='pad')
            test = ts.to_frame()
            test.columns = ['data']
            tester_ts = ts.to_frame()
            tester_ts.columns = ['Value']
            test_frame = test.copy()

        except:

                
                print('Downloading Data Error')       

        # Now download the training temperature data



    # 
    def Predictor(self,start_utc = None,end_utc = None,start_pre_utc = None,end_pre_utc = None ,freq = 'auto'):

		
        series_name = [EnergyUnit.objects.filter(id = self.objList[0]).influxKey]
        
        series_name = ['testTS48__total']
            
            #start_utc and end_utc from input
            if start_utc and end_utc:
                
                pass

                
            else:
                

                tipTime = datetime.fromtimestamp(OptimizerBase.get_series_tip_utc(self, series_name), tz=pytz.timezone('Asia/Shanghai'))

                start_utc = tipTime - timedelta(days = 30)

                tipTime = start_utc + timedelta(days = 20)

                startTime = start_utc.replace(hour=0, minute=0, second=0, microsecond=0)

                endTime = tipTime.replace(hour=0, minute=0, second=0, microsecond=0)

            
            #Download Training Data from server

            series = []

            series.append(series_name)

            startTime = start_utc.replace(hour=0, minute=0, second=0, microsecond=0)

            endTime = tipTime.replace(hour=0, minute=0, second=0, microsecond=0)

            try:

                # Downloading history data
                datalist = OptimizerBase.get_series_data(self, series_list=series_name, 
                start_utc = calendar.timegm(startTime.utctimetuple()),
                end_utc = calendar.timegm(endTime.utctimetuple()) )

                datapoints = datalist[0]['points']

                data=np.array(list(reversed(zip(*datapoints)[2])))
                time=np.array(list(reversed(zip(*datapoints)[0])))

                ts = pd.Series(data, index=pd.to_datetime(time, unit='s',  utc=True).tz_convert('Asia/Shanghai'))

                if freq == 'auto':

                    ts = ts.resample('60Min', fill_method='pad')
                else :

                    ts = ts.resample(freq,fill_method ='pad')
                test = ts.to_frame()
                test.columns = ['data']
                tester_ts = ts.to_frame()
                tester_ts.columns = ['Value']
                test_frame = test.copy()
                    
                #test_frame['Time'] = test_frame.index.map(lambda t: t.time())
                #test_frame['Date'] = test_frame.index.map(lambda t: t.date())
                #test_dailyblocks = pd.pivot_table(test_frame,values ='data' , index = 'Date', columns = 'Time', aggfunc = 'mean')
                #test_dailyblocks = test_dailyblocks.groupby(lambda x:x.hour, axis = 1).mean()
                #test_dailyblocks = test_dailyblocks.fillna(method='ffill')
                print(test_frame)
                #daily = test_dailyblocks.copy()
                #s_norm=(daily-daily.mean())/(daily.max()-daily.min())
                    #daily = np.matrix(daily.dropna())
                 
    
                   
            except:

                
                    print('Downloading Data Error')       


            
            try:
                objs=WeatherStation.objects.all();
                energy_unit = EnergyUnit.objects.filter(id =self.objList[0])

                distance = 100000000000000
                for weather_station in objs:
                    a = numpy.linalg.norm(numpy.array(map(int(),energy_unit.GPSlocation.split(',')))-numpy.array(map(int(),weather_station.GPSlocation.split(','))))
                    if distance > a:
                        distance = a
                        eu = weather_station
                #eu=objs[0];
                temp_series_name = [eu.unit.influxKey]
                          
            except: 

                temp_series_name = ['temp_shanghai']

            try:

                ###############Downloading the temperature data
                
                
                #TODO: find the nearest weather station -> already done
                

                
                
                temp = OptimizerBase.get_series_data(self,series_list = temp_series_name,
                start_utc = calendar.timegm(startTime.utctimetuple()),
                end_utc = calendar.timegm(endTime.utctimetuple()) )

                temp_datapoints = temp[0]['points'][0]# check wether this will work

                temp_data=np.array(list(reversed(zip(*temp_datapoints)[2])))
                temp_time=np.array(list(reversed(zip(*temp_datapoints)[0])))
                
                tempts = pd.Series(temp_data,index=pd.to_datetime(temp_time, unit='s',  utc=True).tz_convert('Asia/Shanghai'))

                tempts = tempts.resample('60Min', fill_method='pad')
                ###################Finishing download temp data
                tempts = tempts.to_frame()
               	tempts.columns=['Temp']
                hourly_temp = tempts.copy()

            except:

                
                    print('error')   
            

            total = pd.concat([hourly_temp,test_frame],axis=1).dropna()
            total["Month"] = total.index.map(lambda x: x.month)
            total["Weekday"] = total.index.map(lambda x: x.isoweekday())
            total["Hour"] = total.index.map(lambda x: x.hour)
            
            print(total)
            
            # prepare learning data
            target = total[["Value"]]
            feature = total.copy().drop("Value",axis=1)
            Y = target.values.reshape(1,-1)[0]
            X = feature.values
            print('1')

            # cal insample error
            clf = RandomForestRegressor(n_estimators=500)
            clf = clf.fit(X, Y)
            pred = clf.predict(X)
            cal_error_for_list(pred,Y)

            # prediction
            if start_pre_utc and end_pre_utc:
                startpreTime = start_pre_utc.replace(hour=0, minute=0, second=0, microsecond=0)
                endpreTime = end_pre_utc.replace(hour=0, minute=0, second=0, microsecond=0)+ timedelta(days = 1)
            else:
                startpreTime = startTime+ timedelta(days = 1)
                endpreTime = startTime+ timedelta(days = 8)
            # Download prediction temp data
            temp = OptimizerBase.get_series_data(self,series_list = temp_series_name,
            start_utc = calendar.timegm(startpreTime.utctimetuple()),
            end_utc = calendar.timegm(endpreTime.utctimetuple()) )

            temp_datapoints = temp[0]['points'][0]

            temp_data=np.array(list(reversed(zip(*temp_datapoints)[2])))
            temp_time=np.array(list(reversed(zip(*temp_datapoints)[0])))
            
            pretempts = pd.Series(temp_data,index=pd.to_datetime(temp_time, unit='s',  utc=True).tz_convert('Asia/Shanghai'))

            pretempts = pretempts.resample('60Min', fill_method='pad')
            ###################Finishing download pretemp data

            pretempts = pretempts.to_frame()
            pretempts.columns=['Temp']
            prehourly_temp = pretempts.copy()
            df = prehourly_temp
            total = pd.concat(df,axis=1).dropna()
        	total["Month"] = total.index.map(lambda x: x.month)
        	total["Weekday"] = total.index.map(lambda x: x.isoweekday())
        	total["Hour"] = total.index.map(lambda x: x.hour)
        	feature = total.copy()
            X = feature.values
            pred = clf.predict(X)
        	pred_df = pd.Series(pred,name="Values",index=total.index)

        	return pd.Series(pred_df)

def run(series_name,debug = True):
    Predictor = RFPredictor(['87'])
    a = Predictor.RFPredictor(['testTS48__total'])
    print(a)
    return
