# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('optimizer', '0007_auto_20160105_0303'),
    ]

    operations = [
        migrations.CreateModel(
            name='MonitoringConfig',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('overall_is_active', models.BooleanField(default=False)),
                ('overall_threshold', models.TextField(null=True, blank=True)),
                ('peak_is_active', models.BooleanField(default=False)),
                ('peak_threshold', models.TextField(null=True, blank=True)),
                ('hvac_is_active', models.BooleanField(default=False)),
                ('hvac_threshold', models.TextField(null=True, blank=True)),
                ('lighting_is_active', models.BooleanField(default=False)),
                ('lighting_threshold', models.TextField(null=True, blank=True)),
            ],
        ),
    ]
