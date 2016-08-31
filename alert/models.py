# -*- coding: utf-8 -*-
from django.db import models
from backend.models import EnergyUnit
from top.models import SmsTemplate, SmsSigniture
from tinymce import models as tinymce_models
from django.utils import timezone


class AlertStatus(models.Model):
    name = models.CharField(max_length=45, blank=True, null=True)

    def __unicode__(self):
        return "%s" % self.name


# Basic Alert Type
class AlertType(models.Model):
    name = models.CharField(max_length=45)
    waitingtime = models.IntegerField(blank=False, null=False)  # number of seconds.
    filename = models.CharField(max_length=256, blank=True, null=False)
    classname = models.CharField(max_length=256, blank=True, null=False)

    sms_template = models.ForeignKey(SmsTemplate, blank=True, null=True)
    sms_signiture = models.ForeignKey(SmsSigniture, blank=True, null=True)
    email_subject = models.CharField(max_length=128, blank=True, null=True)
    email_content = models.CharField(max_length=1024, blank=True, null=True)

    def __unicode__(self):
        return self.name


# Alert table, which is the main entries need to be looped every hour
class Alert(models.Model):
    is_active = models.BooleanField(default=True)
    energyunit = models.ForeignKey(EnergyUnit, blank=False)
    alert_type = models.ForeignKey(AlertType)

    last_notification_time = models.DateTimeField(auto_now=True, null=True)
    notification_count = models.IntegerField(blank=True, null=True)
    run_count = models.IntegerField(blank=True, null=True)

    alertconfig_json = models.TextField(blank=True, null=True)
    alertstate_json = models.TextField(blank=True, null=True)


# add alert log class  key to alert table and show content
class AlertLog(models.Model):
    alerttype = models.ForeignKey(AlertType, blank=False)
    alert = models.ForeignKey(Alert, blank=False)
    energyunit = models.ForeignKey(EnergyUnit, blank=False)

    title = models.CharField(max_length=128, blank=True, null=True)
    description = tinymce_models.HTMLField(max_length=100000, blank=True, null=True, default=None)

    saving_potential = models.CharField(max_length=254, blank=True, null=True, default=None)
    energy_saved = models.CharField(max_length=254, blank=True, null=True, default=None)

    alertstatus = models.ForeignKey(AlertStatus, blank=True)

    alert_time = models.DateTimeField(default=timezone.now, null=True)

    highchart_plot = models.TextField(blank=True, null=True)
