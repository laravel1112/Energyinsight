# -*- coding: utf-8 -*-
'''
Filename: datasource_cp.py

Description:
    offer data source of CrownePlaza

Change activity:
    2016.2.22 creat file

'''
from __future__ import division
import numpy as np
import pandas as pd
# from datetime import datetime
from datetime import timedelta
# from dateutil import parser
from loadClient import loadClient
from baseTools import baseTools
from optimizer import trendCheck


class dataSource_cp(baseTools, loadClient):

    def __init__(self, addr):
        self.user = 'crowneplaza'
        self.pswd = 'crowneplaza'
        self.addr = addr
        self.freq_sampling = '60s'

    def dataResample(self, pointSr, freq, operation=None):

        pointSr_bias = pointSr.resample(self.freq_sampling)
        pointSr_fill = pointSr_bias.interpolate(limit=5, limit_direction='both')

        (total_missing, max_missing_hourly, missingList) = \
            self.dataMissing(pointSr_fill)

        if max_missing_hourly > 5:
            print "Missing too many points!"
            return None

        print "total missing is", total_missing

        if operation is None:
            return pointSr_fill.resample(freq).fillna(0)
        else:
            return (pointSr_fill.fillna(0)/60.0).resample(freq, how='sum')

    def dataMissing(self, pointSr):
        startTime = pointSr.index[0]
        endTime = pointSr.index[-1]

        start = startTime
        max_missing_hourly = 0
        total_missing = 0
        missingList = []

        while True:
            if start >= endTime:
                break
            end = start + timedelta(hours=1)
            if end > endTime:
                end = endTime
            hourlyIndex = pd.date_range(start, end, freq=self.freq_sampling)
            pointSr_reindex = pointSr.reindex(hourlyIndex)
            index_isnan = pointSr_reindex.index[pointSr_reindex.apply(np.isnan)]
            pointSr_missing = pointSr_reindex.reindex(index_isnan)
            max_missing_hourly = max(max_missing_hourly, len(pointSr_missing))
            missingList.append(pointSr_missing)
            start = end

        return (total_missing, max_missing_hourly, missingList)

    def getPower(self, energy_unit_id, startStr, endStr, freq):

        start_utc = baseTools.convert_timestr_to_utc(self, startStr)
        end_utc = baseTools.convert_timestr_to_utc(self, endStr)

        pointSr = loadClient.download(self, self.user, self.pswd, self.addr,
                                      energy_unit_id, start_utc, end_utc)

        powerSr = self.dataResample(pointSr, freq)

        if powerSr is None:
            print "No matched power data to use!"

        return powerSr

    def getElectric(self, energy_unit_id, startStr, endStr, freq):

        start_utc = baseTools.convert_timestr_to_utc(self, startStr)
        end_utc = baseTools.convert_timestr_to_utc(self, endStr)
        pointSr = loadClient.download(self, self.user, self.pswd, self.addr,
                                      energy_unit_id, start_utc, end_utc)

        electricSr = self.dataResample(pointSr, freq, 'sum')

        return electricSr

    def getActivity(self, occupancyID, meetingID, startStr, endStr):

        m = 24.0
        n = 3.5
        start_utc = baseTools.convert_timestr_to_utc(self, startStr)
        end_utc = baseTools.convert_timestr_to_utc(self, endStr)

        activityList = []
        for ID in [occupancyID, meetingID]:
            pointSr = loadClient.download(self, self.user, self.pswd, self.addr,
                                          ID, start_utc, end_utc)

            pointSr_resample = pointSr.resample('24T')
            pointSr_interpolate = \
                pointSr_resample.interpolate(limit=2, limit_direction='both')
            activityList.append(pointSr_interpolate.fillna(0))

        activitySr = activityList[0]*m + activityList[1]*n

        return activitySr

    def getTemperature(self, temperatureID, startStr, endStr, freq):

        T_HDD = 11.0
        T_CDD = 18.0
        start_utc = baseTools.convert_timestr_to_utc(self, startStr)
        end_utc = baseTools.convert_timestr_to_utc(self, endStr)

        pointSr = loadClient.download(self, self.user, self.pswd, self.addr,
                                      temperatureID, start_utc, end_utc)
        # start = datetime.fromtimestamp(start_utc)
        # end = datetime.fromtimestamp(end_utc)
        # indexSta = pd.date_range(start, end, freq='30Min')

        pointSr_resample = pointSr.resample('30Min')
        print pointSr_resample
        pointSr_interpolate = \
            pointSr_resample.interpolate(limit=2, limit_direction='both')
        temperatureSr = (pointSr_interpolate.fillna(np.nan)).resample(freq)
        temperatureSr_HDD = \
            temperatureSr.where(temperatureSr <= T_HDD).fillna(0.0)
        temperatureSr_CDD = \
            temperatureSr.where(temperatureSr >= T_CDD).fillna(0.0)
        print temperatureSr
        print temperatureSr_HDD
        print temperatureSr_CDD

        return (temperatureSr, temperatureSr_HDD, temperatureSr_CDD)


class recommend(dataSource_cp, trendCheck):

    def __init__(self):
        dataSource_cp.__init__(self, 'app.equotaenergy.com')

    def abnormalOn_airconditioner(self):
        startStr = '2016-01-15 12:00:00'
        endStr = '2016-02-22 12:00:00'
        # start_datetime = parser.parse(startStr + " +8")
        # end_datetime = parser.parse(endStr + " +8")

        # region A
        powerSr = dataSource_cp.getPower(self, '119', startStr, endStr, '5Min')
        powerSr = powerSr / 10.0
        start_index = powerSr.index[0]
        end_index = powerSr.index[-1]

        start = start_index
        while start < end_index:
            end = start + timedelta(hours=24)
            if end < end_index:
                end = end_index
            print "start check"
            start_afternoon = start.replace(hour=14, minute=0, second=0)
            end_afternoon = end.replace(hour=16, minute=0, second=0)
            start_night = start.replace(hour=22, minute=0, second=0)
            end_day = end + timedelta(days=1)
            end_night = end_day.replace(hour=9, minute=0, second=0)
            abnormal_A_afternoon = trendCheck.abnormalOn(self, powerSr,
                                                         start_afternoon,
                                                         end_afternoon, 50.0)
            abnormal_A_night = trendCheck.abnormalOn(self, powerSr, start_night,
                                                     end_night, 4.0)
            print abnormal_A_afternoon
            print abnormal_A_night

            start = end
        return None

if __name__ == "__main__":
    # test abnormalOn
    call = recommend()
    call.abnormalOn_airconditioner()
    exit()
    # test get temperature
    call = dataSource_cp('app.equotaenergy.com')
    call.getTemperature('88', '2016-01-22 20:30:00',
                        '2016-02-12 20:59:00', freq='30Min')
    exit()

    # test get power and electric
    call = dataSource_cp('app.equotaenergy.com')
    electricSr = call.getElectric('140', '2016-01-22 20:30:00',
                                  '2016-02-12 20:59:00', freq='60s')

    powerSr = call.getPower('140', '2016-02-22 20:30:00', '2016-02-22 20:59:00',
                            freq='60s')

    df = pd.concat([electricSr, powerSr], axis=1)
    print df
    print electricSr.values/powerSr.values

    exit()
