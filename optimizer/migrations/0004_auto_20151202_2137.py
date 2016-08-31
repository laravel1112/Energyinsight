# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('optimizer', '0003_dailyoptimizertask'),
    ]

    operations = [
        migrations.AddField(
            model_name='recommendation',
            name='comment',
            field=models.TextField(default=None, max_length=512, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='recommendationstatuslog',
            name='comment',
            field=models.TextField(default=None, max_length=512, null=True, blank=True),
        ),
    ]
