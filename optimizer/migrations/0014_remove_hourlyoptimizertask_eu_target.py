# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('optimizer', '0013_auto_20160503_1902'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='hourlyoptimizertask',
            name='eu_target',
        ),
    ]
