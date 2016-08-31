from backend.models import EnergyUnit
from celery.schedules import crontab
from celery.task import periodic_task
from celery import shared_task
from datetime import datetime, timedelta
from optimizer.models import OptimizerTask, DailyOptimizerTask, HourlyOptimizerTask
import importlib
from djcelery.models import PeriodicTask, IntervalSchedule, CrontabSchedule
from optimizer.scripts import daily_master, hourly_master
from common.notification import sending_email
from utils.weather_test import weather_uploading
from energyinsight.celery import app
from alert.models import *


# @periodic_task
# def task1(energy_unit):
#     print('low queue1')
#     new_test = Test.objects.create(name=energy_unit)
#     new_test.save()
#     print('low queue2')

#
# @task(run_every=timedelta(seconds = 5))
# def task1(a):
#     print('low queue1')
#     print (a)
#
#
# @periodic_task(run_every=timedelta(days = 1))
# def base_task(file_name=None, task_name=None, optimizer_id=None):
#     print(file_name)
#     print(task_name)
#     if task_name:
#         optmizertask_id = optimizer_id
#         file_name = "optimizer.scripts."+file_name
#         source = importlib.import_module(file_name)
#         result = getattr(source, task_name)
#         result(optmizertask_id)
#
#         print('end')
#
# @periodic_task(run_every=timedelta(minutes = 1))
# def checker_task():
#
#     #check if there is an active Optimizer Task, but inactive Periodic Task
#     print('check if there is active Optimizer Task, but not active Periodic Task')
#     periodic_tasks_id = [
#         task.id for task in PeriodicTask.objects.filter(enabled=False)
#     ]
#     problem_tasks = OptimizerTask.objects.filter(is_active=True, task_id__in=periodic_tasks_id)
#     print (problem_tasks)
#
#     #starting of the related Periodic task via method "start" of OptimizerTasks
#     for optimizer_task in problem_tasks:
#         optimizer_task.start()
#
#
#
#     #check if there is not active Optimizer Task, but an active Periodic Task
#     print('check if there is not active Optimizer Task, but active Periodic Task')
#     periodic_tasks_id = [
#         task for task in PeriodicTask.objects.filter(enabled=True)
#     ]
#     problem_tasks = OptimizerTask.objects.filter(is_active=False, task_id__in=periodic_tasks_id)
#     print (problem_tasks)
#
#     #stopping of the related Periodic task via method "stop" of OptimizerTasks
#     for optimizer_task in problem_tasks:
#         optimizer_task.stop()
#

# @periodic_task(run_every=timedelta(seconds = 20))
# @periodic_task(run_every=crontab(hour="01", minute="00"))
# def daily_optimizer_task_running():
#     print('daily_optimizer_task_running')
#     tasks = DailyOptimizerTask.objects.filter(is_active=True)
#     for task in tasks:
#         optmizertask_id = task.id
#         print('going to run daily task')
#         daily_master.run(task.id)
#         print('end5')
#     sending_email(subject="Daily Task", message="Hi! Daily task was executed successfully!")


#@periodic_task(run_every=timedelta(seconds = 20))
@periodic_task(run_every=crontab(minute="01"))
def hourly_optimizer_task_running():
    print('hourly alert tasks start....')

    alerts = Alert.objects.filter(is_active=True)
    for alert in alerts:

        toImp = "alert.subalerts"
        filename = alert.alert_type.filename;
        fromlist = alert.alert_type.classname;
        AlertClasses = __import__(str(toImp + "." + filename), globals(), locals(), [fromlist], -1)
        klass = getattr(AlertClasses, fromlist);
        task = klass(alert);
        task.runTask();

    print ('hourly alert tasks send....')




# @periodic_task(run_every=timedelta(seconds = 30))
# @periodic_task(run_every=crontab(minute="01"))
@periodic_task(run_every=crontab(hour="01", minute="00"))
def weather_update():
    print('weather update is started')
    weather_uploading()
    print ("weather update is finished")

# @periodic_task(run_every=timedelta(minutes = 1))
# def Test_datafactory():
#     print('Test_datafactory is started')
#     daily_master.run(16)

# @periodic_task(run_every=timedelta(seconds = 20))
# def scheduler():
#     task1.delay()
#     unscheduled_tasks = OptimizerTask.objects.filter(is_active=True, last_scheduled_on=None)
#     print (unscheduled_tasks)
#     task3.delay()
#     print('1')
#     for task in unscheduled_tasks:
#         # task1.delay({countdown=10, queue = 'low', run_every=timedelta(seconds = 5)})
#         # task3.delay()
#         task3.apply_async(args=[], kwargs={'countdown': '10'})
