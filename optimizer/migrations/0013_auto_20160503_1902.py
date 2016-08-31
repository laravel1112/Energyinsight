# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('optimizer', '0012_auto_20160503_1709'),
    ]

    operations = [
        migrations.RenameField(
            model_name='hourlyoptimizertask',
            old_name='tasy_type',
            new_name='task_type',
        ),
    ]
