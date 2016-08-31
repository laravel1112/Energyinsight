# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('optimizer', '0010_auto_20160131_0408'),
    ]

    operations = [
        migrations.AddField(
            model_name='dailyoptimizertask',
            name='disable_datafactory',
            field=models.BooleanField(default=True),
        ),
    ]
