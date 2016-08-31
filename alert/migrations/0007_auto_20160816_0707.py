# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('alert', '0006_auto_20160816_0653'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='alerttype',
            name='AlertScript',
        ),
        migrations.AddField(
            model_name='alerttype',
            name='classname',
            field=models.CharField(max_length=256, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='alerttype',
            name='filename',
            field=models.CharField(max_length=256, null=True, blank=True),
        ),
    ]
