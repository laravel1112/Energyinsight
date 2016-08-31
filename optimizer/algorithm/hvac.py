#!/usr/bin/python
# -*- coding: utf-8 -*-

'''
Filename: hvac.py
Description: 1. check match between hvac(compressor, pump, fan) and temp
                every 30 days and daily data
             2. check match between compressor and pump
                every 30 days and hourly data

Author: Rich
Change Activity:
    2015.12.4 modify havc and temp checing
'''

from __future__ import division
import calendar
import copy
import numpy as np
import pytz
import time
from datetime import datetime
from datetime import timedelta
from scipy.signal import savgol_filter
from scipy.stats import pearsonr
from scipy.stats.mstats import zscore
import logging

from optimizer.models import *
from optimizer.algorithm.optimizerbase import OptimizerBase
from dateutil import parser


class HvacOptimizer(OptimizerBase):
    def __init__(self, optimizertask_id):
        self.myopt_id = optimizertask_id
        self.tz_local = pytz.timezone('Asia/Shanghai')

    def dailymatchcheck(self):

        # get optimizer object
        opt_obj = OptimizerBase.get_optimizer(self, self.myopt_id)

        # determine Start and End Time
        # IMPORTANT to make sure datetime are in Shanghai TZ
        series_name = [opt_obj.hvac_series_compressor.encode('utf-8')]
        curTime = datetime.now(pytz.timezone('Asia/Shanghai'))
        tipTime = datetime.fromtimestamp(OptimizerBase.get_series_tip_utc(self, series_name),
                                         tz=pytz.timezone('Asia/Shanghai'))

        # if no data update, query same data
        if (curTime - tipTime).days >= 2:
            curTime = tipTime

        endTime = curTime.replace(hour=0, minute=0, second=0, microsecond=0)

        startTime = endTime - timedelta(days=30)
        # t1 = '2014-07-01 01:00:00'
        # t2 = '2014-08-01 01:00:00'
        # startTime = parser.parse(t1 + ' +8')
        # endTime = parser.parse(t2 + ' +8')

        # print startTime, endTime

        name_compressor = [opt_obj.hvac_series_compressor.encode('utf-8')]
        name_pump_chiller = [opt_obj.hvac_series_pump_chiller.encode('utf-8')]
        name_pump_cooling = [opt_obj.hvac_series_pump_cooling.encode('utf-8')]
        name_temp = [opt_obj.hvac_series_temp.encode('utf-8')]

        # fetch data exmaple
        # datalist = OptimizerBase.get_series_data(self, series_list=[series_name],
        #    start_utc = calendar.timegm(startTime.utctimetuple()),
        #    end_utc = calendar.timegm(endTime.utctimetuple()))

        # fetch data

        results = OptimizerBase.get_series_data(self, series_list=name_compressor,
                                                start_utc=calendar.timegm(startTime.utctimetuple()),
                                                end_utc=calendar.timegm(endTime.utctimetuple()), operation='sum',
                                                interval='1h')
        data = {}
        for index, name in enumerate(name_compressor):
            points = list(reversed(results[index]['points']))
            data.setdefault(name, points)
        data_compressor = [name_compressor, data]

        results = OptimizerBase.get_series_data(self, series_list=name_pump_chiller,
                                                start_utc=calendar.timegm(startTime.utctimetuple()),
                                                end_utc=calendar.timegm(endTime.utctimetuple()), operation='sum',
                                                interval='1h')
        data = {}
        for index, name in enumerate(name_pump_chiller):
            points = list(reversed(results[index]['points']))
            data.setdefault(name, points)
        data_pump_chiller = [name_pump_chiller, data]

        results = OptimizerBase.get_series_data(self, series_list=name_pump_cooling,
                                                start_utc=calendar.timegm(startTime.utctimetuple()),
                                                end_utc=calendar.timegm(endTime.utctimetuple()), operation='sum',
                                                interval='1h')
        data = {}
        for index, name in enumerate(name_pump_cooling):
            points = list(reversed(results[index]['points']))
            data.setdefault(name, points)
        data_pump_cooling = [name_pump_cooling, data]

        data = OptimizerBase.get_series_data(self, series_list=name_temp,
                                             start_utc=calendar.timegm(startTime.utctimetuple()),
                                             end_utc=calendar.timegm(endTime.utctimetuple()), operation='mean',
                                             interval='1h')
        data = {}
        for index, name in enumerate(name_temp):
            points = list(reversed(results[index]['points']))
            data.setdefault(name, points)
        data_temp = [name_temp, data]

        try:
            # run optimizer
            print "启动HVAC每日常规监测：", startTime, '~', endTime

            print "1. 制冷机组运行负荷监测（周期：30天）"
            print self.match_compressor_temp(data_compressor, data_temp)
            print '=================================='
            print self.match_compressor_pump(data_compressor, data_pump_chiller, data_pump_cooling)
        except Exception as e:
            logging.exception("Fail to run")

        return None

    def match_compressor_pump(self, data_compressor, data_pump_chiller, data_pump_cooling):

        # checking correlation between compressor and pump
        for i, compressor in enumerate(data_compressor[0]):
            suggestion = '针对' + compressor + '分别检查冷却泵和冷冻泵变频性能：\n'
            suggestion += '启动冷却泵变频性能监测：在过去的30天中，'

            y = []
            y_timestamp = []
            for item in data_compressor[1][compressor]:
                y.append(item[1])
                y_timestamp.append(item[0])
            y = np.array(y)

            # check correlation between compressor and pump_chiller
            for j, pump in enumerate(data_pump_chiller[0]):
                suggestion += pump
                x = []
                for item in data_pump_chiller[1][pump]:
                    x.append(item[1])
                x = np.array(x)

                if pearsonr(x, y)[0] < 0.4:
                    # print compressor + '~' + pump + ':' + str(pearsonr(x, y)[0]) + "-->" + "Bad match !!!"
                    suggestion += '未能正常进行变频运行，能源浪费严重。 \n'
                    suggestion += '节能建议：立即检查冷却泵变频排除故障，或者加装冷却泵变频装置。\n'
                elif pearsonr(x, y)[0] > 0.7:
                    # print compressor + '~' + pump + ':' + str(pearsonr(x, y)[0]) + "-->" + "Good match !!!"
                    suggestion += '变频性能良好，变频装置运行正常。\n'

                    (outlier, e_saving, m_saving, time_outlier) = self.saving(y, x, y_timestamp)
                    if len(time_outlier) > 0:
                        suggestion += '但在如下时间段仍存在能源浪费情况：\n'
                        for t in time_outlier:
                            suggestion += time.asctime(t) + '，冷却泵运行负荷过高\n'
                    suggestion += '节能潜力：' + str(e_saving) + ' kWh；' + '¥' + str(m_saving) + '\n'
                    suggestion += '节能建议：对冷却泵的变频装置进行定期的检查和维护。\n'
                    # print e_saving, m_saving
                else:
                    # print compressor + '~' + pump + ':' + str(pearsonr(x, y)[0]) + "-->" + "Medium match !!!"
                    # (outlier, e_saving, m_saving) = self.saving(y, x, y_timestamp)
                    # print e_saving, m_saving
                    suggestion += '变频性能较好，变频装置运行未处于最佳状态，存在延迟现象，并如下时间段产生能源浪费情况：\n'

                    (outlier, e_saving, m_saving, time_outlier) = self.saving(y, x, y_timestamp)

                    for t in time_outlier:
                        suggestion += time.asctime(t) + '，冷却泵运行负荷过高\n'
                    suggestion += '节能潜力：' + str(e_saving) + ' kWh；' + '¥' + str(m_saving) + '\n'
                    suggestion += '节能建议：尽快对冷却泵的变频装置进行检查和维护。\n'

            suggestion += '启动冷却泵变频性能监测：在过去的30天，'
            # check correlation between compressor and pump_cooling
            for j, pump in enumerate(data_pump_cooling[0]):
                suggestion += '冷冻泵' + pump
                x = []
                for item in data_pump_cooling[1][pump]:
                    x.append(item[1])
                x = np.array(x)

                if pearsonr(x, y)[0] < 0.4:
                    # print compressor + '~' + pump + ':' + str(pearsonr(x, y)[0]) + "-->" + "Bad match !!!"
                    suggestion += '未能正常进行变频运行，能源浪费严重。 \n'
                    suggestion += '节能建议：立即检查冷冻泵变频排除故障，或者加装冷却泵运行变频装置。\n'

                elif pearsonr(x, y)[0] > 0.7:
                    # print compressor + '~' + pump + ':' + str(pearsonr(x, y)[0]) + "-->" + "Good match !!!"
                    # (outlier, e_saving, m_saving) = self.saving(y, x, y_timestamp)
                    # print e_saving, m_saving
                    suggestion += '变频性能良好，变频装置运行正常。\n'

                    (outlier, e_saving, m_saving, time_outlier) = self.saving(y, x, y_timestamp)

                    if len(time_outlier) > 0:
                        suggestion += '但在如下时间段仍存在能源浪费情况：\n'
                        for t in time_outlier:
                            suggestion += time.asctime(t) + '，冷冻泵运行负荷过高\n'
                    suggestion += '节能潜力：' + str(e_saving) + ' kWh；' + '¥' + str(m_saving) + '\n'
                    suggestion += '节能建议：对冷冻泵的变频装置进行定期的检查和维护。\n'

                else:
                    # print compressor + '~' + pump + ':' + str(pearsonr(x, y)[0]) + "-->" + "Medium match !!!"
                    # (outlier, e_saving, m_saving) = self.saving(y, x, y_timestamp)
                    # print e_saving, m_saving
                    suggestion += '变频性能较好，变频装置运行未处于最佳状态，存在延迟现象，并如下时间段产生能源浪费情况：\n'

                    (outlier, e_saving, m_saving, time_outlier) = self.saving(y, x, y_timestamp)

                    for t in time_outlier:
                        suggestion += time.asctime(t) + '，冷冻泵运行负荷过高\n'
                    suggestion += '节能潜力：' + str(e_saving) + ' kWh；' + '¥' + str(m_saving) + '\n'
                    suggestion += '节能建议：尽快对冷冻泵的变频装置进行检查和维护。'

        return suggestion

    def match_compressor_temp(self, data_compressor, data_temp):

        # suggestion = '启动制冷主机运行负荷变频性能监测：在过去的30天中，'
        # checking correlation between compressor and temperature
        for compressor in data_compressor[0]:
            # suggestion = compressor + '---------->\n'

            # convert to one-d temperature
            values = []
            for item in data_compressor[1][compressor]:
                values.append(item[1])

            for temp in data_temp[0]:
                x = []
                y = []
                y_timestamp = []
                operatingID = []
                for i, item in enumerate(data_temp[1][temp]):
                    if values[i] > 50:
                        x.append(item[1])
                        y.append(values[i])
                        y_timestamp.append(data_compressor[1][compressor][i][0])
                        operatingID.append(i)

                if len(y) == 0:
                    suggestion = '检查周期内，制冷机组处于待机状态。\n'
                    return suggestion
                else:
                    suggestion = '检查周期内，制冷机组的运行时段为：\n'
                    operatingTime = []
                    for j, ID in enumerate(operatingID):
                        if j == 0:
                            start = ID
                            operatingInterval = [start, None]
                        else:
                            end = ID
                            if end - start == 1:
                                start = end
                            else:
                                operatingInterval[1] = start
                                interval = copy.deepcopy(operatingInterval)
                                operatingTime.append(interval)
                                operatingInterval[0] = end
                                start = end
                    for j in range(len(operatingID) - 1, 0, -1):
                        if j == len(operatingID) - 1:
                            start = operatingID[j]
                        else:
                            end = operatingID[j]
                            if start - end == 1:
                                start = end
                            else:
                                break
                    operatingTime.append([start, operatingID[-1]])

                    for index, interval in enumerate(operatingTime):
                        start = data_compressor[1][compressor][interval[0]][0]
                        end = data_compressor[1][compressor][interval[1]][0]
                        operatingTime[index][0] = time.asctime(
                            (datetime.fromtimestamp(start, self.tz_local)).timetuple())
                        operatingTime[index][1] = time.asctime((datetime.fromtimestamp(end, self.tz_local)).timetuple())
                x = np.array(x)
                y = np.array(y)

                if pearsonr(x, y)[0] < 0.4:
                    # print compressor + '~' + 'T = ' + str(np.mean(x)) + 'ºC: ' + str(pearsonr(x, y)[0]) + "-->" + "Bad match !!!"
                    suggestion += '制冷主机未能正常进行变频运行，能源浪费严重。 \n'
                    suggestion += '节能建议：立即检查冷冻泵变频排除故障，或者加装制冷机运行变频装置。\n'

                elif pearsonr(x, y)[0] > 0.7:
                    # print compressor + '~' + 'T = ' + str(np.mean(x)) + 'ºC: ' + str(pearsonr(x, y)[0]) + "-->" + "Good match !!!"
                    # (outlier, e_saving, m_saving) = self.saving(y, x, y_timestamp)
                    # print e_saving, m_saving
                    suggestion += '制冷主机变频性能良好，变频装置运行正常。\n'

                    (outlier, e_saving, m_saving, time_outlier) = self.saving(y, x, y_timestamp)
                    if len(time_outlier) > 0:
                        suggestion += '但在如下时间段仍存在能源浪费情况：\n'
                        for index, t in enumerate(time_outlier):
                            suggestion += time.asctime(t) + '，主机冷量过高,该时段气温为' + str(outlier[index][1]) + 'ºC\n'
                    suggestion += '节能潜力：' + str(e_saving) + ' kWh；' + '¥' + str(m_saving) + '\n'
                    suggestion += '节能建议：对制冷主机的变频装置进行定期的检查和维护。\n'

                else:
                    # print compressor + '~' + 'T = ' + str(np.mean(x)) + 'ºC: ' + str(pearsonr(x, y)[0]) + "-->" + "Medium match !!!"
                    # (outlier, e_saving, m_saving) = self.saving(y, x, y_timestamp)
                    # print e_saving, m_saving
                    suggestion += '制冷主机变频性能较好，变频装置运行未处于最佳状态，存在延迟现象，并如下时间段产生能源浪费情况：\n'

                    (outlier, e_saving, m_saving, time_outlier) = self.saving(y, x, y_timestamp)

                    for index, t in enumerate(time_outlier):
                        suggestion += time.asctime(t) + '，主机冷量过高,该时段气温为' + str(outlier[index][1]) + 'ºC\n'
                    suggestion += '节能潜力：' + str(e_saving) + ' kWh；' + '¥' + str(m_saving) + '\n'
                    suggestion += '节能建议：对制冷主机的变频装置进行定期的检查和维护。\n'

        return suggestion

    def saving(self, x, y, y_timestamp):

        # tz_local = pytz.timezone('Asia/Shanghai')
        (outlier_id, z_score) = self.z_score(y)
        outlier = []
        for index in outlier_id:
            if z_score[index] > 0.0:
                outlier.append([y_timestamp[index], x[index], y[index]])

        x = list(x)
        y = list(y)
        x_fit = []
        y_fit = []
        for index in range(len(x)):
            if index not in outlier_id:
                x_fit.append(x[index])
                y_fit.append(y[index])
        (k, b) = self.leastsq(np.array(x), np.array(y))
        e_saving = 0.0
        m_saving = 0.0
        time_outlier = []
        for item in outlier:
            e_saving_temp = item[2] - (k * item[1] + b)
            e_saving += e_saving_temp
            t_local = datetime.fromtimestamp(item[0], self.tz_local)
            # print t_local.timetuple()
            time_outlier.append(t_local.timetuple())
            if t_local.timetuple()[3] in range(0, 6):
                m_saving += e_saving_temp * 0.292
            elif t_local.timetuple()[3] in range(6, 8):
                m_saving += e_saving_temp * 0.769
            elif t_local.timetuple()[3] in range(8, 11):
                m_saving += e_saving_temp * 1.231
            elif t_local.timetuple()[3] in range(11, 13):
                m_saving += e_saving_temp * 0.769
            elif t_local.timetuple()[3] in range(13, 15):
                m_saving += e_saving_temp * 1.231
            elif t_local.timetuple()[3] in range(15, 18):
                m_saving += e_saving_temp * 0.769
            elif t_local.timetuple()[3] in range(18, 21):
                m_saving += e_saving_temp * 1.231
            elif t_local.timetuple()[3] in [21]:
                m_saving += e_saving_temp * 0.769
            else:
                m_saving += e_saving_temp * 0.292

        return (outlier, e_saving, m_saving, time_outlier)

    def z_score(self, y):

        wspan = 7
        polyorder = 2
        thresh = 3

        y_filtered = savgol_filter(y, wspan, polyorder, mode='nearest')
        err = y - y_filtered
        z_score = zscore(err)
        outlier_id = []
        for index in range(len(z_score)):
            if abs(z_score[index]) > thresh:
                outlier_id.append(index)

        return (outlier_id, z_score)

    def leastsq(self, x, y):

        # print "The correlation coeff is ", pearsonr(x, y)[0]

        meanx = sum(x) / len(x)  # 求x的平均值
        meany = sum(y) / len(y)  # 求y的平均值

        xsum = 0.0
        ysum = 0.0

        for i in range(len(x)):
            xsum += (x[i] - meanx) * (y[i] - meany)
            ysum += (x[i] - meanx) ** 2

        k = xsum / ysum
        b = meany - k * meanx

        return k, b
