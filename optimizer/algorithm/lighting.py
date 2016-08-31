# -*- coding: utf-8 -*-
from time import gmtime
import sys
import pytz
from datetime import datetime, timedelta
import calendar
import numpy as np
import heapq
import scipy.stats
from optimizer.models import *
from optimizer.algorithm.optimizerbase import OptimizerBase
import math


def unitprice(htime):
    if (htime > 8 and htime <= 11) or (htime > 18 and htime <= 21):
        price = 1.2
    elif (htime > 6 and htime <= 8) or (htime > 11 and htime <= 18) or (htime > 21 and htime <= 22):
        price = 0.75
    else:
        price = 0.32
    return price


# value matrix No.Days*24h
def ConvertMatrix(data):
    num = len(data) // 24
    value = np.reshape(data[0:num * 24], (num, 24))
    return value


# convert standart time to date(string)
def ConvertTime(time):
    value_time = ConvertMatrix(time)
    value_time = value_time.tolist()
    return value_time


def ConvertDate(value_time):
    date = []
    for item in value_time:
        time_seconds = item[1]
        timestamp = gmtime(time_seconds)
        str_date = map(str, [timestamp[i] for i in range(3)])
        date.append('.'.join(str_date))
    return date


# check-in missing data with 0 & group by hours

def checkdata(data, time, fs):
    interval = fs * 60
    factor = 3600 / interval  # by hour
    num = len(time) // factor

    idx_checkin = []  # makeup missing data
    data_checkin = []
    time_checkin = []

    data_hourly = np.zeros(num, dtype=float)
    time_hourly = np.zeros(num, dtype=int)
    label_h = np.zeros(num, dtype=int)  # 24hours 0-23
    label_d = np.zeros(num, dtype=int)  # 7days 0-6

    for i in range(1, len(time)):
        if time[i] - time[i - 1] > interval:
            idx_checkin.append(i)
            data_checkin.append(0)
            time_checkin.append(time[i - 1] + interval)

    data_update = np.insert(data, idx_checkin, data_checkin)
    time_update = np.insert(time, idx_checkin, time_checkin)

    for i in range(1, num):
        timestamp = time_update[(i + 1) * factor - 1] + 8 * 3600  # convert timezone
        labels = gmtime(timestamp)

        data_hourly[i] = sum(data_update[i * factor:(i + 1) * factor])
        time_hourly[i] = timestamp
        label_h[i] = labels[3]
        label_d[i] = labels[6]

    return data_hourly, time_hourly, label_h, label_d


# mark days with broken data
def preprocessing(value):
    idx_abnormal = []
    for idx, x in enumerate(value):
        count_zero = len(np.where(x == 0)[0])
        if count_zero >= 6:
            idx_abnormal.append(idx)
        else:
            for j in range(1, 24):
                if x[j] == 0:
                    value[idx, j] = value[idx, j - 1]
    return value, idx_abnormal


# normalize
def norm_k(value, k):
    count = 0
    value_norm = np.zeros((len(value), 24))
    for idx, x in enumerate(value):
        if max(x) == min(x):
            count += 1
        else:
            maxk = heapq.nlargest(k, x)
            mink = heapq.nsmallest(k, x)
            value_norm[idx] = (x - np.mean(mink)) / (np.mean(maxk) - np.mean(mink))
    return value_norm


# zscore outlier
# value_outlier=[idx_day,[idx_outlier hours],[percent,value],...]
# threshold=1.5,normalization=0,1
def MarkOutlier(value, idx_abnormal, threshold, normalization, k):
    value_norm = norm_k(value, k)
    if normalization == 1:
        value_matrix = value_norm
    else:
        value_matrix = value

    idx_days = range(0, len(value_matrix), 1)
    idx_normal = [item for item in idx_days if item not in idx_abnormal]
    value_median = np.median(value[idx_normal], axis=0)

    z_matrix = np.zeros((len(idx_normal), 24))
    z_label = np.zeros((len(value_matrix), 24))
    value_outlier = []

    for j in range(24):
        z_matrix[:, j] = scipy.stats.mstats.zscore(value_matrix[idx_normal, j])

    for i in range(len(idx_normal)):
        idx = idx_normal[i]  # Ture day index
        z_label[idx, z_matrix[i] >= threshold] = 1
        z_label[idx, z_matrix[i] <= -threshold] = -1

        idx_outlier = np.where(z_label[idx] == 1)[0]
        sequence_outlier = sublist(idx_outlier)

        if len(sequence_outlier) >= 1:
            tmp = [idx]
            for item in sequence_outlier:
                overweight = sum(value[idx, item]) / sum(value_median[item])
                overweight_value = sum(value[idx, item]) - sum(value_median[item])
                if overweight > 1:
                    tmp.append(item)
                    tmp.append([overweight, overweight_value])
            if len(tmp) > 1:
                value_outlier.append(tmp)

    return z_label, value_outlier, z_matrix


