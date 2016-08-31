#!/usr/bin/python
# -*- coding: utf-8 -*-
import calendar
import json
import pytz
import time
from datetime import timedelta
from dateutil import parser
import getpass
import urllib, urllib2, base64
import requests
from pprint import pprint

import urllib2
import csv

import datetime
from datetime import date
from dateutil.rrule import rrule, DAILY

import StringIO

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__),"..")))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "energyinsight.settings")
import django
django.setup()

from optimizer.algorithm.optimizerbase import OptimizerBase
from django.conf import settings
from backend.models import EnergyUnit
from backend.models import WeatherStation


def convert_time_to_utc(timeStr):
    # default timezone is Shanghai
    parsedStr = parser.parse(timeStr)

    return calendar.timegm(parsedStr.utctimetuple())


def sendingRequestToDB(url, data):
    print ("entered sending to db")
    print (url)
    try:
        login = 'demouser'
        password = 'demouser'
        base64string = base64.encodestring('%s:%s' % (login, password)).replace('\n', '')
        print(base64string)

        additional = {'User-Agent': 'Mozilla/5.0', 'Authorization': 'Basic %s' % base64string }
        req = urllib2.Request(url, data, additional)
        result = urllib2.urlopen(req).read()
        print  "URL Result: ", result
        return result

    except Exception, e:
        print(e)


def get_data(address, energy_unit_id):

    try:
        values = {'isExternalRequest': True, 'time_format': 's', 'erase_flag': False}

        data = urllib.urlencode(values)

        url = address + "/api/getseries/"+energy_unit_id+"/"

        result = sendingRequestToDB(url, data)

        a = result[0]['points'][0][0]
        print("aaaa")
        print(a)

        print "Successfully got the data "

    except:
        print "Failed to add, sleep 10s"
        time.sleep(10)
        return None

    print("getting data is finished")


def upload_data(address, energy_unit_id, points):
    print("upload data")

    try:
        print ("entered to try upload")
        values = {'isExternalRequest': True, 'points': points, 'time_format': 's', 'erase_flag': False}

        data = urllib.urlencode(values)
        print(data)

        try:
            url = address + "/api/putseries/"+str(energy_unit_id)+"/"
        except Exception, e:
            print(e)
        print(url)
        result = sendingRequestToDB(url, data)
        print "Success to upload"

    except:
        print "Failed to upload, sleep 10s"
        time.sleep(10)
        return None

    print("uploading is finished")

def new_upload_data(address, energy_unit_id, points,columns):
    print("upload data")

    try:
        #print ("entered to try upload")
        values = {'isExternalRequest': True, 'points': points, 'time_format': 's', 'erase_flag': False, 'columns': columns}
        data = urllib.urlencode(values)
        
        #print(data)
        
        try:
            url = address + "/api/putseries/"+str(energy_unit_id)+"/"
        except Exception, e:
            print(e)
        print(url)
        result = sendingRequestToDB(url, data)
        print "Success to upload"

    except:
        print "Failed to upload, sleep 10s"
        time.sleep(10)
        return None

    print("uploading is finished")

def load_from_json(filename):
    with open(filename) as data_file:
        data = json.load(data_file)

    print data[0]['dateutc'], data[0]['tempm']
    print convert_time_to_utc(data[0]['dateutc'])

    return map( lambda x: [convert_time_to_utc(x['dateutc']), float(x['tempm'])],  data)


def load_from_wunderground(wyear, wmonth, wdate):

    wurl = "http://www.wunderground.com/history/airport/ZSSS/%d/%d/%d/DailyHistory.html?req_city=&req_state=&req_statename=&reqdb.zip=&reqdb.magic=&reqdb.wmo=&format=1" % ( wyear, wmonth, wdate)

    print ("wurl")
    print wurl

    try:
        req = urllib2.urlopen(wurl).read()

        x = csv.reader(req.split('\n'))

        data = list (x)

        del data[0]
        del data[0]
        del data[-1]

        return map( lambda x: [ convert_time_to_utc(x[13][0:19]), float(x[1])],  data)

    except:
        return False

