import pytz
import calendar
import pandas as pd
import numpy as np
import logging

from time import gmtime
from datetime import timedelta

from optimizer.models import *
from optimizer.algorithm.optimizerbase import OptimizerBase
from common.models import InfluxdbSettings
from influxdb.influxdb08 import InfluxDBClient


class DataCleaner():
    # check-in missing data with 0 & group by N min
    def checkdata(self, data, time, fs, N):
        interval = fs * N
        factor = N * 60 / interval  # by hour
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

        # return data_h, time_h, label_h, label_d
        # data_h and time_h are not defined
        return label_h, label_d

    def preprocess(self, data):
        # if data[0]==0:
        # data[0]=np.mean(data[1:10])

        for i in range(1, len(data)):
            ratio = abs(data[i] - data[i - 1]) / data[i - 1]
            # if data[i]==0 or ratio>=2:
            if ratio >= 2:
                data[i] = data[i - 1]
        return data


class DataSpec():
    def appID(self, label):
        return label

    def apptype(self, label):
        return

    def walts(self, label):
        return

    def counts(self, label):
        return

    def outputSegment(self, label):
        SegDef = ['cooling', 'heating', 'lighting_plug', 'mechanics', 'motor', 'misc']
        Segment = SegDef[label[4]]
        return Segment


def InfluxClient():
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
    return InfluxDBClient(host_name,
                          host_port,
                          username,
                          password,
                          database)


