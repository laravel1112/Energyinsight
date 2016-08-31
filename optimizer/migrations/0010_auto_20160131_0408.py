# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('optimizer', '0009_monitoringconfig_overall_peak_threshold'),
    ]

    operations = [
        migrations.AlterField(
            model_name='monitoringconfig',
            name='hvac_is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='monitoringconfig',
            name='hvac_threshold',
            field=models.CharField(max_length=1024, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='monitoringconfig',
            name='lighting_threshold',
            field=models.CharField(max_length=1024, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='monitoringconfig',
            name='overall_is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='monitoringconfig',
            name='overall_peak_threshold',
            field=models.CharField(max_length=1024, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='monitoringconfig',
            name='overall_threshold',
            field=models.CharField(max_length=1024, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='monitoringconfig',
            name='peak_is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='monitoringconfig',
            name='peak_threshold',
            field=models.CharField(max_length=1024, null=True, blank=True),
        ),
    ]
