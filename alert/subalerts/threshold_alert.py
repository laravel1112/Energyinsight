from time import gmtime
import sys
import pytz
from datetime import datetime, timedelta
from dateutil.relativedelta import *
import calendar
import numpy as np
import heapq
import scipy.stats
import os
import django
#from optimizer.models import *
from optimizer.algorithm.optimizerbase import OptimizerBase
import math
import pandas as pd
from common.models import InfluxdbSettings
import json
from influxdb.influxdb08  import InfluxDBClient
#import matplotlib.pyplot as plt
#import matplotlib
from backend.models import EnergyUnit,GroupHasCampus
from optimizer.models import HourlyOptimizerTask
from alert.models import *
from alert.subalerts.alert_error import AlertError
from alert.subalerts.energy_alert import SubAlertBase
from top.models import SmsTemplate,SmsSigniture
from common.notification import notify_user_sms, notify_user
from django.contrib.auth.models import User


class SimpleThresholdAlert(SubAlertBase):

	def checkSeries(self):
		curTime=datetime.now(pytz.timezone('Asia/Shanghai'))

		endTime=curTime.replace(hour=0,minute=0,second=0)
		startTime=curTime-relativedelta(hour=1)

		series_key = self.alert.energyunit.influxKey

		# TODO: follwoing get_series_data need to work for energyunit_id
		# opt=OptimizerBase();
		# testdata =opt.get_series_data(
		# 	series_list=[series_key],
		# 	start_utc = calendar.timegm(startTime.utctimetuple()), 
		# 	end_utc = calendar.timegm(endTime.utctimetuple()) )

		print self.alertconfig['max_threshold'], self.alertconfig['min_threshold']
		self.alertstate['state'] = 10


		myplot =  [{ 'name': 'Name 1',
		    'data': [ [1, 2], [2, 3] ] 
		    },

		    { 'name': 'Name 2',
		    'data': [ [1.5, 6], [4, 5] ] 
		    }]

		highchart = SubAlertBase.generateTimeSeriesChart(self, 
			title = "Chart Title", 
			subtitle = "My Subtitle" , 
			xtitle = "", 
			ytitle = "Power", 
			series = repr(myplot))

		myplot2 = [{
		    'name': 'Female',
            # 'color': 'rgba(119, 152, 191, .5)',
		    'data': [[161.2, 51.6], [167.5, 59.0], [159.5, 49.2], [157.0, 63.0], [155.8, 53.6],
            [170.0, 59.0], [159.1, 47.6], [166.0, 69.8], [176.2, 66.8], [160.2, 75.2],
            [172.5, 55.2], [170.9, 54.2], [172.9, 62.5], [153.4, 42.0], [160.0, 50.0],
            [147.2, 49.8], [168.2, 49.2], [175.0, 73.2], [157.0, 47.8], [167.6, 68.8],
            [159.5, 50.6], [175.0, 82.5], [166.8, 57.2], [176.5, 87.8], [170.2, 72.8],
            [174.0, 73.6], [162.6, 61.4], [174.0, 55.5], [162.6, 63.6], [161.3, 60.9],
            [156.2, 60.0], [149.9, 46.8], [169.5, 57.3], [160.0, 64.1], [175.3, 63.6],
            [169.5, 67.3], [160.0, 75.5], [172.7, 68.2], [162.6, 61.4], [157.5, 76.8],
            [176.5, 71.8], [164.4, 55.5], [160.7, 48.6], [174.0, 66.4], [163.8, 67.3]]
            }]

		highchart2 = SubAlertBase.generateScatterChart(self, 
			title = "Scatter Title", 
			subtitle = "My Subtitle" , 
			xtitle = "Height", 
			ytitle = "Weight", 
			series = repr(myplot2))

		SubAlertBase.reportAlertlog(self, "my title", "abdafdafd", 100, 200, highchart2)




		return 1



