#!/usr/bin/python
# -*- coding: utf-8 -*-

'''
Filename: opc_modules.py
Description: including two parts: 1. reading data from opc; 2. upload data

Author: Rich
Change Activity:
    2015.12.1 create this file and finish timely reading data from OPC
    2015.12.2 add timeTicker to check reading time; add upload part
    2015.12.4 simplify timely csv reading code
    2015.12.7 integrate reading and upload
    2015.12.10 seperate reading and upload
    2015.12.26 revise upload
'''

import base64
import csv
import json
import os
import pytz
import random
import threading
import time
import urllib
import urllib2
from datetime import datetime
from datetime import timedelta
from PyOPC.XDAClient import XDAClient
from PyOPC.XDAClient import ItemContainer


class SeriesClient():

    def __init__(self):
        pass

    def sendingRequestToDB(self, url, data):
        try:
            login = 'demouser'
            password = 'demouser'
            base64string = base64.encodestring(
                '%s:%s' % (login, password)).replace('\n', '')
            print(base64string)

            additional = {'User-Agent': 'Mozilla/5.0',
                          'Authorization': 'Basic %s' % base64string}
            req = urllib2.Request(url, data, additional)
            results = urllib2.urlopen(req).read()
            return results

        except Exception, e:
            print(e)

    def upload_data(self, ServerAddr, energy_unit_id, data):

        points = []
        for index, point in enumerate(data):
            if int(point[-1]) == 1:
                points.append([point[0], point[-2]])
                # points.append([point[0], point[1]])  # test

        if len(points) == 0:
            print energy_unit_id + " no points to upload"
            return True

        minSleep = 5
        maxSleep = 10
        sumSleep = 0
        deltaSleep = 10
        while True:
            try:
                values = {'isExternalRequest': True, 'points': points,
                          'time_format': 's', 'erase_flag': False}
                data = urllib.urlencode(values)

                url = "http://" + ServerAddr + "/api/putseries/" +\
                      energy_unit_id + "/"

                results = self.sendingRequestToDB(url, data)
                # check upload result
                if results == 'True':
                    print energy_unit_id + " Success to upload: "
                    return True
                else:
                    print energy_unit_id + " Failed to upload"
            except:
                print energy_unit_id + " Failed to try upload"
            sleepTime = random.uniform(minSleep, maxSleep)
            # minSleep += deltaSleep
            maxSleep += deltaSleep
            sumSleep += sleepTime
            if (sumSleep > 1200):
                print energy_unit_id + " Failed to connect, stop uploading"
                return False
            print energy_unit_id + " Sleep: ", sleepTime
            time.sleep(sleepTime)

    def downloadLastTimestamp(self, ServerAddr, energy_unit_id):
        '''
        Description: download the last point from db, and return its timestamp

        Args:
            addr: string, ip address of th db
            energy_unit_id: string, the meter's id

        Returns: 1 int, the timestamp of the last point
                 2 if fail to download, return error

        '''
        try:
            values = {'isExternalRequest': True, 'limit': 1}
            data = urllib.urlencode(values)

            url = "http://" + ServerAddr + "/api/getseries/" + energy_unit_id +\
                  "/"

            results = self.sendingRequestToDB(url, data)
            results = json.loads(results)

            return results[0]['points'][0][0]
        except:
            print energy_unit_id + " Failed to try download"
            return None