# arr: index of z_label=1
def sublist(arr):
    sequence = []
    for i in range(len(arr) - 1):
        if arr[i] not in sum(sequence, []):
            tmp = []
            while arr[i] >= arr[i + 1] - 2:
                tmp.append(arr[i])
                i += 1
                if i == len(arr) - 1:
                    break
            if len(tmp) > 1:
                tmp.append(arr[i])
                sequence.append(tmp)
    return sequence


def recommendation(value_outlier, time):
    # Date-String
    value_time = ConvertTime(time)
    date = ConvertDate(value_time)
    #
    power_overused = 0
    cost_overused = 0

    str_overused = ''
    for item in value_outlier:
        # str_day='\n'+'During day '+str(item[0]+1)+': '
        str_day = '\n' + '在' + date[item[0]] + ': '
        str_overused += str_day

        num_outlier = (len(item) - 1) / 2
        for i in range(num_outlier):
            idx_outlier = item[i * 2 + 1]  # i-th hour
            power_overused += item[(i + 1) * 2][1]  # power in i-th hour
            cost_overused += unitprice(idx_outlier[0] + 1) * item[(i + 1) * 2][1]

            str_time = '从' + str(idx_outlier[0] + 1) + ':00到' + str(idx_outlier[-1] + 1) + ':00, '
            str_power = '比通常多消耗了' + str(item[(i + 1) * 2][1]) + 'kWh (' + str(
                int((item[(i + 1) * 2][0] - 1) * 1e3) / 1e1) + '%)的电力. '
            str_overused += str_time + str_power

        str_overused += '\n'
    return power_overused, cost_overused, str_overused


def lighting_pattern(data, time, interval, fs, threshold=1, normalization=1, k=3):
    data, time, label_h, label_d = checkdata(data, time, fs)
    value = ConvertMatrix(data)
    value, idx_abnormal = preprocessing(value)
    z_label, value_outlier, z_matrix = MarkOutlier(value, idx_abnormal, threshold, normalization, k)

    if len(value) > interval:
        idx_test = set(range(len(value) - interval, len(value)))
    else:
        idx_test = set(range(0, len(value)))

    idx_outlier_data = [item[0] for item in value_outlier]
    idx_outlier_test = [i for i, item in enumerate(idx_outlier_data) if item in idx_test]

    # ourliers for certain past 'interval' days
    value_outlier_test = [value_outlier[i] for i in idx_outlier_test]
    power_overused, cost_overused, str_overused = recommendation(value_outlier_test, time)

    str_analysis = ''
    str_analysis += '在过去的' + str(interval) + '天, '
    str_analysis += '比通常多消耗了' + str(power_overused) + ' kWh的电力。 具有' + str(cost_overused) + '元的电费削减潜力。'
    str_analysis += '可能是由于在具体时段内用电模式的变化,带来了过度的电力消耗。 详情如下, \n'

    str_suggestion = '节能建议: \n'
    str_suggestion += '减少冗余的灯光开启和过度使用；在客房内安装日光感应设备，减少室内照明的浪费。'

    str_analysis += str_overused

    return value_outlier, str_analysis, str_suggestion


#####################################################
def getDate(timestamp):
    tm_wday = gmtime(timestamp)[6] + 1
    tm_yday = gmtime(timestamp)[7]
    return (tm_wday, tm_yday)


