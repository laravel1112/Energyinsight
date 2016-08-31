# -*- coding: utf-8 -*-
from django.db import models
from backend.models import *
from django.db.models.signals import post_save
from djcelery.models import PeriodicTask, IntervalSchedule, CrontabSchedule
from datetime import datetime
import json
from celery.app.registry import TaskRegistry
from crequest.middleware import CrequestMiddleware
from tinymce import models as tinymce_models


class OptimizerType(models.Model):
	name = models.CharField(max_length=45)

	def __unicode__(self):
		return self.name


class Value(models.Model):
	time_value = models.IntegerField(blank=True, null=True)

	def __unicode__(self):
		return '%s' % self.time_value


class TimePeriod(models.Model):
	time_period = models.CharField(max_length=45, blank=True, null=True)

	def __unicode__(self):
		return '%s' % self.time_period


class Interval(models.Model):
	time_value = models.ForeignKey(Value, blank=True,null=True)
	time_period  = models.ForeignKey(TimePeriod, blank=True,null=True)

	def __unicode__(self):
		return '%s %s' %(self.time_value, self.time_period)


class Priority(models.Model):
	name = models.CharField(max_length=45)

	def __unicode__(self):
		return self.name


class OptimizerTask(models.Model):
	is_active = models.BooleanField(default=True)
	optimizertype = models.ForeignKey(OptimizerType, blank=False,null=False)
	eu_id = models.ForeignKey('backend.EnergyUnit', blank=True,null=True)
	config_json = models.TextField(blank=True, null=True)
	context_json = models.TextField(blank=True, null=True)
	priority = models.ForeignKey(Priority, blank=True,null=True, default=None)
	interval = models.ForeignKey(Interval, blank=True, null=True)
	crontab = models.ForeignKey(CrontabSchedule, blank=True, null=True)
	created = models.DateTimeField(auto_now_add=True, auto_now=False, null=True)
	last_scheduled_on = models.DateTimeField(blank=True, null=True)
	task = models.ForeignKey(PeriodicTask, blank=True, null=True)


	def schedule_every(self, task_name, period, every, crontab='',args=None, kwargs=None, queue=''):
		main_task = 'optimizer.tasks.base_task'
		permissible_periods = ['days', 'hours', 'minutes', 'seconds']

		# create the periodic task and the interval
		ptask_name = "%s_%s" % (task_name, datetime.datetime.now()) # create some name for the period task

		if period and every:
			if period not in permissible_periods:
				raise Exception('Invalid period specified')


			interval_schedules = IntervalSchedule.objects.filter(period=period, every=every)
			if interval_schedules: # just check if interval schedules exist like that already and reuse em
				interval_schedule = interval_schedules[0]
			else: # create a brand new interval schedule
				interval_schedule = IntervalSchedule()
				interval_schedule.every = every # should check to make sure this is a positive int
				interval_schedule.period = period
				interval_schedule.save()
			ptask = PeriodicTask(name=ptask_name, task=main_task, interval=interval_schedule)

		elif crontab:
			ptask = PeriodicTask(name=ptask_name, task=main_task, crontab=crontab)

		if args:
			ptask.args = args
		if kwargs:
			ptask.kwargs = kwargs
		ptask.queue = queue
		ptask.save()
		return ptask

	def update(self, task_name='test', period='', every='', crontab='', queue='', args=None, kwargs=None):
		pt = self.task
		permissible_periods = ['days', 'hours', 'minutes', 'seconds']

		ptask_name = "%s_%s" % (task_name, datetime.now())
		pt.name=ptask_name

		if period and every:
			if period not in permissible_periods:
				raise Exception('Invalid period specified')


			interval_schedules = IntervalSchedule.objects.filter(period=period, every=every)
			if interval_schedules: # just check if interval schedules exist like that already and reuse em
				interval_schedule = interval_schedules[0]
			else: # create a brand new interval schedule
				interval_schedule = IntervalSchedule()
				interval_schedule.every = every # should check to make sure this is a positive int
				interval_schedule.period = period
				interval_schedule.save()
			pt.interval=interval_schedule

		elif crontab:
			pt.crontab = crontab

		if args:
			pt.args = args
		if kwargs:
			pt.kwargs = kwargs
		pt.queue = queue
		pt.save(update_fields=['name', 'task', 'queue', 'interval', 'args', 'kwargs',])
		print(pt)

	def stop(self):
		"""pauses the task"""
		ptask = self.task
		ptask.enabled = False
		ptask.save()

	def start(self):
		ptask = self.task
		ptask.enabled = True
		ptask.save()

	def __unicode__(self):
		return str(self.id)

	def save(self, *args, **kwargs):
		if not self.last_scheduled_on and self.is_active and not self.task:
			#creating celery tasks
			a = 1
			time_value=''
			time_period=''
			task_official_name = 'test'
			optmizertask_id = self.id

			try:
				time_value = str(self.interval.time_value)
				time_period = str(self.interval.time_period)
			except:
				pass

			options_required = {}
			options_required['optmizertask_id'] = optmizertask_id
			options_required['task_name'] = 'run'
			options_required['file_name'] = 'daily_master.py'
			options_required=json.dumps(options_required)


			try:
				options_custom = self.context_json
				options_required = json.loads(options_required)
				options_custom = json.loads(options_custom)
				options = dict(options_required.items() + options_custom.items())
				options=json.dumps(options)
			except:
				options = options_required

			print (options)

			queue = str(self.priority)
			new_task = self.schedule_every(task_official_name, time_period, time_value, self.crontab, [], options, queue)
			self.task = new_task
			self.last_scheduled_on = datetime.datetime.now()

		elif self.is_active and self.last_scheduled_on:
			print('update')
			a = 1
			task_official_name = 'test'
			try:
				time_value = str(self.interval.time_value)
			except:
				time_value = ''
			try:
				time_period = ''
			except:
				time_period = str(self.interval.time_period)

			try:
				crontab = self.crontab
			except:
				crontab=''

			optmizertask_id = self.id

			options_required = {}
			options_required['optmizertask_id'] = optmizertask_id
			options_required['task_name'] = 'run'
			options_required['file_name'] = 'daily_master.py'
			options_required=json.dumps(options_required)

			try:
				options_custom = self.context_json
				options_required = json.loads(options_required)
				options_custom = json.loads(options_custom)
				options = dict(options_required.items() + options_custom.items())
				options=json.dumps(options)
			except:
				options = options_required

			arguments = [1] #test value
			task = self.task
			queue = str(self.priority)
			self.update(task_official_name, time_period, time_value, crontab, queue, arguments, options)
			self.last_scheduled_on = datetime.now()

		elif not self.is_active and self.last_scheduled_on:
			print('stop')
			self.stop()
			self.last_scheduled_on = None

		elif self.is_active and not self.last_scheduled_on:
			print('start')
			print(self.task)
			self.start()
			self.last_scheduled_on = datetime.datetime.now()

		super(OptimizerTask, self).save(*args, **kwargs)