class OpcClient(SeriesClient):

    def __init__(self, energy_unit_id):
        '''
        Description:

        Args:
            energy_unit_id: string, meter's id, used for upload

        Returns: none
        '''
        # set timezone
        self.tz = pytz.timezone('Asia/Shanghai')

        # set parameters
        self.energy_unit_id = energy_unit_id

        # set time ticker
        self.timeTicker = time.time() + 60 - time.localtime()[5]
        self.timeTicker_upload = time.time() + (59-time.localtime()[4])*60\
            + (60-time.localtime()[5])
        # set lock
        self.lock_upload = threading.Lock()
        self.lock_read = threading.Lock()

    def timelyRead(self):
        '''
        Description: 1 timely read point from opc by PyOPC

        Args: none
        Returns: none
        '''
        # set for CP
        if self.energy_unit_id == '134':
            print self.energy_unit_id, " Enter reading: ", datetime.now()
        # print self.energy_unit_id, " Enter reading: ", datetime.now()

        # calculate time difference between current and record
        timeDiff = time.time() - self.timeTicker

        # set Timer to control timely reading
        threading.Timer(self.interval-timeDiff, self.timelyRead).start()

        # record time of reading point
        timeReading = time.time()

        # timeTicker inrease
        self.timeTicker += self.interval

        # read and saving points
        try:
            xda = XDAClient(OPCServerAddress=self.OpcAddr)

            readList = []
            for name in self.nameList:
                readList.append(ItemContainer(ItemName=self.namePerfix+name,
                                              MaxAge=500))

            pointList = xda.Read(readList, LocaleID='en-us')
            # timeReading = time.time()
            values = []
            for point in pointList[0]:
                values.append(point.Value)
            values.append(1)
            if values[-2] == None:
                values[-1] = 2
        except:
            # print "Failed to connect..."
            values = [0]
            values = values * 16
            values.append(0)
            # timeReading = time.time()

        with self.lock_read:
            # set for CP
            if self.energy_unit_id == '134':
                print 'active: ', threading.activeCount()
                print self.energy_unit_id, " Enter writing: ", datetime.now()
            # print 'active: ', threading.activeCount()
            # print self.energy_unit_id, " Enter writing: ", datetime.now()
            filename = ''
            for i in range(4):
                filename = filename + str(time.localtime()[i]) + '-'
            filename = 'TS' + self.energy_unit_id + '-' + filename[:-1] + '.csv'
            csvfile = file(os.path.join('Backup', filename), 'ab')
            writer = csv.writer(csvfile)
            values.insert(0, timeReading)
            # print values
            writer.writerow(values)
            csvfile.close()
            # set for cp
            if self.energy_unit_id == '134':
                print self.energy_unit_id, " Finish reading: ", datetime.now()
            # print self.energy_unit_id, " Finish reading: ", datetime.now()

    def dataCollecting(self, OpcAddr, interval, nameList, namePerfix):
        '''
        Description: main program to collect data from opc, set start timer

        Args:
            OpcAddr: the address to read data
            interval: int, define reading interval from OPC.
            nameList: list, name list of meters.
            namePerfix: string, perfix of name

        Returns: none
        '''
        self.OpcAddr = OpcAddr
        self.interval = float(interval)
        self.nameList = nameList
        self.namePerfix = namePerfix

        print "Start reading: ", self.energy_unit_id, datetime.now()

        threading.Timer(60-time.localtime()[5], self.timelyRead).start()

    def monthlyCheck(self):
        pass

    def keepFetch(self, datetimeNow, datetimeLast):
        '''
        Description: 1 find csv files by timedelta until the current time
                     2 fetch and upload

        Args:
            datetimeNow: datetime.datetime, the current time
            datetimeLast: datetime.datetime, latest time on server's database

        Returns: none
        '''
        # set for CP
        if self.energy_unit_id == '134':
            print self.energy_unit_id, " Start keepFetch: ", datetime.now()
        # print self.energy_unit_id, " Start keepFetch: ", datetime.now()
        datetimeNext = datetimeLast
        while True:
            # datetime increase
            datetimeNext = datetimeNext + timedelta(hours=1)
            # print datetimeNext

            # break judgement by time
            if (datetimeNow - datetimeNext).total_seconds() < 0:
                break
            try:
                # data is used to record points
                # like as [[t, v1, v2, ...], [t, v1, v2, ...], ...]
                data = []
                filename = ''
                for item in datetimeNext.timetuple()[:4]:
                    filename = filename + str(item) + '-'
                filename = 'TS' + self.energy_unit_id + '-' + filename
                filename = os.path.join('Backup', filename[:-1] + '.csv')
                with open(filename, 'r') as csvdata:
                    points = csvdata.readlines()
                    for index, point in enumerate(points):
                        points[index] = point.split(',')
                        points[index] = map(float, points[index])
                        data.append(points[index])
                uploadResult = SeriesClient.upload_data(self, self.ServerAddr,
                                                        self.energy_unit_id,
                                                        data)
                if uploadResult is False:
                    # datetimeNext = datetimeNext - timedelta(hours=1)
                    # set for CP
                    if self.energy_unit_id == '134':
                        print self.energy_unit_id, " keepFetch uncomplete: ", datetime.now()
                    # print self.energy_unit_id, " keepFetch uncomplete: ", datetime.now()
                    return "keepFetch uncomplete"
            except:
                print "keepfetch missing ", filename
        # set for CP
        if self.energy_unit_id == '134':
            print self.energy_unit_id, " Fetch Stop: ", datetime.now(self.tz)
        # print self.energy_unit_id, " Fetch Stop: ", datetime.now(self.tz)

    def fetchLast(self, datetimeLast, timestampLast):
        '''
        Description: 1 find the csv file according to
                            the latest timestamp on server's database
                     2 identify the start point on the csv file
                     3 fetch and upload

        Args:
            datetimeLast: datetime.datetime, latest time on server's database
            timestampLast: int, latest timestamp on server's database

        Returns: none
        '''
        # set for CP
        if self.energy_unit_id == '134':
            print self.energy_unit_id, " start fetchLast: ", datetime.now()
        # print self.energy_unit_id, " start fetchLast: ", datetime.now()
        try:
            # data is used to record points
            # like as [[t, v1, v2, ...], [t, v1, v2, ...], ...]
            data = []
            filename = ''
            for item in datetimeLast.timetuple()[:4]:
                filename = filename + str(item) + '-'
            filename = 'TS' + self.energy_unit_id + '-' + filename
            filename = os.path.join('Backup', filename[:-1] + '.csv')
            with open(filename, 'r') as csvdata:
                points = csvdata.readlines()
                for index, point in enumerate(points):
                    points[index] = point.split(',')
                    points[index] = map(float, points[index])
                    # find the start point
                    if points[index][0] - timestampLast > 1:
                        data.append(points[index])
            uploadResult = SeriesClient.upload_data(self, self.ServerAddr,
                                                    self.energy_unit_id, data)
        except:
            print "fetchLast missing ", filename
            uploadResult = True
        # set for CP
        if self.energy_unit_id == '134':
            print self.energy_unit_id, " end fetchLast: ", datetime.now()
        # print self.energy_unit_id, " end fetchLast: ", datetime.now()
        return uploadResult

    def timelyUpload(self):
        '''
        Description: 1 hourly upload

        Args: none

        Returns: none
        '''

        # calculate time difference between current and record
        timeDiff = time.time() - self.timeTicker_upload
        # set Timer to control timely upload
        threading.Timer(3600-timeDiff, self.timelyUpload).start()
        self.timeTicker_upload += 3600
        # record current time
        if self.lock_upload.locked():
            print self.energy_unit_id, " The last upload is processing"
            return "The last upload is processing"
        with self.lock_upload:
            datetimeNow = datetime.now(self.tz)

            # check last point's timestamp and time on server's database
            minSleep = 5
            maxSleep = 10
            sumSleep = 0
            deltaSleep = 10
            while True:
                try:
                    timestampLast = \
                        SeriesClient.downloadLastTimestamp(self,
                                                           self.ServerAddr,
                                                           self.energy_unit_id)
                    if timestampLast is None:
                        print self.energy_unit_id, " Initial Uploading..."
                        timestampLast = time.time() - 3600
                    break
                except:
                    sleepTime = random.uniform(minSleep, maxSleep)
                    time.sleep(sleepTime)
                    maxSleep += deltaSleep
                    sumSleep += sleepTime
                    if sleepTime > 1200:
                        print self.energy_unit_id, " Failed to download the last timestamp!"
                        return self.energy_unit_id, " Failed to download the last timestamp!"

            datetimeLast = datetime.fromtimestamp(timestampLast, self.tz)

            # find, fetch and upload
            if self.fetchLast(datetimeLast, timestampLast) is False:
                print self.energy_unit_id, " Discard keepFetch"
                return "Discard keepFetch"

            self.keepFetch(datetimeNow, datetimeLast)

    def dataUploading(self, ServerAddr):
        '''
        Description: main program to upload data hourly, set start timer

        Args:
            addr: string, address to upload data

        Returns:None
        '''
        self.ServerAddr = ServerAddr

        print "Start uploading: ", self.energy_unit_id, datetime.now()

        threading.Timer((59-time.localtime()[4])*60 + (60-time.localtime()[5]),
                        self.timelyUpload).start()


