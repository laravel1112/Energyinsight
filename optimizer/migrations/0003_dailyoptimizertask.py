# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0001_initial'),
        ('optimizer', '0002_auto_20151122_0125'),
    ]

    operations = [
        migrations.CreateModel(
            name='DailyOptimizerTask',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('is_active', models.BooleanField(default=True)),
                ('last_scheduled_on', models.DateTimeField(null=True, blank=True)),
                ('lighting_enabled', models.BooleanField(default=True)),
                ('lighting_series_light', models.CharField(default=None, max_length=1024, null=True, blank=True)),
                ('hvac_enabled', models.BooleanField(default=True)),
                ('hvac_series_compressor', models.CharField(default=None, max_length=1024, null=True, blank=True)),
                ('hvac_series_pump_chiller', models.CharField(default=None, max_length=1024, null=True, blank=True)),
                ('hvac_series_pump_cooling', models.CharField(default=None, max_length=1024, null=True, blank=True)),
                ('hvac_series_temp', models.CharField(default=None, max_length=1024, null=True, blank=True)),
                ('eu_target', models.ForeignKey(blank=True, to='backend.EnergyUnit', null=True)),
                ('priority', models.ForeignKey(default=None, blank=True, to='optimizer.Priority', null=True)),
            ],
            options={
                'verbose_name_plural': 'Daily Optimizer Tasks',
            },
        ),
    ]