class RecommendationCategory(models.Model):
	name = models.CharField(max_length=45)

	def __unicode__(self):
		return '%s' % self.name

	class Meta:
		verbose_name_plural="Recommendation Categories"


class RecommendationComplexity(models.Model):
	name = models.CharField(max_length=45)

	def __unicode__(self):
		return '%s' % self.name

	class Meta:
		verbose_name_plural="Recommendation Complexities"


class RecommendationPayback(models.Model):
	name = models.CharField(max_length=45)

	def __unicode__(self):
		return '%s' % self.name

	class Meta:
		verbose_name_plural="Recommendation PaybackTime"


class RecommendationStatus(models.Model):
	name = models.CharField(max_length=45)

	def __unicode__(self):
		return '%s' % self.name

	class Meta:
		verbose_name_plural="Recommendation Statuses"


class Recommendation(models.Model):
	title = models.TextField(max_length=256, blank=True, null=True, default=None)
	description = tinymce_models.HTMLField(max_length=100000, blank=True, null=True, default=None)
	saving_potential = models.CharField(max_length=254, blank=True, null=True, default=None)
	energy_saved = models.CharField(max_length=254, blank=True, null=True, default=None)
	category  = models.ForeignKey(RecommendationCategory, blank=True, null=True, default=None)
	sub_category = models.IntegerField(blank=True, null=True, default=0, verbose_name="sub-category")
	complexity = models.ForeignKey(RecommendationComplexity, blank=True, null=True, default=None)
	paybacktime = models.ForeignKey(RecommendationPayback, blank=True, null=True, default=None)
	status = models.ForeignKey(RecommendationStatus, blank=True, null=True, default=None)
	energy_unit = models.ForeignKey('backend.EnergyUnit', blank=True, null=True, default=None)
	date_of_creation = models.DateField(auto_now_add=True, auto_now=False, null=True)
	date_of_complete  = models.DateField(blank=True, null=True, default=None)
	date_of_completion = models.DateField(blank=True, null=True, default=None)
	comment=models.TextField(max_length=512,blank=True,null=True,default=None)

	highchart_plot = models.TextField(blank=True, null=True)
	
	def __unicode__(self):
		return '%s' % self.id

	class Meta:
		verbose_name_plural="Recommendations"

	def __init__(self, *args, **kwargs):
		super(Recommendation, self).__init__(*args, **kwargs)

		self._original_fields = {}
		self._original_fields['status'] = getattr(self, 'status')

	def save(self, *args, **kwargs):
		if self.id: #not new instance
			old = self._original_fields['status']
			new = getattr(self, 'status')
			comment=getattr(self,'comment')

			#checking if a new value is differnt from the old one
			if old != new:
				recommendation = self
				current_request = CrequestMiddleware.get_request()
				user = current_request.user
				print(user)
				print(recommendation)
				RecommendationStatusLog.objects.create(recommendation = recommendation,
													   old_status = old, new_status = new,
													   changed_by = user,comment=comment)
		super(Recommendation, self).save(*args, **kwargs)



