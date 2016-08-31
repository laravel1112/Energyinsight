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

import StringIO


def convert_time_to_utc(timeStr):
    # default timezone is Shanghai
    parsedStr = parser.parse(timeStr)

    return calendar.timegm(parsedStr.utctimetuple())


def sendingRequestToDB(url, data):
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


def upload_data(address, energy_unit_id, points):

    while True:
        try:
            values = {'isExternalRequest': True, 'points': points, 'time_format': 's', 'erase_flag': False}

            data = urllib.urlencode(values)

            url = "http://" + address + "/api/putseries/"+energy_unit_id+"/"

            result = sendingRequestToDB(url, data)

            if result != "True":
            	continue

            print "Success to upload "
            break
        except:
            print "Failed to add, sleep 10s"
            time.sleep(10)
            return None


def load_from_json(filename): 
    with open(filename) as data_file:    
        data = json.load(data_file)

    print data[0]['dateutc'], data[0]['tempm']
    print convert_time_to_utc(data[0]['dateutc'])

    return map( lambda x: [convert_time_to_utc(x['dateutc']), float(x['tempm'])],  data)


def load_from_wunderground(wyear, wmonth, wdate):

    wurl = "http://www.wunderground.com/history/airport/ZSSS/%d/%d/%d/DailyHistory.html?req_city=&req_state=&req_statename=&reqdb.zip=&reqdb.magic=&reqdb.wmo=&format=1" % ( wyear, wmonth, wdate)

    print wurl

    req = urllib2.urlopen(wurl).read()

    x = csv.reader(req.split('\n'))

    data = list (x)

    del data[0]
    del data[0]
    del data[-1]

    return map( lambda x: [ convert_time_to_utc(x[13][0:19]), float(x[1])],  data)

if __name__ == "__main__":


    # srv_addr = "localhost:8000"
    # euId = "83"
    srv_addr = "app.equotaenergy.com"
    euId = "88"

    slice_len = 1000

    # option 1: load from JSON file
    # json_file = './static/data/api.weather.shanghai.zsss.2010-01-01-2014-12-31.30m.json'
    json_file = './static/data/api.weather.shanghai.zsss.2015.30m.json'
    # data = load_from_json(json_file)

    # option 2: download from wunderground
    data = load_from_wunderground(2015, 12, 20)
    print data


    for sliced_data in [data[i:i+slice_len] for i in range(0, len(data), slice_len)] :
        print "New Data lenght: ", len(sliced_data)
        # print(sliced_data)
        upload_data(srv_addr, euId, sliced_data)

        time.sleep(1)



 