# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_energyunit_invisible'),
        ('optimizer', '0005_auto_20151213_0436'),
    ]

    operations = [
        migrations.CreateModel(
            name='HourlyOptimizerTask',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('is_active', models.BooleanField(default=True)),
                ('last_scheduled_on', models.DateTimeField(null=True, blank=True)),
                ('eu_target', models.ForeignKey(blank=True, to='backend.EnergyUnit', null=True)),
                ('priority', models.ForeignKey(default=None, blank=True, to='optimizer.Priority', null=True)),
            ],
            options={
                'verbose_name_plural': 'Hourly Optimizer Tasks',
            },
        ),
    ]
