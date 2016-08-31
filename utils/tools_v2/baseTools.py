# -*- coding: utf-8 -*-
'''
Filename: baseTools.py

Description:
    offer time converter etc API

Change activity:
    2016.2.22 create file
'''
import calendar
from dateutil import parser


class baseTools():

    def __init__(self):
        pass

    def convert_timestr_to_utc(self, timeStr, timeZoneStr=" +8"):
        # default timezone is Shanghai
        timeStr = timeStr + timeZoneStr
        parsedStr = parser.parse(timeStr)
        return calendar.timegm(parsedStr.utctimetuple())


if __name__ == "__main__":
    timeStr = '2014-01-01 00:00:00'
    client = baseTools()
    print client.convert_timestr_to_utc(timeStr)
    exit()