def ConvertPeriod(data, time, label_h, label_d):
    # Daily data
    value_night = []
    time_night = []
    value_weekend = []
    time_weekend = []

    # night:23:00 to 6:00 (label=22 to 29)
    idx_night = [i for i, item in enumerate(label_h) if (item >= 22 or item <= 5)]
    # weekend: Sat,Sun
    idx_weekend = [i for i, item in enumerate(label_d) if (item >= 5)]

    # sum up each night
    value_night_hour = data[idx_night]
    time_night_hour = time[idx_night]
    label_night_hour = label_h[idx_night]
    for i in range(len(label_night_hour)):
        if label_night_hour[i] <= 5:
            label_night_hour[i] += 24

    for i in range(len(value_night_hour)):
        if i == 0:
            tmp = value_night_hour[i]
        else:
            if label_night_hour[i] > label_night_hour[i - 1]:
                tmp += value_night_hour[i]
            else:
                value_night.append(tmp)
                time_night.append(time_night_hour[i - 1])
                tmp = value_night_hour[i]
    value_night.append(tmp)
    time_night.append(time_night_hour[i])

    # sum up each weekend
    value_weekend_hour = data[idx_weekend]
    time_weekend_hour = time[idx_weekend]
    label_weekend_day = label_d[idx_weekend]
    for i in range(len(value_weekend_hour)):
        if i == 0:
            tmp = value_weekend_hour[i]
        else:
            if label_weekend_day[i] == label_weekend_day[i - 1]:
                tmp += value_weekend_hour[i]
            else:
                value_weekend.append(tmp)
                time_weekend.append(time_weekend_hour[i - 1])
                tmp = value_weekend_hour[i]
    value_weekend.append(tmp)
    time_weekend.append(time_weekend_hour[i])

    return value_night, time_night, value_weekend, time_weekend


def rlowess(y, fraction=0.15, iter=3):
    n = len(y)
    x = np.linspace(0, 100, n)
    r = int(math.ceil(n * fraction))
    h = [np.sort(np.abs(x - x[i]))[r] for i in range(n)]
    w = np.clip(np.abs((x[:, None] - x[None, :]) / h), 0.0, 1.0)
    w = (1 - w ** 3) ** 3
    y_est = np.zeros(n)
    delta = np.ones(n)
    for iteration in range(iter):
        for i in range(n):
            weights = delta * w[:, i]
            b = np.array([np.sum(weights * y), np.sum(weights * y * x)])
            A = np.array([[np.sum(weights), np.sum(weights * x)],
                          [np.sum(weights * x), np.sum(weights * x * x)]])
            beta = scipy.linalg.solve(A, b)
            y_est[i] = beta[0] + beta[1] * x[i]

        residuals = y - y_est
        s = np.median(np.abs(residuals))
        delta = np.clip(residuals / (6.0 * s), -1, 1)
        delta = (1 - delta ** 2) ** 2
    return y_est


# errors to rlowess smooth(for data_daily)

def errlist(value, fraction=0.15):
    err = []
    value_est = rlowess(value, fraction)

    for i in range(len(value)):
        error = value[i] - value_est[i]
        err.append(error)

    return err


def transpose(data):
    dataT = map(list, zip(*data))
    return dataT


def dist(x1, x2):  # Compute distance between any two point
    dist = abs(x1 - x2)
    return dist


def Nkdist(test, train, k):
    distlist = []
    for i in range(len(train)):  # built distance list
        distlist.append(dist(test, train[i]))
    index = [sorted(distlist).index(i) for i in distlist]
    index = index[:k]
    return index


def knnd(test, train, k):
    distlist = []
    for item in train:  # built distance list
        distlist.append(dist(test, item))
    mindist = heapq.nsmallest(k, distlist)
    mindist.sort()
    Mind = mindist[-1]
    return Mind


def LOF(data, label, Minpts, nstd):
    N = len(data)
    LOFlist = []
    for index, p in enumerate(data):

        sys.stdout.write('Calculating LOF: ' + str(index * 100 / (N - 1)) + '%')
        sys.stdout.flush()
        sys.stdout.write('\r')

        test = p
        # p: test instance
        train = data[:index] + data[index + 1:]
        Nindex_p = Nkdist(test, train, Minpts)
        # Nindex: Index of k-distance neighborhoods of p

        rdist = 0
        # rdist: reachability distance of p
        for i in Nindex_p:
            test = data[i]
            train = data[:i] + data[i + 1:]
            rdist += max(knnd(test, train, Minpts), dist(p, test))
        LRD_p = Minpts / rdist
        # LRD_p: local reachability density of p

        LRD_q = 0
        for idx in Nindex_p:
            test = data[idx]
            train = data[:idx] + data[idx + 1:]
            Nindex_q = Nkdist(test, train, Minpts)

            rdist = 0
            for i in Nindex_q:
                test2 = data[i]
                train2 = data[:i] + data[i + 1:]
                rdist += max(knnd(test2, train2, Minpts), dist(test, test2))
            LRD_q += Minpts / rdist
        LOF = LRD_q / LRD_p / Minpts
        LOFlist.append([LOF, data[index], label[index]])

    LOFlist.sort(reverse=-1)
    LOF_t = transpose(LOFlist)
    mean = sum(LOF_t[0]) / N
    std = math.sqrt(sum((x - mean) ** 2 for x in LOF_t[0]) / (N - 1))

    for j, x in enumerate(LOF_t[0]):
        if x < mean + std * nstd:  # Threshold std*n
            break
    LOFlist = LOFlist[:j]
    LOFlist = [item for item in LOFlist if item[1] > 0]
    # sorted by timelabel
    LOFlist = sorted(LOFlist, key=lambda LOFlist: LOFlist[2], reverse=-1)
    return LOFlist


