# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('alert', '0010_alertlog_alert_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='alertlog',
            name='alert_time',
            field=models.DateTimeField(default=django.utils.timezone.now, null=True),
        ),
    ]
