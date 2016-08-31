# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('top', '__first__'),
        ('alert', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='alerttype',
            name='sms_signiture',
            field=models.ForeignKey(blank=True, to='top.SmsSigniture', null=True),
        ),
        migrations.AddField(
            model_name='alerttype',
            name='sms_template',
            field=models.ForeignKey(blank=True, to='top.SmsTemplate', null=True),
        ),
    ]
