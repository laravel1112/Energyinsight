from django.db import models
from django.contrib.auth.models import User, Group
from django.db.models.signals import pre_save, post_save, pre_delete
from top.models import SmsTemplate, SmsSigniture
from common.models import ClientSettings
from common.notification import *
from django.core.exceptions import ValidationError


class UnitType(models.Model):
    name = models.CharField(max_length=45)

    def __unicode__(self):
        return self.name


class CampusParam(models.Model):
    description = models.TextField(blank=True, null=True)

    def __unicode__(self):
        return "%s" % self.id


class BuildingParam(models.Model):
    yearbuild = models.CharField(max_length=64, blank=True, null=True)
    address = models.CharField(max_length=512, blank=True, null=True)
    buildingarea = models.CharField(max_length=64, blank=True, null=True)
    employeenumber = models.CharField(max_length=64, blank=True, null=True)
    refrigerationunits = models.CharField(max_length=64, blank=True, null=True)
    cookingfacility = models.CharField(max_length=64, blank=True, null=True)
    numberofrooms = models.CharField(max_length=64, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    energysystemintro = models.TextField(blank=True, null=True)
    report = models.FileField(upload_to="reports/", blank=True, null=True, default=None)
    GPSlocation = models.CharField(max_length=45, blank=True, null=True)  # deprecated
    billingCycleStart = models.CharField(max_length=2, default="1")

    def __unicode__(self):
        return "%s" % self.id


class MeterParam(models.Model):
    manufacturer = models.CharField(max_length=512, blank=True, null=True)
    modelname = models.CharField(max_length=512, blank=True, null=True)
    samplerate = models.CharField(max_length=64, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __unicode__(self):
        return "%s" % self.id


class Category(models.Model):
    name = models.CharField(max_length=512, blank=True, null=True)

    # class Meta:
    #	verbose_name_plural="Categories"

    def __unicode__(self):
        return self.name


class EnergyUnit(models.Model):
    parent = models.ForeignKey("self", blank=True, null=True)
    name = models.CharField(max_length=45, default=None)
    value = models.CharField(max_length=45, blank=True, null=True)
    influxKey = models.CharField(max_length=1024, blank=True, null=True)
    eventseries = models.CharField(max_length=1024, blank=True, null=True)
    type = models.ForeignKey(UnitType, default=None)
    GPSlocation = models.CharField(max_length=45, blank=True, null=True)  # deprecated
    campus = models.ForeignKey("self", null=True, blank=True, related_name="camp",
                               limit_choices_to={'type__name': "Campus"})

    campusparam = models.OneToOneField(CampusParam, blank=True, null=True, on_delete=models.CASCADE)
    buildingparam = models.OneToOneField(BuildingParam, blank=True, null=True, on_delete=models.CASCADE)
    meterparam = models.OneToOneField(MeterParam, blank=True, null=True, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, blank=True, null=True)
    invisible = models.BooleanField(default=False)

    daily_optimizer_task = models.ForeignKey('optimizer.DailyOptimizerTask', blank=True, null=True, default=None)
    hourly_optimizer_task = models.ForeignKey('optimizer.HourlyOptimizerTask', blank=True, null=True, default=None)
    monitor_config = models.ForeignKey('optimizer.MonitoringConfig', blank=True, null=True, default=None)

    def save(self, *args, **kwargs):
        if (self.campusparam and self.buildingparam) or (self.campusparam and self.meterparam) \
                or (self.buildingparam and self.meterparam):
            pass
        super(EnergyUnit, self).save(*args, **kwargs)

    def __unicode__(self):
        display_name = self.name
        try:
            myparent = self.parent
            while myparent != None:
                display_name = myparent.name + " / " + display_name
                myparent = myparent.parent
        except:
            pass

        return "%s" % display_name


def energy_unit_post_save(sender, instance, created, **kwargs):
    if created:
        type = instance.type
        if type.name == "Building":
            building = BuildingParam.objects.create()
            building.save()
            instance.buildingparam = building

            # from optimizer.models import DailyOptimizerTask, HourlyOptimizerTask, MonitoringConfig
            # m_config = MonitoringConfig.objects.create()
            # m_config.save()
            # instance.monitor_config = m_config
            # new_daily_optimizer_task = DailyOptimizerTask.objects.create(eu_target_id=instance.pk)
            # new_daily_optimizer_task.save()
            # new_hourly_optimizer_task = HourlyOptimizerTask.objects.create(eu_target_id=instance.pk)
            # new_hourly_optimizer_task.save()

            # instance.daily_optimizer_task = new_daily_optimizer_task
            # instance.hourly_optimizer_task = new_hourly_optimizer_task

        if type.name == "Campus":
            campus = CampusParam.objects.create()
            campus.save()
            instance.campusparam = campus
        if type.name == "Meter":
            meter = MeterParam.objects.create()
            meter.save()
            instance.meterparam = meter
        # This energy unit should have same campus as its parent
        if instance.parent is not None:
            if instance.parent.campus is not None:
                instance.campus = instance.parent.campus

        # influxdb series key is automatically generated
        instance.influxKey = "TS" + "%s" % (instance.id)

        instance.save()


post_save.connect(energy_unit_post_save, sender=EnergyUnit)


def energy_unit_delete(sender, instance, **kwargs):
    try:
        instance.campusparam.delete()
    except:
        pass
    try:
        instance.buildingparam.delete()
    except:
        pass
    try:
        instance.meterparam.delete()
    except:
        pass
    try:
        instance.daily_optimizer_task.delete()
    except:
        pass
    try:
        instance.hourly_optimizer_task.delete()
    except:
        pass


pre_delete.connect(energy_unit_delete, sender=EnergyUnit)


class WeatherStation(models.Model):
    name = models.CharField(max_length=45, default=None)
    GPSlocation = models.CharField(max_length=45, default=None)
    url = models.CharField(max_length=45, default="ZSSS")
    unit = models.ForeignKey(EnergyUnit, related_name="unit", default=None)

    def __unicode__(self):
        return "%s" % self.name


class Segmentation(models.Model):
    name = models.CharField(max_length=45, blank=True, null=True)

    def __unicode__(self):
        return "%s" % self.name


class subSegment(models.Model):
    name = models.CharField(max_length=45, blank=True, default=None)
    parent = models.ForeignKey(Segmentation, related_name="parent")

    def __unicode__(self):
        return "%s" % self.name


class Appliance(models.Model):
    app_unit = models.ForeignKey(EnergyUnit, related_name="app_unit")
    outputSegment = models.ForeignKey(Segmentation, related_name="outputSegment")
    location = models.CharField(max_length=65, blank=True, null=True, default=None)
    subSegment = models.ForeignKey(subSegment, related_name="subSegment", blank=True, default=None, null=True)

    # outputSegment=models.CharField(max_length=45,default=None)
    name = models.CharField(max_length=45, default=None)

    def __unicode__(self):
        return "%s" % self.name


class GroupHasCampus(models.Model):
    userGroup = models.ForeignKey(Group, related_name='energyUnit')
    campus = models.ManyToManyField(EnergyUnit, related_name="energyUnit", default=None,
                                    limit_choices_to={'type__name': "Campus"})

    class Meta:
        verbose_name_plural = "GroupHasCampuses"

    def __unicode__(self):
        return "%s" % (self.userGroup)


class SmsLog(models.Model):
    user = models.ForeignKey(User, related_name='user', default=None)
    # msg=models.CharField(max_length=256,default=None)
    template = models.ForeignKey(SmsTemplate, related_name='template', default=None)
    signiture = models.ForeignKey(SmsSigniture, related_name='signiture', default=None)
    param = models.CharField(max_length=65, blank=True, null=True)

    def __unicode__(self):
        return "%s" % self.signiture.sign

    def clean(self):
        if self.id is None:  # not new instance
            client = ClientSettings.objects.get(user=self.user.id)
            phone = client.phone
            signiture = self.signiture.sign
            tem_id = self.template.aliid
            if phone is None or signiture is None or tem_id is None:
                raise ValidationError("empty fields")

    def save(self, *args, **kwargs):
        if self.id is None:  # not new instance
            client = ClientSettings.objects.get(user=self.user.id)
            phone = client.phone
            signiture = self.signiture.sign
            tem_id = self.template.aliid
            try:
                sendSMS(signiture, self.param, phone, tem_id)
            except Exception, e:
                raise ValidationError("data is incorrect")
            super(SmsLog, self).save(*args, **kwargs)
        else:
            super(SmsLog, self).save(*args, **kwargs)