class ThresholdAlert(SubAlertBase):

# 	def taskSetup(self):
# 		self.task_id=7
# 		task=HourlyOptimizerTask.objects.get(id=self.task_id);
# 		#print task;
# 		#task=self.task
# 		self.target_unit=task.eu_target;
# 		self.monitor_config=self.target_unit.monitor_config;
# 		if self.monitor_config.overall_is_active!=True:
# 			raise AlertError("The building is not active")
# 		try:
# 			self.threshold=float(self.monitor_config.overall_threshold)
# 		except ValueError:
# 			raise AlertError("threshold is not set correctly");
# 		self.average=144;


	def checkSeries(self):
		curTime=datetime.now(pytz.timezone('Asia/Shanghai'))

		endTime=curTime.replace(hour=0,minute=0,second=0)
		startTime=curTime-relativedelta(hour=1)

		series_key = self.alert.energyunit.influxKey

		print self.alertconfig['threshold'], self.alertconfig['average']
		self.alertstate['state'] = 10

		#SubAlertBase.reportAlertlog(self, "my title", "abdafdafd", 100, 200, "")

		threshold = self.alertconfig['threshold']
		series_key = self.alert.energyunit.influxKey
		print series_key;
 		# Calculate the daily average use using the last two months;
 		trainingStart=(curTime-relativedelta(months=2)).replace(day=1,hour=0,minute=0,second=0);
 		trainingEnd=(curTime-relativedelta(months=1));
 		trainingEnd=trainingEnd.replace(day=calendar.monthrange(trainingEnd.year,trainingEnd.month)[1],minute=0,second=0);
 		startTime=curTime.replace(day=1,hour=0,minute=0,second=0);
 		trainingEnd=startTime;
 		endTime=curTime.replace(hour=0,minute=0,second=0);
 		opt=OptimizerBase();
 		trainingData=opt.get_series_data(series_list=[series_key],start_utc = calendar.timegm(trainingStart.utctimetuple()), end_utc = calendar.timegm(trainingEnd.utctimetuple()) )
 		if trainingData is None:
 			raise AlertError("no series data of this month is returned")
 		trainingpoints = trainingData[0]['points']
 		# let x= today, y= end of month, m= energy used/day, h=threshold (default 0.9)
# 		# The energy currently used should <= m(y-yh+xh)
 		trainingE=0;           # what is trainingE?
 		print("threshold_alert,trainingpoints:",trainingpoints)
 		trainingpoints=list(reversed(trainingpoints))
 		print("threshold_alert,trainingpoints:",trainingpoints)
 		for d in xrange(len(trainingpoints)):
 			if d>=len(trainingpoints)-1:
 				break;
 			e=trainingpoints[d][1]*(trainingpoints[d+1][0]-trainingpoints[d][0]);
 			trainingE+=e
 		trainingE/=3600 # convert to J
 		daydiff=trainingEnd-trainingStart;
 		daily_energy=trainingE/daydiff.days
 		print trainingE,daydiff.days;
 		print "daily average is ",daily_energy
 		datalist = opt.get_series_data(series_list=[series_key], start_utc = calendar.timegm(startTime.utctimetuple()), end_utc = calendar.timegm(curTime.utctimetuple()) )
 		if datalist is None:
 			raise AlertError("no series data of this month is returned")
 		datapoints = datalist[0]['points']
 		# let x= today, y= end of month, m= energy used/day, h=threshold (default 0.9)
 		# The energy currently used should <= m(y-yh+xh)
 		curEnergy=0;
 		datapoints=list(reversed(datapoints))
 		for d in xrange(len(datapoints)):
 			if d>=len(datapoints)-1:
 				break;
 			e=datapoints[d][1]*(datapoints[d+1][0]-datapoints[d][0]);
 			curEnergy+=e
 		#cur Energy is walt times sec
 		curEnergy/=3600; #J  now
 		y=calendar.monthrange(curTime.year,curTime.month)[1];
 		x=curTime.day;
 		print "currently used energy :"+str(curEnergy)+"J";
 		th=daily_energy*(y*(1-threshold)+threshold*(x-1))
 		print "threshold of alert: "+str(th)+"J";
 		if curEnergy > th:
 			#send alert
 			# maybe someway to check if the alert is already sent before?
 			print "over threshold"
 			print curEnergy;
 			print "looking for the user"
 			self.target_unit = self.alert.energyunit
 			campus=self.target_unit.campus;
 			print "user campus is ",campus.id
 			gref=GroupHasCampus.objects.filter(campus=campus);
 			groups=map(lambda x:x.userGroup,gref);
 			print "User group is ",groups

 			users=[];
 			for g in groups:
 				users+=g.user_set.all();
 			users=set(users);
 			print "User is ",users;
 			template=SmsTemplate.objects.get(aliid="SMS_8921376");
 			print "Template is ",template;
 			param={};
 			param["e"]=self.target_unit.name;
 			param["d"]=str(x);
 			param["p"]='%.2f' % (float(curEnergy-th)/th*100);
 			self.generateAlert(users,param,"Threshold Alert");	