class DataFactory(OptimizerBase):
    def __init__(self, optmizertask_id):
        self.myopt_id = optmizertask_id
        # parameters
        # Meter Specification

    def InitMeterSpec(self):
        # build graphspec from eu id
        # get optimizer object
        opt_obj = OptimizerBase.get_optimizer(self, int(self.myopt_id))
        # TODO: kning

    def SetTestMeters(self, meterspec=[]):
        self.MeterSpec = meterspec

    # mainMeter stands for the whole building
    def SetMainMeter(self, mainMeter):
        self.MainMeter = mainMeter



    def devbackend_api_DataProcess(self, debug=False, startTime=None, endTime=None, disagg=None, interval=None, operation=None):


        output_5min = {}

        series_name = []

        self.MeterSpec = sorted(self.MeterSpec,key = lambda x:x['seriesName'])

        for meter in self.MeterSpec:

            # Clean Input Meter Data and resample into 1min


            series_name.append(meter['seriesName'])

        try:
            datalist = OptimizerBase.get_series_data(self, series_list=series_name,
                                                         start_utc=startTime,
                                                         end_utc=endTime, interval=interval,operation=operation)
        except Exception as e:
            print("Downloading Error:",e)

        ind = 0
        for meter in self.MeterSpec:
            try:
                datapoints = datalist[ind]['points']
            except:
                continue

            data = np.array(list(reversed(zip(*datapoints)[1])))
            time = np.array(list(reversed(zip(*datapoints)[0])))

            ts = pd.Series(data, index=pd.to_datetime(time, unit='s', utc=True).tz_convert('Asia/Shanghai'))

            # add interpolate case everything is none/ only a few points are null

            ts = ts.interpolate(limit = 10)

            ts = ts.fillna(value = 0)

            if len(meter['Loads']) == 1:
                # When there is only one load

                datatype = meter['Loads'][0]['outputSegment']
                # accumulate on the output series
                if datatype not in output_5min:
                    output_5min[datatype] = ts;
                else:
                    output_5min[datatype] = output_5min[datatype].add(ts, fill_value=0)
                    # output_5min[datatype] += ts
                output_5min[datatype].fillna(0, inplace=True)
                # if debug:
                # fig = plt.figure()
                # output_5min[datatype].plot()
                # fig.suptitle("output_5min"+series_name[0], fontsize=14, fontweight='bold')
                # plt.show

                #if 'total' not in output_5min:
                #    output_5min['total'] = ts
                #else:
                #    output_5min['total'] += ts
                #output_5min['total'].fillna(0, inplace=True)


            else:
                pass
            ind +=1

        # compute the differences between 'total' and rest of datatype
        if 'total' in output_5min:
            unknown_ts = output_5min['total'];
            for si_type, si_ts in output_5min.iteritems():
                if si_type != 'total':
                    unknown_ts -= si_ts
                    unknown_ts[ unknown_ts <0 ] = 0

            output_5min['uncategorized'] = unknown_ts
            

        if not debug:
            return output_5min

        else:
            logging.debug("output_5min's length is " + str(len(output_5min)))
            return output_5min


    def backend_api_DataProcess(self, debug=False, startTime=None, endTime=None, disagg=None, interval=None):
        output_5min = {}

        series_name = []

        for meter in self.MeterSpec:

            # Clean Input Meter Data and resample into 1min

            series_name = [meter['seriesName']]


            # fetch data

            try:
                datalist = OptimizerBase.get_series_data(self, series_list=series_name,
                                                         start_utc=startTime,
                                                         end_utc=endTime, interval=interval,operation = "mean")
                datapoints = datalist[0]['points']

                data = np.array(list(reversed(zip(*datapoints)[1])))
                time = np.array(list(reversed(zip(*datapoints)[0])))

                ts = pd.Series(data, index=pd.to_datetime(time, unit='s', utc=True).tz_convert('Asia/Shanghai'))

                if len(meter['Loads']) == 1:
                    # When there is only one load

                    datatype = meter['Loads'][0]['outputSegment']
                    # accumulate on the output series
                    if datatype not in output_5min:
                        output_5min[datatype] = ts;
                    else:
                        # output_5min[datatype] += ts
                        output_5min[datatype].add(ts, fill_value=0)
                    output_5min[datatype].fillna(0, inplace=True)
                    # if debug:
                    # fig = plt.figure()
                    # output_5min[datatype].plot()
                    # fig.suptitle("output_5min"+series_name[0], fontsize=14, fontweight='bold')
                    # plt.show

                    # if 'total' not in output_5min:
                    #     output_5min['total'] = ts
                    # else:
                    #     output_5min['total'] += ts
                    # output_5min['total'].fillna(0, inplace=True)
                else:
                    pass
                    # TODO: needs disagg

                    # Step 5: Save output_5min into influx db
            except Exception as e:

                datatype = meter['Loads'][0]['outputSegment']
                output_5min[datatype] = pd.Series(0, pd.date_range(startTime, endTime, freq='5Min'));

        if not debug:
            return output_5min

        else:
            logging.debug("output_5min's length is " + str(len(output_5min)))
            return output_5min

    def SubDataProcess(self, debug=False, startTime=None, endTime=None, upload_to_influx=False, disagg=None):

        startTime = startTime.replace(hour=0, minute=0, second=0, microsecond=0)

        endTime = endTime.replace(hour=0, minute=0, second=0, microsecond=0)

        if ((endTime - startTime).days < 1) or (startTime > endTime):
            logging.debug('too short range of time , invalid time input')
            return
            # exit('too short range of time , invalid time input')  #TODO: check startTime and endTime

        # prepare output samples of 5 min
        output_5min = {}
        # Step 2: Loop throu all Meters

        for meter in self.MeterSpec:

            # Clean Input Meter Data and resample into 1min
            series_name = [meter['seriesName']]

            # fetch data

            try:
                datalist = OptimizerBase.get_series_data(self, series_list=series_name,
                                                         start_utc=calendar.timegm(startTime.utctimetuple()),
                                                         end_utc=calendar.timegm(endTime.utctimetuple()))

                datapoints = datalist[0]['points']

                data = np.array(list(reversed(zip(*datapoints)[2])))
                time = np.array(list(reversed(zip(*datapoints)[0])))

                ts = pd.Series(data, index=pd.to_datetime(time, unit='s', utc=True).tz_convert('Asia/Shanghai'))

                # TODO: add resample

                # New version of fetching data using loadClient.py
                # call = OptimizerBase.loadClient()
                # pointSr = call.download('crowneplaza', 'crowneplaza',
                #                'app.equotaenergy.com', '140', limit=1,)
                # if debug:
                # plot the series

                # fig = plt.figure()
                # ts.plot()
                # fig.suptitle('ts  '+series_name[0], fontsize=14, fontweight='bold')
                # plt.show()



                # Step 3: resample data, it needs more work to handle all cases

                # self.freq_sampling is for testing missing points
                self.freq_sampling = '5Min'

                test_ts_clean_1min = OptimizerBase.dataResample(self, ts, '1Min')

                ts_clean_1min = ts.resample('1Min', fill_method='pad')

                # plot ts_clean_1min
                # if debug:
                # fig = plt.figure()
                # ts_clean_1min.plot()
                # fig.suptitle('ts_clean_1min '+series_name[0], fontsize=14, fontweight='bold')
                # plt.show()
                # fig = plt.figure()
                # test_ts_clean_1min.plot()
                # fig.suptitle('test_ts_clean_1min '+series_name[0], fontsize=14, fontweight='bold')
                # plt.show()

                # Step 4: Disagregate
                if len(meter['Loads']) == 1:
                    # When there is only one load
                    ts_output_5min = ts_clean_1min.resample('5Min', how='mean')

                    if debug:
                        fig = plt.figure()
                        ts_output_5min.plot()
                        fig.suptitle('ts_output_5min ' + series_name[0], fontsize=14, fontweight='bold')
                        plt.show()

                    datatype = meter['Loads'][0]['outputSegment']
                    # accumulate on the output series
                    if datatype not in output_5min:
                        output_5min[datatype] = pd.Series(0, pd.date_range(startTime, endTime, freq='5Min'));
                    output_5min[datatype] += ts_output_5min
                    output_5min[datatype].fillna(0, inplace=True)

                    # if debug:
                    # fig = plt.figure()
                    # output_5min[datatype].plot()
                    # fig.suptitle("output_5min"+series_name[0], fontsize=14, fontweight='bold')
                    # plt.show

                    if 'total' not in output_5min:
                        output_5min['total'] = pd.Series(0, pd.date_range(startTime, endTime, freq='5Min'));
                    output_5min['total'] += ts_output_5min
                    output_5min['total'].fillna(0, inplace=True)
                else:
                    # TODO: needs disagg
                    logging.debug('needs disagg')

                    # Step 5: Save output_5min into influx db
            except:
                datatype = meter['Loads'][0]['outputSegment']
                output_5min[datatype] = pd.Series(0, pd.date_range(startTime, endTime, freq='5Min'));

        if not debug:

            if upload_to_influx:
                OptimizerBase.put_series_data(self, output_5min, self.MainMeter.influxKey)
            else:
                pass

        else:
            logging.debug("output_5min's length is " + str(len(output_5min)))

    def DataProcess(self, debug=False, startTime=None, endTime=None, delta_days=10):
        # parameters #

        # Step 1: determine Start and End Time
        # use the influx series name from first meter

        series_name = [self.MeterSpec[0]['seriesName']]

        if not (startTime and endTime):
            # just dealing with one day's data
            # IMPORTANT to make sure datetime are in Shanghai TZ

            curTime = datetime.now(pytz.timezone('Asia/Shanghai'))
            tipTime = datetime.fromtimestamp(OptimizerBase.get_series_tip_utc(self, series_name),
                                             tz=pytz.timezone('Asia/Shanghai'))
            # Simo add tipTime(tipTime of total)

            if (curTime - tipTime.days) >= 2:
                curTime = tipTime

            endTime = curTime.replace(hour=0, minute=0, second=0, microsecond=0)

            try:

                # start time need to be in the past
                # if testtipTime is wrong, need to be handled

                # TODO: if start time and endtime is on same date then quit
                testtipTime = datetime.fromtimestamp(
                    OptimizerBase.get_series_tip_utc(self, ['test' + self.MainMeter.influxKey + '__total']),
                    tz=pytz.timezone('Asia/Shanghai'))

                if (endTime - testtipTime).days < 1:

                    exit('too short range of time')
                else:

                    startTime = testtipTime

            except:

                startTime = datetime.fromtimestamp(OptimizerBase.get_series_tail_utc(self, series_name),
                                                   tz=pytz.timezone('Asia/Shanghai'))

            # TODO: add time delta as input
            while startTime + timedelta(days=delta_days) < endTime:
                # output_5min={}

                tempstartTime = startTime

                tempendTime = startTime + timedelta(days=delta_days)

                self.SubDataProcess(debug=debug, startTime=tempstartTime, endTime=tempendTime)

                startTime = tempendTime


        else:

            self.SubDataProcess(self, debug=debug, startTime=startTime, endTime=endTime)
