#!/usr/bin/python
# -*- coding: utf-8 -*-

'''
Filename: Prediction_test.py
Description: predict test

Author: Simo
Change Activity:
    2016.5.17 Created
    
'''

from optimizer.algorithm.predictor import *
import pandas as pd
import numpy as np
import csv
import os
import csv
import numpy as np
#import matplotlib.pyplot as plt
import time
from scipy.cluster.vq import kmeans, vq, whiten
from scipy.spatial.distance import cdist
from sklearn import metrics
#import matplotlib
from datetime import datetime
import math
from sklearn import tree

from pybrain.tools.shortcuts import buildNetwork
from pybrain.supervised.trainers import BackpropTrainer
from pybrain.datasets import SupervisedDataSet,UnsupervisedDataSet
from pybrain.structure import LinearLayer
from optimizer.scripts.ANNFunctionSet import *
from algorithm.optimizerbase import *
import sys
reload(sys)
sys.setdefaultencoding("utf-8")

class ANNPredictor(OptimizerBase):

    def __init__(self,predict_id):
            self.predict_id = predict_id


    def calweekday(self,date):
        
        weekday=datetime.datetime.strptime(date,"%Y-%m-%d").isoweekday()
        
        return weekday

    def cal_error(self,pre,a):
        error_abs=[]
        for i in range(len(pre)):
            error_abs.append(abs(pre[i]-a[i]))
        return np.array(error_abs).sum(),np.array(a).sum()

    def predict_net(self,net,input_table,daily):
        real_plot=[]
        predict_plot=[]
        error_abs_sum=[]
        error_actual_sum=[]

        for date,value in input_table.iterrows():
            ts = UnsupervisedDataSet(input_table.shape[1],)
            ts.addSample(input_table.loc[date])
            pre=[ int(i) for i in net.activateOnDataset(ts)[0]]
            actual=np.array(daily.loc[date])
        
            error_abs, error_actual=self.cal_error(pre,actual)
            error_abs_sum.append(error_abs)
            error_actual_sum.append(error_actual)
        
            for i in range(len(pre)):
                predict_plot.append(pre[i])
                real_plot.append(actual[i])
        
        mape_error=np.array(error_abs_sum).sum()/np.array(error_actual_sum).sum()
        print 'Mape= ',mape_error
        return np.array(error_abs_sum).sum(),np.array(error_actual_sum).sum(),real_plot,predict_plot


    def train_net(self,input_table,daily):
        ds = SupervisedDataSet(input_table.shape[1], daily.shape[1])
        for time,value in daily.iterrows():
            ds.addSample(input_table.loc[time],value)
        net = buildNetwork(input_table.shape[1], 40, daily.shape[1], outclass=LinearLayer,bias=True)
        trainer = BackpropTrainer(net, ds)
        trainer.trainEpochs(1000)
        return net
        

    def ANNPredictor(self,series_name,start_utc = None,end_utc = None,start_pre_utc = None,end_pre_utc = None ,freq = 'auto'):

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
                    
                test_frame['Time'] = test_frame.index.map(lambda t: t.time())
                test_frame['Date'] = test_frame.index.map(lambda t: t.date())
                test_dailyblocks = pd.pivot_table(test_frame,values ='data' , index = 'Date', columns = 'Time', aggfunc = 'mean')
                test_dailyblocks = test_dailyblocks.groupby(lambda x:x.hour, axis = 1).mean()
                test_dailyblocks = test_dailyblocks.fillna(method='ffill')
                print(test_dailyblocks)
                daily = test_dailyblocks.copy()
                s_norm=(daily-daily.mean())/(daily.max()-daily.min())
                    #daily = np.matrix(daily.dropna())
                 
    
                   
            except:

                
                    print('Downloading Data Error')       


            try:

                ###############Downloading the temperature data
                temp_series_name = ['temp_shanghai']
                temp = OptimizerBase.get_series_data(self,series_list = temp_series_name,
                start_utc = calendar.timegm(startTime.utctimetuple()),
                end_utc = calendar.timegm(endTime.utctimetuple()) ,operation = "value")

                temp_datapoints = temp[0]['points']

                temp_data=np.array(list(reversed(zip(*temp_datapoints)[2])))
                temp_time=np.array(list(reversed(zip(*temp_datapoints)[0])))
                
                tempts = pd.Series(temp_data,index=pd.to_datetime(temp_time, unit='s',  utc=True).tz_convert('Asia/Shanghai'))

                tempts = tempts.resample('60Min', fill_method='pad')
                ###################Finishing download temp data
                tempts = tempts.to_frame()
               	tempts.columns=['Temp']
                hourly_temp = tempts.copy()

                hourly_temp['Time'] = hourly_temp.index.map(lambda t: t.time())
    
              
                hourly_temp['Date'] = hourly_temp.index.map(lambda t: t.date())
                
   
                dailyblocks_temp = pd.pivot_table(hourly_temp, values='temp', index='Date', columns='Time', aggfunc='mean')
                #dailyblocks_temp = dailyblocks_temp.groupby(lambda x: x.hour, axis=1).mean()
                dailyblocks_temp = dailyblocks_temp.fillna(method = 'ffill')
                # add weekday one hot code
                weekday_int= []
                for i in dailyblocks_temp.index:
                    weekday_int.append(i.isoweekday())
                weekday_one_hot = pd.get_dummies(weekday_int)
                weekday_one_hot=weekday_one_hot.set_index(dailyblocks_temp.index)
                temp_weekday=[dailyblocks_temp,weekday_one_hot]
                table = pd.concat(temp_weekday,ignore_index=True, axis=1)
                #Third Part--Use neural network to predict energy load profile

            except:

                
                    print('error')   
            
            print(tester_ts)
            print tempts
            tester = ANN_Prediction(4,40,100)
            tester.train(tempts,tester_ts)
            tester.predict(tempts,tester_ts)
            print('1')
            

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
            end_utc = calendar.timegm(endpreTime.utctimetuple()),operation = "value" )

            temp_datapoints = temp[0]['points']

            temp_data=np.array(list(reversed(zip(*temp_datapoints)[2])))
            temp_time=np.array(list(reversed(zip(*temp_datapoints)[0])))
            
            pretempts = pd.Series(temp_data,index=pd.to_datetime(temp_time, unit='s',  utc=True).tz_convert('Asia/Shanghai'))

            pretempts = pretempts.resample('60Min', fill_method='pad')
            ###################Finishing download pretemp data

            pretempts = pretempts.to_frame()
            pretempts.columns=['Temp']
            prehourly_temp = pretempts.copy()

            prehourly_temp['Time'] = prehourly_temp.index.map(lambda t: t.time())

          
            prehourly_temp['Date'] = prehourly_temp.index.map(lambda t: t.date())
            

            
            return tester.predict(pretempts)

def run(series_name,debug = True):
    Predictor = ANNPredictor(1)
    a = Predictor.ANNPredictor(['testTS48__total'])
    print(a)
    return