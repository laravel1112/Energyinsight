# -*- coding: utf-8 -*-
'''
Filename: recommend.py

Description:
    offer energy saving recommendations

Change activity:
    2016.2.23 creat file

'''
from __future__ import division
# from dateutil import parser


class trendCheck():

    def __init__(self):
        pass

    def abnormalOn(self, pointSr, start, end, thresh):

        # start = parser.parse(startStr + " +8")
        # end = parser.parse(endStr + " +8")

        abnormalList = []
        for t in pointSr.index:
            if t > start and t < end:
                if pointSr[t] > thresh:
                    abnormalList.append([t, pointSr[t]])

        return abnormalList