class RecommendationStatusLog(models.Model):
	recommendation = models.ForeignKey(Recommendation, blank=True, null=True, default=None)
	old_status = models.ForeignKey(RecommendationStatus, blank=True, null=True, default=None, related_name="old_status")
	new_status = models.ForeignKey(RecommendationStatus, blank=True, null=True, default=None, related_name="new_status")
	changed_by = models.ForeignKey(User, blank=True, null=True, default=None)
	date_of_change = models.DateField(auto_now_add=True, auto_now=False, null=True)
	comment=models.TextField(max_length=512,blank=True,null=True,default=None)

	def __unicode__(self):
		return '%s' % self.id

	class Meta:
		verbose_name_plural="Recommendation Status Log"


class DailyOptimizerTask(models.Model):

	# common parameters
	is_active = models.BooleanField(default=True)
	priority = models.ForeignKey(Priority, blank=True,null=True, default=None)
	last_scheduled_on = models.DateTimeField(blank=True, null=True)
	eu_target = models.ForeignKey('backend.EnergyUnit', blank=True,null=True)
	disable_datafactory = models.BooleanField(default =True)
	# lighting parameters
	lighting_enabled = models.BooleanField(default=True)
	lighting_series_light = models.CharField(max_length=1024, blank=True, null=True, default=None)

	# hvac parameters
	hvac_enabled = models.BooleanField(default=True)
	hvac_series_compressor = models.CharField(max_length=1024, blank=True, null=True, default=None)
	hvac_series_pump_chiller = models.CharField(max_length=1024, blank=True, null=True, default=None)
	hvac_series_pump_cooling = models.CharField(max_length=1024, blank=True, null=True, default=None)
	hvac_series_temp = models.CharField(max_length=1024, blank=True, null=True, default=None)

	def __unicode__(self):
		return '%s' % self.id

	class Meta:
		verbose_name_plural="Daily Optimizer Tasks"

class TaskType(models.Model):
	name=models.CharField(max_length=256,blank=True,null=False);
	filename=models.CharField(max_length=256,blank=True,null=True);
	classname=models.CharField(max_length=256,blank=True,null=True);


class HourlyOptimizerTask(models.Model):

	# common parameters
	is_active = models.BooleanField(default=True)
	priority = models.ForeignKey(Priority, blank=True,null=True, default=None)
	last_scheduled_on = models.DateTimeField(blank=True, null=True)
	#eu_target = models.ForeignKey('backend.EnergyUnit', blank=True,null=True)
	task_type=models.ForeignKey(TaskType,blank=True,null=True,default=None);
	def __unicode__(self):
		return '%s' % self.id

	class Meta:
		verbose_name_plural="Hourly Optimizer Tasks"


class MonitoringConfig(models.Model):
	# overall 
	overall_is_active = models.BooleanField(default=True)
	overall_threshold = models.CharField(max_length=1024, blank=True, null=True)
	overall_peak_threshold = models.CharField(max_length=1024, blank=True, null=True)

	# peak load
	peak_is_active = models.BooleanField(default=True)
	peak_threshold = models.CharField(max_length=1024, blank=True, null=True)

	# hvac
	hvac_is_active = models.BooleanField(default=True)
	hvac_threshold = models.CharField(max_length=1024, blank=True, null=True)

	# lighting
	lighting_is_active = models.BooleanField(default=False)
	lighting_threshold = models.CharField(max_length=1024, blank=True, null=True)


