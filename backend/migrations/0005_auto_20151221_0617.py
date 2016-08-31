# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0004_auto_20151220_0249'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='energyunit',
            name='daily_optimizer_task',
        ),
        migrations.RemoveField(
            model_name='energyunit',
            name='hourly_optimizer_task',
        ),
        migrations.AddField(
            model_name='buildingparam',
            name='report',
            field=models.FileField(default=None, null=True, upload_to=b'reports/', blank=True),
        ),
    ]