# 			# signiture="";
# 			# tem_id="";
# 			# parameter={}
# 			# sendSMS(signiture, parameter,phone,tem_id)


		SubAlertBase.reportAlertlog(self, "my title", "abdafdafd", 100, 200, "")

		return 1


#	def checkSeries(self,series_key,daily_energy,threshold):
# 		curTime=datetime.now(pytz.timezone('Asia/Shanghai'));
# 		curTime=curTime.replace(year=2015);
# 		print series_key;
# 		# Calculate the daily average use using the last two months;
# 		trainingStart=(curTime-relativedelta(months=2)).replace(day=1,hour=0,minute=0,second=0);
# 		#trainingEnd=(curTime-relativedelta(months=1));
# 		#trainingEnd=trainingEnd.replace(day=calendar.monthrange(trainingEnd.year,trainingEnd.month)[1],minute=0,second=0);
# 		startTime=curTime.replace(day=1,hour=0,minute=0,second=0);
# 		trainingEnd=startTime;
# 		endTime=curTime.replace(hour=0,minute=0,second=0);
# 		opt=OptimizerBase();
# 		trainingData=opt.get_series_data(series_list=[series_key],start_utc = calendar.timegm(trainingStart.utctimetuple()), end_utc = calendar.timegm(trainingEnd.utctimetuple()) )
# 		if trainingData is None:
# 			raise AlertError("no series data of this month is returned")
# 		trainingpoints = trainingData[0]['points']
# 		# let x= today, y= end of month, m= energy used/day, h=threshold (default 0.9)
# 		# The energy currently used should <= m(y-yh+xh)
# 		trainingE=0;           # what is trainingE?
# 		trainingpoints=list(reversed(trainingpoints))
# 		for d in xrange(len(trainingpoints)):
# 			if d>=len(trainingpoints)-1:
# 				break;
# 			e=trainingpoints[d][2]*(trainingpoints[d+1][0]-trainingpoints[d][0]);
# 			trainingE+=e
# 		trainingE/=3600 # convert to J
# 		daydiff=trainingEnd-trainingStart;
# 		daily_energy=trainingE/daydiff.days
# 		print trainingE,daydiff.days;
# 		print "daily average is ",daily_energy
# 		datalist = opt.get_series_data(series_list=[series_key], start_utc = calendar.timegm(startTime.utctimetuple()), end_utc = calendar.timegm(curTime.utctimetuple()) )
# 		if datalist is None:
# 			raise AlertError("no series data of this month is returned")
# 		datapoints = datalist[0]['points']
# 		# let x= today, y= end of month, m= energy used/day, h=threshold (default 0.9)
# 		# The energy currently used should <= m(y-yh+xh)
# 		curEnergy=0;
# 		datapoints=list(reversed(datapoints))
# 		for d in xrange(len(datapoints)):
# 			if d>=len(datapoints)-1:
# 				break;
# 			e=datapoints[d][2]*(datapoints[d+1][0]-datapoints[d][0]);
# 			curEnergy+=e
# 		#cur Energy is walt times sec
# 		curEnergy/=3600; #J  now
# 		y=calendar.monthrange(curTime.year,curTime.month)[1];
# 		x=curTime.day;
# 		print "currently used energy :"+str(curEnergy)+"J";
# 		th=daily_energy*(y*(1-threshold)+threshold*(x-1))
# 		print "threshold of alert: "+str(th)+"J";
# 		if curEnergy > th:
# 			#send alert
# 			# maybe someway to check if the alert is already sent before?
# 			print "over threshold"
# 			print curEnergy;
# 			print "looking for the user"
# 			campus=self.target_unit.campus;
# 			print "user campus is ",campus.id
# 			gref=GroupHasCampus.objects.filter(campus=campus);
# 			groups=map(lambda x:x.userGroup,gref);
# 			print "User group is ",groups

