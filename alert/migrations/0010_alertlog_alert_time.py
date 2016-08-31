# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('alert', '0009_alert_run_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='alertlog',
            name='alert_time',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
    ]