def new_load_from_wunderground(wyear,wmonth,wdate,location_name):

    wurl = "http://www.wunderground.com/history/airport/%s/%d/%d/%d/DailyHistory.html?req_city=&req_state=&req_statename=&reqdb.zip=&reqdb.magic=&reqdb.wmo=&format=1" % ( location_name,wyear, wmonth, wdate)

    try:
        req = urllib2.urlopen(wurl).read()

        x = csv.reader(req.split('\n'))

        data = list(x)


        print "new_load_from_wunderground from url: ", wurl
        del data[0]
        del data[-1]
        column = data[0]
        del data[0]

        a = map( lambda x: [ convert_time_to_utc(x[13][0:19]), float(x[1]),float(x[2]),float(x[3]),float(x[4]),float(x[5]),x[6],x[10],x[11],float(x[12])],  data)
        del column[0]
        del column[6]
        del column[7]

        column.insert(0,"time")
        del column[9]
        del column[10]

        return(a,column)

    except:
        return False

def weather_uploading():

    srv_addr = settings.LOCALHOST_SETTINGS
    # get all the weather_eu_id
    for weather_station in WeatherStation.objects.all():

        print(srv_addr)
        
        #energy_units = EnergyUnit.objects.filter(id=weather_eu_id)
        energy_units = weather_station.unit
        
        for eu in [energy_units]:
            if eu.influxKey != "":

                euId = eu.id

                print (euId)
                print (eu.influxKey)

                try:

                    influx_key = str(eu.influxKey)
                    influx_key_list = []
                    influx_key_list.append(influx_key)


                    print (influx_key_list)

                    slice_len = 1000

                    # option 1: load from JSON file
                    # json_file = './static/data/api.weather.shanghai.zsss.2010-01-01-2014-12-31.30m.json'
                    json_file = './static/data/api.weather.shanghai.zsss.2015.30m.json'
                    # data = load_from_json(json_file)

                    """
                    last_date = get_data(address=srv_addr, energy_unit_id=euId)
                    #already done function is used for this.
                    """

                    ob = OptimizerBase()
                    last_date_with_data_ms=ob.get_series_tip_utc(influx_key_list)
                    if last_date_with_data_ms != None:
                        print (last_date_with_data_ms)
                        last_date_with_data = datetime.datetime.fromtimestamp(last_date_with_data_ms)
                        print (last_date_with_data)
                    else:
                        #TODO: start crawling from 2015
                        #last_date_with_data = datetime.datetime.now() - datetime.timedelta(days=90)
                        last_date_with_data = datetime.datetime(2015, 1, 1, 00, 00, 00) 
                        print (last_date_with_data)
                        print ("this date_time was created by manual timedelta -90 days")

                    print("this is the last time point")

                    print ("today")
                    current_date = datetime.datetime.now()
                    print current_date

                    looping_date = last_date_with_data
                    delta = datetime.timedelta(days=1)
                    while looping_date <= current_date:
                        # target_date = looping_date.date()
                        target_date = datetime.datetime.strftime(looping_date, "%Y-%m-%d")
                        print(target_date)
                        target_date = target_date.split("-")
                        print target_date
                        looping_date += delta

                        # option 2: download from wunderground
                        # change to new_load_from_wunderground
                        data,column = new_load_from_wunderground(int(target_date[0]), int(target_date[1]), int(target_date[2]),weather_station.url)

                        print (data,column)

                        if data != False:
                            print ("not False")

                            for sliced_data in [data[i:i+slice_len] for i in range(0, len(data), slice_len)] :
                                print "New Data lenght: ", len(sliced_data)
                                print "sliced_data:", sliced_data
                                try:
                                    #new_upload_data(address=srv_addr, energy_unit_id=euId, points=sliced_data, columns = column)
                                    ob.new_put_series_data(series_list = [euId],points = sliced_data,columns = column)
                                    time.sleep(1)
                                except:
                                    break
                        else:
                            break
                except Exception, e:
                    print (e)


if __name__ == "__main__":
    weather_uploading()

