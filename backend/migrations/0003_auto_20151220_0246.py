# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('optimizer', '0006_hourlyoptimizertask'),
        ('backend', '0002_energyunit_invisible'),
    ]

    operations = [
        migrations.AddField(
            model_name='buildingparam',
            name='daily_optimizer_task',
            field=models.ForeignKey(default=None, blank=True, to='optimizer.DailyOptimizerTask', null=True),
        ),
        migrations.AddField(
            model_name='buildingparam',
            name='hourly_optimizer_task',
            field=models.ForeignKey(default=None, blank=True, to='optimizer.HourlyOptimizerTask', null=True),
        ),
    ]
