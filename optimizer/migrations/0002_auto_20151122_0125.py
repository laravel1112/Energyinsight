# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('optimizer', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='dailyoptimizertask',
            name='eu_target',
        ),
        migrations.RemoveField(
            model_name='dailyoptimizertask',
            name='priority',
        ),
        migrations.DeleteModel(
            name='DailyOptimizerTask',
        ),
    ]
