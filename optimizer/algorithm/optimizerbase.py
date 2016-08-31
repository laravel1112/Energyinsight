#!/usr/bin/python
# -*- coding: utf-8 -*-
import numpy as np
import calendar
import ciso8601
import base64
import urllib
import urllib2
import pandas as pd
import logging

from datetime import datetime, timedelta
from dateutil import parser

from optimizer.models import *
from common.models import InfluxdbSettings
from influxdb.influxdb08 import InfluxDBClient as InfluxDBClient08
from influxdb import InfluxDBClient as InfluxDBClient
from backend.models import EnergyUnit


def InfluxClient():
    try:
        influxdb_setting = InfluxdbSettings.objects.get(is_active=True)
    except Exception as e:
        logging.exception(e)
        influxdb_setting = InfluxdbSettings.objects.filter(name="Main")

    host_name = influxdb_setting.host_name
    host_port = influxdb_setting.host_port
    username = influxdb_setting.username
    password = influxdb_setting.password
    database = influxdb_setting.database

    return InfluxDBClient(host_name,
                          host_port,
                          username,
                          password,
                          database)


def InfluxClient08():
    try:
        influxdb_setting = InfluxdbSettings.objects.get(is_active=True)
    except Exception as e:
        logging.exception(e)
        # it means no is_active == True instance or more than 1 instance with is_Active = True
        influxdb_setting = InfluxdbSettings.objects.filter(name="Main")

    host_name = influxdb_setting.host_name
    host_port = influxdb_setting.host_port
    username = influxdb_setting.username
    password = influxdb_setting.password
    database = influxdb_setting.database
    return InfluxDBClient08(host_name,
                            host_port,
                            username,
                            password,
                            database)


