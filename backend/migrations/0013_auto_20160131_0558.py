# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('top', '__first__'),
        ('backend', '0012_energyunit_monitor_config'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='smslog',
            name='msg',
        ),
        migrations.AddField(
            model_name='smslog',
            name='param',
            field=models.CharField(max_length=65, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='smslog',
            name='signiture',
            field=models.ForeignKey(related_name='signiture', default=None, to='top.SmsSigniture'),
        ),
        migrations.AddField(
            model_name='smslog',
            name='template',
            field=models.ForeignKey(related_name='template', default=None, to='top.SmsTemplate'),
        ),
    ]
