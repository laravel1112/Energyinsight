#!/usr/bin/python
# -*- coding: utf-8 -*-

'''
Filename: predictor.py
Description: predict API

Author: Rich
Change Activity:
    2016.1.14 revise, and finish linear regression
    2016.1.18 revise convert frequency
    2016.1.20 finish test: x1,x2,x3, y
'''

from __future__ import division

import pandas as pd
from datetime import datetime
from optimizerbase import *
from pandas import Series


class Predictor(OptimizerBase):

    def __init__(self, featureList=None, objList=None, tempList=None):
        '''
        Description: input tempList, featureList, objList;

        Args:
            tempList: list, meter id of temperature
            featureList: list, meter ids except for temperature
            objList: list, meter id of predicted object
        '''
        self.featureList = featureList
        self.objList = objList
        self.tempList = tempList
        # filter setting
        self.wspan = 5
        self.polyorder = 2
        self.mode = 'nearest'
        self.thresh = 2.5

    def dataResample(self, data, meterList, start_utc, end_utc):
        import numpy as np
        from scipy.stats.mstats import zscore

        from scipy.signal import savgol_filter
        '''
        Description: resample data downloaded from serever as timeseries

        Args:
            data: list, include series of dicts according to meterList, like
                        [{'points': [[t, v], [t, v], ...]}, ...]
            meterList: list, meter ids according to data
            start_utc: int, start time to download data
            end_utc: int, end time to download data
            # freq: string, resampling frequency

        Returns:
            seriesList: list, include series of pd.series meterList with uniform
                                index
        '''
        # parameter setting fro interpolation
        # sl = 'spline'
        # slOrder = 2
        biasLimit = 5
        interLimit = 2
        limitDir = 'both'

        start = datetime.fromtimestamp(start_utc)  # need to add timezone
        end = datetime.fromtimestamp(end_utc)  # need to add timezone
        indexSta = pd.date_range(start, end, freq=self.samplingFreq)
        seriesList = []
        for i, points in enumerate(data):
            # get points and making filter
            pointCol = list(zip(*reversed(points['points']))[-1])
            points_filtered = savgol_filter(np.array(pointCol), self.wspan,
                                            self.polyorder, mode=self.mode)
            points_zcored = zscore(np.array(pointCol) - points_filtered)
            for j, point in enumerate(points_zcored):
                # print pointCol[j], points_filtered[j], abs(point)
                if abs(point) > self.thresh:
                    pointCol[j] = np.nan
            # get actual time series index
            timeCol = list(zip(*reversed(points['points']))[0])
            indexAct = map(datetime.fromtimestamp, timeCol)
            # generate actual pd.series
            sr = Series(pointCol, index=indexAct, name=meterList[i])
            # print sr
            # up sampling
            sr_res = sr.resample('15s')
            # supplement on-time value
            sr_bias = sr_res.interpolate(limit=biasLimit,
                                         limit_direction=limitDir)
            # down sampling to actual sampling frequency
            sr_reindex = sr_bias.reindex(indexSta)
            # interpolate value based on actual sampling frequency
            sr_inter = sr_reindex.interpolate(limit=interLimit,
                                              limit_direction=limitDir)
            # earse negtive value
            sr_earseNeg = sr_inter.where(sr_inter >= 0.0).fillna(np.nan)

            seriesList.append(sr_earseNeg.resample(self.predictorFreq))

        return seriesList

    def xPreprocess(self, start_utc, end_utc):
        '''
        Description: preprocess Xs including temp and features, return DataFrame

        Args:
            start_utc: int, start time to download data
            end_utc: int, end time to download data

        Returns: DataFrame, including all Xs as timeseries
        '''

        XseriesList = []
        # check if featureList is empty
        if self.featureList is not None:
            data = OptimizerBase.get_meter_data(self, self.featureList,
                                                start_utc, end_utc)
            if data is None:
                return None
            featureSeriesList = self.dataResample(data, self.featureList,
                                                  start_utc, end_utc)
            XseriesList += featureSeriesList

        # check if tempList is empty
        if self.tempList is not None:
            data = OptimizerBase.get_meter_data(self, self.tempList, start_utc,
                                                end_utc)
            if data is None:
                return None
            tempSeriesList = self.dataResample(data, self.tempList, start_utc,
                                               end_utc)
            tempSeriesList = self.tempPreprocess(tempSeriesList)
            XseriesList += tempSeriesList

        return pd.concat(XseriesList, axis=1)

    def tempPreprocess(self, tempSeriesList):
        '''
        Description: calculate CDD

        Args:
            tempSeriesList: list, include series of pd.Series (temperature)

        Returns tempSeriesList: list, include series of pd.Series (CDD)
        '''
        for i, tempSeries in enumerate(tempSeriesList):
            tempSeriesList[i] = tempSeries.where(tempSeries >= 18.5).fillna(0.0)
        return tempSeriesList

    def yPreprocess(self, start_utc, end_utc):

        YseriesList = []
        if self.objList:
            data = OptimizerBase.get_meter_data(self, self.objList, start_utc,
                                                end_utc)
            if data is None:
                return None
            objSeriesList = self.dataResample(data, self.objList, start_utc,
                                              end_utc)
            YseriesList += objSeriesList

        return pd.concat(YseriesList, axis=1)

    def linearReg(self, start_utc, end_utc):
        '''
        Description: preprocess Xs including temp and features, return DataFrame

        Args:
            start_utc: int, start time to download data
            end_utc: int, end time to download data

        Returns: linear regression class !!!
        '''

        from sklearn.linear_model import LinearRegression
        Xdf = self.xPreprocess(start_utc, end_utc)
        if Xdf is None:
            print "no x series to fit!"
            return None
        Ydf = self.yPreprocess(start_utc, end_utc)
        if Ydf is None:
            print "no y series to fit!"
            return None
        df = pd.concat([Xdf, Ydf], axis=1).dropna()
        df.columns = list(df.columns)[:-1] + ['y'+df.columns[-1]]
        # print df.columns
        # print Xdf
        if len(df.values) == 0:
            print "no y-x series to fit!"
            return None
        '''
        for obj in self.objList:
            xSeries = df.drop(obj, axis=1).values
            ySeries = df[obj].values
        '''
        xSeries = df.drop(df.columns[-1], axis=1).values
        ySeries = df[df.columns[-1]].values
        '''
        print "xSeries>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
        print xSeries
        print "ySeries>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
        print ySeries
        '''
        model = LinearRegression()
        # print xSeries
        # print ySeries

        try:
            result = model.fit(xSeries, ySeries)
        except:
            print "Failed to fit"
            result = None

        return result

    def linearPredictor(self, start_reg_utc, end_reg_utc, start_pre_utc,
                        end_pre_utc, freq='auto'):

        self.samplingFreq = '1Min'
        print freq
        if freq == 'auto':
            self.predictorFreq = self.samplingFreq
        else:
            self.predictorFreq = str(freq) + 's'
        print self.predictorFreq
        '''
        # assumed predictorFreq > samplingFreq
        if self.samplingFreq > self.predictorFreq:
            print " Sampling frequency > predictor frequency"
            return
        '''
        # linear regression model
        predictor = self.linearReg(start_reg_utc, end_reg_utc)
        if predictor is None:
            print "Failed to generate predictor"
            return None
        print "The regression coefficients: ", predictor.coef_

        # download Xs to predict
        # xSeries = self.xPreprocess(start_pre_utc, end_pre_utc).dropna().values
        Xdf = self.xPreprocess(start_pre_utc, end_pre_utc).fillna(0)
        if Xdf is None:
            print "no x to predict"
            return None
        # print xSeries
        # print ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
        print "Number of predicted points is: ", len(Xdf)
        return predictor.predict(Xdf.values)


if __name__ == "__main__":
    '''
    XmeterList = ['86', '87']
    YmeterList = ['85']
    start_utc = convert_time_to_utc('2015-12-14 00:00:00 +8')
    end_utc = convert_time_to_utc('2015-12-15 00:00:00 +8')

    # test predict
    pre = PredictorClient()
    pre.hourlyPre(XmeterList, YmeterList, start_utc, end_utc)
    exit()
    # test regressiion
    pre = PredictorClient()
    pre.timelyReg(XmeterList, YmeterList, start_utc, end_utc)
    exit()
    # test xpreprocess
    pre = PredictorClient()
    print pre.xPreprocess(XmeterList, start_utc, end_utc)
    print pre.yPreprocess(YmeterList, start_utc, end_utc)
    exit()

    # test download
    sclient = SeriesClient()
    energy_unit_id = '87'

    start_utc = convert_time_to_utc('2015-12-14 00:00:00 +8')
    end_utc = convert_time_to_utc('2015-12-15 00:00:00 +8')

    data = sclient.download_data(energy_unit_id, start_utc, end_utc)

    print data
    exit()
    '''