def lighting_outlier(data, time, fs):
    data, time, label_h, label_d = checkdata(data, time, fs)
    value_night, time_night, value_weekend, time_weekend = ConvertPeriod(data, time, label_h, label_d)

    err_night = errlist(value_night, fraction=0.15)
    err_weekend = errlist(value_weekend, fraction=0.15)
    # [LOFvalue,error,time]
    LOFlist_night = LOF(err_night, time_night, Minpts=7, nstd=1.5)
    LOFlist_weekend = LOF(err_weekend, time_weekend, Minpts=7, nstd=1.5)

    str_outlier = ''
    str_outlier += '在过去一年中，有' + str(len(LOFlist_night)) + '个夜晚灯光能耗较大。\n'
    str_outlier += '在最近的' + '.'.join(
        map(str, [gmtime(LOFlist_night[0][2])[i] for i in range(3)])) + '，比通常的晚上多消耗了' + str(
        LOFlist_night[0][1]) + 'Kwh的电力，具有' + str(LOFlist_night[0][1] * unitprice(0)) + '元的电费削减潜力。\n'

    str_outlier += '在过去一年中，有' + str(len(LOFlist_weekend)) + '个周末灯光能耗较大。\n'
    str_outlier += '在最近的' + '.'.join(
        map(str, [gmtime(LOFlist_weekend[0][2])[i] for i in range(3)])) + '，比通常的周末多消耗了' + str(
        LOFlist_weekend[0][1]) + 'Kwh的电力，具有' + str(LOFlist_weekend[0][1] * unitprice(12)) + '元的电费削减潜力。\n'

    return LOFlist_night, LOFlist_weekend, str_outlier


class LightingOptimizer(OptimizerBase):
    def __init__(self, optmizertask_id):
        self.myopt_id = optmizertask_id
        # parameters

    def dailypatterncheck(self):
        # parameters #
        interval = 30  # Number of past n days for test
        threshold = 1.5  # zscore>=1.5
        normalization = 1  # whether use normalized data [0,1]
        k = 3  # use k-th max/min datapoints to normalize
        fs = 60  # sampling rate

        # get optimizer object
        opt_obj = OptimizerBase.get_optimizer(self, self.myopt_id)

        # influx series name
        series_name = [opt_obj.lighting_series_light.encode('utf-8')]

        # determine Start and End Time 
        # IMPORTANT to make sure datetime are in Shanghai TZ
        curTime = datetime.now(pytz.timezone('Asia/Shanghai'))
        tipTime = datetime.fromtimestamp(OptimizerBase.get_series_tip_utc(self, series_name),
                                         tz=pytz.timezone('Asia/Shanghai'))

        if (curTime - tipTime).days >= 2:
            curTime = tipTime

        endTime = curTime.replace(hour=0, minute=0, second=0, microsecond=0)

        startTime = endTime - timedelta(days=365)

        # fetch data
        datalist = OptimizerBase.get_series_data(self, series_list=series_name,
                                                 start_utc=calendar.timegm(startTime.utctimetuple()),
                                                 end_utc=calendar.timegm(endTime.utctimetuple()))

        datapoints = datalist[0]['points']

        # hourly data (assuming starting from 1:00), data is reverted
        data = np.array(list(reversed(zip(*datapoints)[2])))
        time = np.array(list(reversed(zip(*datapoints)[0])))

        # value_outlier=[idx_day,[idx_outlier hours],[percent,value],...]
        # str_analysis:x contents for recommendation
        value_outlier, str_analysis, str_suggestion = lighting_pattern(data, time, interval, fs, threshold,
                                                                       normalization, k)

        LOFlist_night, LOFlist_weekend, str_outlier = lighting_outlier(data, time, fs)
