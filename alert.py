from time import gmtime
import sys
import pytz
from datetime import datetime, timedelta
import calendar
import numpy as np
import heapq
import scipy.stats
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "energyinsight.settings")
import django
#from optimizer.models import *
from optimizer.algorithm.optimizerbase import OptimizerBase
import math
import pandas as pd
from common.models import InfluxdbSettings
import json
from influxdb.influxdb08  import InfluxDBClient
import matplotlib.pyplot as plt
import matplotlib
from backend.models import EnergyUnit
from optimizer.models import HourlyOptimizerTask
from common.notification import sendSMS


class EnergyAlert():

	def __init__(self,task_id):
		self.task_id=task_id;
		

	def checkSeries(self,series_key,daily_energy,threshold):
		curTime=datetime.now(pytz.timezone('Asia/Shanghai'));
		curTime=curTime.replace(year=2015);
		startTime=curTime.replace(day=1,hour=0,minute=0,second=0);
		endTime=curTime.replace(hour=0,minute=0,second=0);
		opt=OptimizerBase();
		datalist = opt.get_series_data(series_list=[series_key], start_utc = calendar.timegm(startTime.utctimetuple()), end_utc = calendar.timegm(curTime.utctimetuple()) )
		if datalist is None:
			print "no series data of this month is returned"
			return
		datapoints = datalist[0]['points']
		# let x= today, y= end of month, m= energy used/day, h=threshold (default 0.9)
		# The energy currently used should <= m(y-yh+xh)
		curEnergy=0;
		datapoints=list(reversed(datapoints))
		for d in xrange(len(datapoints)):
			if d>=len(datapoints)-1:
				break;
			e=datapoints[d][2]*(datapoints[d+1][0]-datapoints[d][0]);
			curEnergy+=e
		#cur Energy is walt times sec
		curEnergy/=3600; #J  now
		y=calendar.monthrange(curTime.year,curTime.month)[1];
		x=curTime.day;
		print "currently used energy :"+str(curEnergy)+"J";
		t=daily_energy*(y*(1-threshold)+threshold*(x-1))
		print "threshold of alert: "+str(t)+"J";
		if curEnergy > daily_energy*(y*(1-threshold)+threshold*(x-1)):
			#send alert
			# maybe someway to check if the alert is already sent before?
			print "over threshold"
			print curEnergy;
			# signiture="";
			# tem_id="";
			# parameter={}
			# sendSMS(signiture, parameter,phone,tem_id)

		#def checkSeriesOfUser(user_id):

	def runTask(self):
		task=HourlyOptimizerTask.objects.get(id=self.task_id);
		print task;
		target_unit=task.eu_target;
		monitor_config=target_unit.monitor_config;
		if monitor_config.overall_is_active!=True:
			print "The building is not active"
			return;
		try:
			threshold=float(monitor_config.overall_threshold)
		except ValueError:
			print "threshold is not set correctly"
			return;
		average=144;
		if target_unit.type.name=="Building":
			if target_unit.invisible==True:
				#check the __total?
				print "the building has disag meters"
			else:
				meters=EnergyUnit.objects.filter(parent=target_unit.id);
				if len(meters)>0:
					meter_key=meters[0].influxKey;
		elif target_unit.type.name=="Meter":# it is a meter
			meter_key=target_unit.influxKey;
		if meter_key is not None:
			self.checkSeries(meter_key,average,threshold);	



def run():
	django.setup()
	ea= EnergyAlert(7);
	#ea.checkSeries("user.demouser.CampusAAA.Building116",144,0.9);
	ea.runTask();
run()