class OptimizerBase(object):
    def util_start_optimizer(self, caller_name, optmizertask_id):

        # Check valid optmizertask entry
        opts = DailyOptimizerTask.objects.filter(id=optmizertask_id)

        if opts.count() != 1:
            raise ValueError(
                'invalid optimizer task Id %d with %d record in DailyOptimizerTask' % (optmizertask_id, opts.count()))

    def get_optimizer(self, optmizertask_id):

        opts = DailyOptimizerTask.objects.filter(id=optmizertask_id)

        if opts.count() != 1:
            raise ValueError(
                'invalid optimizer task Id %d with %d record in DailyOptimizerTask' % (optmizertask_id, opts.count()))
        else:
            return opts[0]

    def get_energyunit(self, opt_obj):

        return opt_obj.eu_target

    def convert_timestr_to_utc(self, timeStr, timeZoneStr=" +8"):
        # default timezone is Shanghai
        timeStr = timeStr + timeZoneStr
        parsedStr = parser.parse(timeStr)
        return calendar.timegm(parsedStr.utctimetuple())

    def get_timestamp(self, timeStr):

        # timezone info, Time style: 2014-01-01 00:00:00
        Time_local = parser.parse(timeStr + ' +8')

        # convert to unix time
        timestamp = int(calendar.timegm(Time_local.utctimetuple()))
        timestamp_str = str(timestamp) + 's'

        return (timestamp, timestamp_str)

    def get_series_data(self, energy_unit_ids=[], start_utc=None, end_utc=None,
                        limitcnt=None, operation=None, interval=None,
                        time_format='s', series_list=None):
        # start_utc and end_utc must be an integer of GMT UTC time !!

        # Query InfluxDb
        if not series_list:
            series_list = list(EnergyUnit.objects.filter(id=ID)[0].influxKey
                               for ID in energy_unit_ids)
        #name = '\"'+''.join([series+', ' for series in series_list])[:-2]+'\"'
        name = ''.join([series+', ' for series in series_list])[:-2]
        print name

        if operation == 'raw' or operation is None:

            sql = "select * from " + name
        else:
            sql = "select " + operation + " from " + name

        if not start_utc is None or not end_utc is None:
            if not start_utc is None and end_utc is None:
                sql += " where time > " + str(start_utc) + "s"
            elif start_utc is None and not end_utc is None:
                sql += " where time < " + str(end_utc) + "s"
            else:
                sql += " where time > " + str(start_utc) + "s" + " and time < " + str(end_utc) + "s"

        # interval: d, h, m
        if interval is not None:
            sql += " group by time(" + interval + ")"
        # points number
        if limitcnt is not None:
            sql += " limit " + str(limitcnt)

        client = InfluxClient()

        print "sql:", sql
        data = list(client.query(sql, epoch=time_format))

        results = []
        for series in data:
            columns = series[0].keys()
            columns.remove('time')
            columns.insert(0, 'time')
            points = [[point[column] for column in columns] for point in series]

            # points = [point for point in points if point[1:].count(None)!=len(point[1:])]

            results.append({"points": list(reversed(points)), "columns": columns, "usage": "总能耗"})

        return results

    def get_meter_data(self, meter_list=[], start_utc=None, end_utc=None,
                       limitcnt=None, operation=None, interval=None,
                       time_format='s'):

        series_list = list(EnergyUnit.objects.filter(id=ID)[0].influxKey
                           for ID in meter_list)

        results = self.get_series_data(start_utc=start_utc, end_utc=end_utc,
                                       limitcnt=limitcnt, operation=operation,
                                       interval=interval, time_format='s',
                                       series_list=series_list)

        return results


    # TODO: change limitcnt and
    def get_series_tail_utc(self, series_list):

        client = InfluxClient()
        name = '\"' + series_list[0] + '\"'
        for item in series_list[1:]:
            name += ', ' + '\"' + item + '\"'

        for year in range(2001, 2016):
            try:
                sqltest = "select * from " + name + "where time >'" + str(year) + "-01-01' and time < '" + str(
                    year + 1) + "-01-01' limit 1"
                sql = 'SELECT LAST("time") FROM ' + name
                results = client.query(sqltest, 's')
                # results = self.get_series_data(series_list = series_list,start_utc = datetime(1990,11,1,0,00,00,0,pytz.timezone('Asia/Shanghai')),limitcnt =1)
                return results[-1]['points'][0][0]
            except:
                pass
        return None

    def get_series_tip_utc(self, series_name):
        # return the latest sample utc time
        results = self.get_series_data(series_list=series_name, limitcnt=1)
        try:
            return results[0]['points'][0][0]
        except:
            return None

    # check-in missing data with 0 & group by hours
    def checkdata(data, time, fs):
        interval = fs * 60
        factor = 3600 / interval  # by hour
        num = len(titipme) // factor

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

    def put_series_data(self, data):
        try:
            json_body = list()
            app_json_body = json_body.append
            for point in data['points']:
                dict_body = {"measurement": data['name'], "time": point[0]}
                fields = dict()
                map(lambda x: fields.setdefault(x[0], x[1]),
                    zip(data['columns'][1:], point[1:]))
                dict_body.setdefault("fields", fields)
                app_json_body(dict_body)
            client = InfluxClient()
            result = client.write_points(json_body, 's')
            print result
            return result
        except Exception, e:
            print e
            return False

    def delete_series_data(self, series_list, start_utc=None, end_utc=None):
        try:
            name = ''.join([series+', ' for series in series_list])[:-2]
            sql = "delete from " + name
            if start_utc is not None and end_utc is not None:
                sql += " where time > " + str(start_utc) + "s"
                sql += " and time < " + str(end_utc) + "s"
            elif start_utc is not None and end_utc is None:
                sql += "  where time > " + str(start_utc) + "s"
            elif start_utc is None and end_utc is not None:
                sql += " where time < " + str(end_utc) + "s"
            else:
                return Fasle
            client = InfluxClient()
            print sql
            result = client.query(sql)
            print "result is ", result
            return result
        except Exception, e:
            print e
            return False

    def new_put_series_data(self, series_list, points, columns, resample_freq='5Min'):

        try:
            client = InfluxClient()
            # data=[]
            # points = eval(param['points']) ##### ! not consistent with previous api
            # columns = eval(param['columns'])
            energy_unit_id = series_list[0]
            objs = EnergyUnit.objects.filter(id=energy_unit_id)
            eu = objs[0]

            influxdb_series = eu.influxKey

            v = [{"name": influxdb_series, "columns": columns, "points": points}]
            data = json.dumps(v)

            print "put series payload: ", data

            # client.write_points(data, 's', 5000)
            client.write_points(data, 's')

        except Exception as err:
            logging.exception(err)
            return ("Error:", err)

    def dataResample(self, pointSr, freq, operation=None):  # pointSr(pandas Dataframe)

        pointSr_bias = pointSr.resample(self.freq_sampling)
        pointSr_fill = pointSr_bias.interpolate(limit=5, limit_direction='both')

        (total_missing, max_missing_hourly, missingList) = \
            self.dataMissing(pointSr_fill)

        if max_missing_hourly > 5:
            return pointSr.resample(freq, fill_method='pad')

        if operation is None:

            # which one is better? --Simo
            # return pointSr.resample(freq,fill_method='pad')

            return pointSr_fill.resample(freq).fillna(limit=10, method='pad', )
        else:
            return (pointSr_fill.fillna(0) / 60.0).resample(freq, how='sum')

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
        #########################################################################