# 			users=[];
# 			for g in groups:
# 				users+=g.user_set.all();
# 			users=set(users);
# 			print "User is ",users;
# 			template=SmsTemplate.objects.get(aliid="SMS_8921376");
# 			print "Template is ",template;
# 			param={};
# 			param["e"]=self.target_unit.name;
# 			param["d"]=str(x);
# 			param["p"]='%.2f' % (float(curEnergy-th)/th*100);
# 			self.generateAlert(users,param,"Over Threshold");	

# 			# signiture="";
# 			# tem_id="";
# 			# parameter={}
# 			# sendSMS(signiture, parameter,phone,tem_id)

# 		#def checkSeriesOfUser(user_id):
 	def generateAlert(self, users,param,alertType="Threshold Alert"):
 		alert_type=AlertType.objects.filter(name=alertType);
 		if len(alert_type)==0:
 			print "No alert type found"
 			return;
 		alert_type=alert_type[0];
 		print alert_type
 		template=alert_type.sms_template;
 		signiture=alert_type.sms_signiture;
 		email_subject=alert_type.email_subject;
 		email_content=alert_type.email_content;
 		#Check if there is an alert of this type
 		existing_alerts=Alert.objects.filter(alert_type=alert_type,energyunit=self.target_unit).order_by('last_notification_time');
 		latest_alert=None;
 		if len(existing_alerts)>0:
 			latest_alert=existing_alerts[0]
 		# there is timezone issue 
 		if latest_alert is None or (datetime.now()-latest_alert.last_notification_time.replace(tzinfo=None)).seconds>latest_alert.alert_type.waitingtime:
 			# the existing alert is too old. generate new one.
 			# create new alert
 			#new_alert=Alert(energyunit=self.target_unit,type=alert_type,last_sms_time=datetime.now(),last_email_time=datetime.now())
 			for u in users:	
 				param["u"]=u.username;
 				notify_user_sms(None,param,[u],template);
 				notify_user(email_subject,email_content,u);
 			#new_alert.save();

 		else:
 			print("last alert was generated within waiting time")




# 	def runTask(self):
# 		self.taskSetup();
# 		meter_key=None;
# 		if self.target_unit.type.name=="Building":
# 			if self.target_unit.invisible==True:
# 				#check the __total?
# 				print "the building has disag meters"	
# 			else:
# 				meters=EnergyUnit.objects.filter(parent=self.target_unit.id);
# 				if len(meters)>0:
# 					meter_key=meters[0].influxKey;
# 		elif self.target_unit.type.name=="Meter":# it is a meter
# 			meter_key=self.target_unit.influxKey;
# 		if meter_key is not None:
# 			self.checkSeries(meter_key,self.average,self.threshold);	

