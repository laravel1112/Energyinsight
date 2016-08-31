# -*- coding: utf-8 -*-
'''
Filename: loadClient.py

Description:
    offer download, upload, remove API

Change activity:
    2016.2.22 creat file

'''
import base64
import json
import urllib
import urllib2
import pandas as pd
from datetime import datetime


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
            print(e)
            print "Failed to try sending !"
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

            print values
            data = urllib.urlencode(values)

            url = "http://" + addr + "/api/getseries/" + energy_unit_id + "/"
            print url

            results = json.loads(self.sendingRequestToDB(user, pswd, url, data))

            if results is None:
                return None

            points = results[0]['points']

            if len(points) == 0:
                print energy_unit_id + " return blank results"
                return None

            timestampCol = list(zip(*reversed(points))[0])
            datetimeCol = map(datetime.fromtimestamp, timestampCol)
            valueCol = list(zip(*reversed(points))[-1])
            pointSr = pd.Series(valueCol, index=datetimeCol)
            print energy_unit_id + "success to download"
            return pointSr
        except:
            print energy_unit_id + " failed to try download"
            return False

    def upload(self, user, pswd, addr, energy_unit_id, points, disagg=None):

        if len(points) == 0:
            print "Blank points list to upload !"
            return True

        try:
            values = {'isExternalRequest': True, 'points': points,
                      'disagg': disagg}

            if disagg is None:
                values.pop('disagg')

            data = urllib.urlencode(values)

            url = "http://" + addr + "/api/putseries/" + energy_unit_id + "/"
            print url

            results = self.sendingRequestToDB(user, pswd, url, data)
            if results == "True":
                print energy_unit_id + " success to upload"
                return True
            else:
                print energy_unit_id + " failed to upload !"
                return True
        except:
            print energy_unit_id + " failed to try uploading !"
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
            print url

            results = self.sendingRequestToDB(user, pswd, url, data)
            if results == "True":
                print energy_unit_id + " success to remove"
                return True
            else:
                print energy_unit_id + " failed to remove !"
                return True
        except:
            print energy_unit_id + " failed to try removing !"
            return False


if __name__ == "__main__":
    # test remove
    call = loadClient()
    user = 'demouser'
    pswd = 'demouser'
    addr = 'localhost:8000'
    energy_unit_id = '94'
    points = []
    call.remove(user, pswd, addr, energy_unit_id, 1453996800, 1454342400)
    exit()

    # test upload
    call = loadClient()
    user = 'demouser'
    pswd = 'demouser'
    addr = 'localhost:8000'
    energy_unit_id = '95'
    points = []
    for t in range(1454342400, 1453996800, -3600):
        points.append([t, 20])
    call.upload(user, pswd, addr, energy_unit_id, points, 'lighting')
    exit()

    # test download
    call = loadClient()
    pointSr = call.download('crowneplaza', 'crowneplaza',
                            'app.equotaenergy.com', '140', limit=1)
    print pointSr
    exit()