class loadClient():
    # def __init__(self, login, password):
    #     self.user = login
    #     self.pswd = password
    def __init__(self):
        pass

    def sendingRequestToDB(self, user, pswd, url, data):
        try:
            # login = 'crowneplaza'
            # password = 'crowneplaza'
            base64string = \
                base64.encodestring('%s:%s' % (user, pswd)).replace('\n', '')

            # print base64string

            additional = {'User-Agent': 'Mozilla/5.0',
                          'Authorization': 'Basic %s' % base64string}
            req = urllib2.Request(url, data, additional)
            results = urllib2.urlopen(req).read()

            return results

        except Exception, e:
            logging.exception(e)
            return None

    def download(self, user, pswd, addr, energy_unit_id, start_utc=None,
                 end_utc=None, limit=None, disagg=None, time_format=None,
                 interval=None, operation=None):

        try:
            values = {'isExternalRequest': True, 'start_utc': start_utc,
                      'end_utc': end_utc, 'limit': limit, 'disagg': disagg,
                      'time_format': time_format, 'interval': interval,
                      'operation': operation}

            if start_utc is None or end_utc is None:
                values.pop('start_utc')
                values.pop('end_utc')

            if limit is None:
                values.pop('limit')

            if disagg is None:
                values.pop('disagg')

            if time_format is None:
                values.pop('time_format')

            if interval is None:
                values.pop('interval')

            if operation is None:
                values.pop('operation')

            data = urllib.urlencode(values)

            url = "http://" + addr + "/api/getseries/" + energy_unit_id + "/"

            results = json.loads(self.sendingRequestToDB(user, pswd, url, data))

            if results is None:
                return None

            points = results[0]['points']

            if len(points) == 0:
                logging.debug(energy_unit_id + " return blank results")
                return None

            timestampCol = list(zip(*reversed(points))[0])
            datetimeCol = map(datetime.fromtimestamp, timestampCol)
            valueCol = list(zip(*reversed(points))[-1])
            pointSr = pd.Series(valueCol, index=datetimeCol)
            return pointSr
        except:
            logging.debug(energy_unit_id + " failed to try download")
            return False

    def upload(self, user, pswd, addr, energy_unit_id, points, disagg=None):

        if len(points) == 0:
            return True

        try:
            values = {'isExternalRequest': True, 'points': points,
                      'disagg': disagg}

            if disagg is None:
                values.pop('disagg')

            data = urllib.urlencode(values)

            url = "http://" + addr + "/api/putseries/" + energy_unit_id + "/"

            results = self.sendingRequestToDB(user, pswd, url, data)
            if results == "True":
                return True
            else:
                logging.debug(energy_unit_id + " failed to upload !")
                return True
        except:
            logging.error(energy_unit_id + " failed to try uploading !")
            return False

    def remove(self, user, pswd, addr, energy_unit_id, start_utc, end_utc,
               disagg=None):
        points = []
        erase_flag = "True"
        try:
            values = {'isExternalRequest': True, 'points': points,
                      'start_utc': start_utc, 'end_utc': end_utc,
                      'disagg': disagg, 'erase_flag': erase_flag}
            if disagg is None:
                values.pop('disagg')

            data = urllib.urlencode(values)

            url = "http://" + addr + "/api/putseries/" + energy_unit_id + "/"

            results = self.sendingRequestToDB(user, pswd, url, data)
            if results == "True":
                return True
            else:
                logging.debug(energy_unit_id + " failed to remove !")
                return True
        except:
            logging.error(energy_unit_id + " failed to remove !")
            return False
