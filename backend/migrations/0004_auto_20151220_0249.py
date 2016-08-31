# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('optimizer', '0006_hourlyoptimizertask'),
        ('backend', '0003_auto_20151220_0246'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='buildingparam',
            name='daily_optimizer_task',
        ),
        migrations.RemoveField(
            model_name='buildingparam',
            name='hourly_optimizer_task',
        ),
        migrations.AddField(
            model_name='energyunit',
            name='daily_optimizer_task',
            field=models.ForeignKey(default=None, blank=True, to='optimizer.DailyOptimizerTask', null=True),
        ),
        migrations.AddField(
            model_name='energyunit',
            name='hourly_optimizer_task',
            field=models.ForeignKey(default=None, blank=True, to='optimizer.HourlyOptimizerTask', null=True),
        ),
    ]
