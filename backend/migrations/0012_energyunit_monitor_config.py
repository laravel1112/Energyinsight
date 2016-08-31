# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('optimizer', '0010_auto_20160131_0408'),
        ('backend', '0011_smslog'),
    ]

    operations = [
        migrations.AddField(
            model_name='energyunit',
            name='monitor_config',
            field=models.ForeignKey(default=None, blank=True, to='optimizer.MonitoringConfig', null=True),
        ),
    ]