if __name__ == '__main__':
    '''
    # test code
    OpcAddr = 'http://192.168.1.88/soap'
    interval = 15
    nameList = ['b1', 'b2', 'b3', 'b3', 'b4', 'b5', 'b6', 'b7', 'b7', 'b8', 'b9', 'b10']
    energy_unit_id = 'test'
    meterT = OpcClient(energy_unit_id)
    namePerfix = 'Simulator.Channel_1.Device_1.'
    meterT.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    exit()
    '''
    # test on site
    OpcAddr = 'http://192.168.1.89/soap' 
    interval = 60
    nameList = ['Eq-15', 'Eq-16', 'Eq-17', 'Eq-18', 'Eq-19', 'Eq-20',
                'Eq-21', 'Eq-22', 'Eq-23','Eq-24', 'Eq-25', 'Eq-26', 'Eq-27']
    ServerAddr = 'app.equotaenergy.com'
    '''
    energy_unit_id = '83'
    meter83 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.电表6.A区母线奇数.'
    meter83.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter83.dataUploading(ServerAddr)
    '''  
    energy_unit_id = '134'
    meter134 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.电表6.A区母线奇数.'
    meter134.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter134.dataUploading(ServerAddr)

    energy_unit_id = '135'
    meter135 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.电表6.B楼层照明偶数.'
    meter135.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter135.dataUploading(ServerAddr)
    
    energy_unit_id = '136'
    meter136 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.电表6.B区楼层空调.'
    meter136.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter136.dataUploading(ServerAddr)

    energy_unit_id = '137'
    meter137 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.电表6.NIA厨2.'
    meter137.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter137.dataUploading(ServerAddr)
    
    energy_unit_id = '141'
    meter141 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter5.59.'
    meter141.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter141.dataUploading(ServerAddr)

    energy_unit_id = '133'
    meter133 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter5.73.'
    meter133.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter133.dataUploading(ServerAddr)
    
    energy_unit_id = '132'
    meter132 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter5.72.'
    meter132.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter132.dataUploading(ServerAddr)

    energy_unit_id = '131'
    meter131 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter5.70.'
    meter131.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter131.dataUploading(ServerAddr)

    energy_unit_id = '130'
    meter130 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter5.69.'
    meter130.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter130.dataUploading(ServerAddr)

    energy_unit_id = '129'
    meter129 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter5.68.'
    meter129.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter129.dataUploading(ServerAddr)

    # exit()
    
    # test on site
    OpcAddr = 'http://192.168.1.90/soap' 
    # interval = 15
    # nameList = ['Eq-15', 'Eq-16', 'Eq-17', 'Eq-18', 'Eq-19', 'Eq-2',
    #             'Eq-20', 'Eq-21', 'Eq-22','Eq-23', 'Eq-24', 'Eq-25', 'Eq-26']
    # ServerAddr = 'app.equotaenergy.com'

   
    energy_unit_id = '128'
    meter128 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter4.66.'
    meter128.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter128.dataUploading(ServerAddr)

    energy_unit_id = '127'
    meter127 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter4.65.'
    meter127.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter127.dataUploading(ServerAddr)
    
    energy_unit_id = '126'
    meter126 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter4.64.'
    meter126.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter126.dataUploading(ServerAddr)

    energy_unit_id = '125'
    meter125 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter4.60.'
    meter125.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter125.dataUploading(ServerAddr)
    
    energy_unit_id = '124'
    meter124 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter3.56.'
    meter124.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter124.dataUploading(ServerAddr)

    energy_unit_id = '123'
    meter123 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter3.54.'
    meter123.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter123.dataUploading(ServerAddr)
    
    energy_unit_id = '122'
    meter122 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter3.53.'
    meter122.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter122.dataUploading(ServerAddr)

    energy_unit_id = '121'
    meter121 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter3.52.'
    meter121.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter121.dataUploading(ServerAddr)

    # exit()
    
    # test on site
    OpcAddr = 'http://192.168.1.91/soap' 
    # interval = 15
    # nameList = ['Eq-15', 'Eq-16', 'Eq-17', 'Eq-18', 'Eq-19', 'Eq-2',
    #             'Eq-20', 'Eq-21', 'Eq-22','Eq-23', 'Eq-24', 'Eq-25', 'Eq-26']
    # ServerAddr = 'app.equotaenergy.com'
   
    energy_unit_id = '140'
    meter140 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter1.36.'
    meter140.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter140.dataUploading(ServerAddr)

    energy_unit_id = '120'
    meter120 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter2.50.'
    meter120.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter120.dataUploading(ServerAddr)
    
    energy_unit_id = '119'
    meter119 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter2.49.'
    meter119.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter119.dataUploading(ServerAddr)

    energy_unit_id = '118'
    meter118 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter2.48.'
    meter118.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter118.dataUploading(ServerAddr)
   
    energy_unit_id = '117'
    meter117 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter2.44.'
    meter117.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter117.dataUploading(ServerAddr)

    energy_unit_id = '116'
    meter116 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter1.41.'
    meter116.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter116.dataUploading(ServerAddr)
    
    energy_unit_id = '115'
    meter115 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter1.40.'
    meter115.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter115.dataUploading(ServerAddr)

    energy_unit_id = '114'
    meter114 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter1.39.'
    meter114.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter114.dataUploading(ServerAddr)

    energy_unit_id = '113'
    meter113 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter1.38.'
    meter113.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter113.dataUploading(ServerAddr)

    energy_unit_id = '112'
    meter112 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.meter1.37.'
    meter112.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter112.dataUploading(ServerAddr)

    # exit()
    
    # test on site
    OpcAddr = 'http://192.168.1.92/soap' 
    # interval = 15
    # nameList = ['Eq-15', 'Eq-16', 'Eq-17', 'Eq-18', 'Eq-19', 'Eq-2',
    #             'Eq-20', 'Eq-21', 'Eq-22','Eq-23', 'Eq-24', 'Eq-25', 'Eq-26']
    # ServerAddr = 'app.equotaenergy.com'

   
    energy_unit_id = '111'
    meter111 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter6.35.'
    meter111.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter111.dataUploading(ServerAddr)

    energy_unit_id = '110'
    meter110 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter6.34.'
    meter110.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter110.dataUploading(ServerAddr)
    
    energy_unit_id = '109'
    meter109 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter6.32.'
    meter109.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter109.dataUploading(ServerAddr)

    energy_unit_id = '108'
    meter108 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter6.30.'
    meter108.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter108.dataUploading(ServerAddr)

    # test on site
    OpcAddr = 'http://192.168.1.93/soap' 
    # interval = 15
    # nameList = ['Eq-15', 'Eq-16', 'Eq-17', 'Eq-18', 'Eq-19', 'Eq-2',
    #             'Eq-20', 'Eq-21', 'Eq-22','Eq-23', 'Eq-24', 'Eq-25', 'Eq-26']
    # ServerAddr = 'app.equotaenergy.com'

   
    energy_unit_id = '138'
    meter138 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter5.24.'
    meter138.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter138.dataUploading(ServerAddr)

    energy_unit_id = '107'
    meter107 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter5.28.'
    meter107.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter107.dataUploading(ServerAddr)
    
    energy_unit_id = '106'
    meter106 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter5.27.'
    meter106.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter106.dataUploading(ServerAddr)

    energy_unit_id = '105'
    meter105 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter5.26.'
    meter105.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter105.dataUploading(ServerAddr)
   
    energy_unit_id = '104'
    meter104 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter5.25.'
    meter104.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter104.dataUploading(ServerAddr)

    # exit()
    
    # test on site
    OpcAddr = 'http://192.168.1.94/soap' 
    # interval = 15
    # nameList = ['Eq-15', 'Eq-16', 'Eq-17', 'Eq-18', 'Eq-19', 'Eq-2',
    #             'Eq-20', 'Eq-21', 'Eq-22','Eq-23', 'Eq-24', 'Eq-25', 'Eq-26']
    # ServerAddr = 'app.equotaenergy.com'
  
    energy_unit_id = '139'
    meter139 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter4.18.'
    meter139.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter139.dataUploading(ServerAddr)

    energy_unit_id = '103'
    meter103 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter4.22.'
    meter103.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter103.dataUploading(ServerAddr)
    
    energy_unit_id = '102'
    meter102 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter4.20.'
    meter102.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter102.dataUploading(ServerAddr)

    energy_unit_id = '101'
    meter101 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter4.19.'
    meter101.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter101.dataUploading(ServerAddr)
   
    energy_unit_id = '100'
    meter100 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter3.17.'
    meter100.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter100.dataUploading(ServerAddr)

    energy_unit_id = '99'
    meter99 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter3.16.'
    meter99.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter99.dataUploading(ServerAddr)
    
    energy_unit_id = '98'
    meter98 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter3.13.'
    meter98.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter98.dataUploading(ServerAddr)

    # exit()
    
    # test on site
    OpcAddr = 'http://192.168.1.95/soap' 
    # interval = 15
    #  nameList = ['Eq-15', 'Eq-16', 'Eq-17', 'Eq-18', 'Eq-19', 'Eq-2',
    #              'Eq-20', 'Eq-21', 'Eq-22','Eq-23', 'Eq-24', 'Eq-25', 'Eq-26']
    # ServerAddr = 'app.equotaenergy.com'

    energy_unit_id = '97'
    meter97 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter2.11.'
    meter97.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter97.dataUploading(ServerAddr)

    energy_unit_id = '96'
    meter96 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter2.10.'
    meter96.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter96.dataUploading(ServerAddr)
    
    energy_unit_id = '95'
    meter95 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter2.9.'
    meter95.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter95.dataUploading(ServerAddr)

    energy_unit_id = '94'
    meter94 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter2.8.'
    meter94.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter94.dataUploading(ServerAddr)
   
    energy_unit_id = '93'
    meter93 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter2.7.'
    meter93.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter93.dataUploading(ServerAddr)

    energy_unit_id = '92'
    meter92 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter1.5.'
    meter92.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter92.dataUploading(ServerAddr)
    
    energy_unit_id = '91'
    meter91 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter1.3.'
    meter91.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter91.dataUploading(ServerAddr)

    energy_unit_id = '90'
    meter90 = OpcClient(energy_unit_id)
    namePerfix = 'modbus.Meter1.2.'
    meter90.dataCollecting(OpcAddr, interval, nameList, namePerfix)
    meter90.dataUploading(ServerAddr)
  
    exit()
    
    
    '''
    # test upload
    ServerAddr = 'localhost:8000'
    energy_unit_id = '91'
    data = [[time.time(), 1 ,2, 3, 1], [time.time()+15, 4, 5, 6, 1]]
    print data
    call = SeriesClient()
    call.upload_data(ServerAddr, energy_unit_id, data)
    exit()
    '''
    # test timelyreading and upload
    energy_unit_id = '92'
    meter90 = OpcClient(energy_unit_id)

    OpcAddr = 'http://192.168.1.152/soap'
    interval = 15
    nameList = ['b1', 'b10', 'b11', 'b12', 'b13', 'b14', 'b15']
    namePerfix = 'Simulator.Channel_1.Device_1.'
    meter90.dataCollecting(OpcAddr, interval, nameList, namePerfix)

    ServerAddr = 'localhost:8000'
    meter90.dataUploading(ServerAddr)
    exit()
    '''
    # test fetch
    fetch = OpcClient('83')
    datetimeNow = datetime.now() - timedelta(days=15)

    datetimeLast = parser.parse('2015-12-10 10:00:00')
    print datetimeLast
    fetch.keepFetch(datetimeNow, datetimeLast)
    exit()
    '''
    # meter 83
    energy_unit_id = '83'
    OpcAddr = 'http://192.168.1.110/soap'
    interval = 15
    nameList = ['a1', 'a2', 'a3', 'a4', 'a5']
    namePerfix = 'Simulator.Channel_1.Device_1.'
    meter83 = OpcClient(energy_unit_id)
    meter83.dataCollecting(OpcAddr, interval, nameList, namePerfix)

    # meter 84
    energy_unit_id = '84'
    OpcAddr = 'http://192.168.1.152/soap'
    interval = 15
    nameList = ['b1', 'b2', 'b3', 'b4', 'b5']
    namePerfix = 'Simulator.Channel_2.Device_2.'
    meter84 = OpcClient(energy_unit_id)
    meter84.dataCollecting(OpcAddr, interval, nameList, namePerfix)

    # upload data

    exit()
