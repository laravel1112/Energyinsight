# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('optimizer', '0014_remove_hourlyoptimizertask_eu_target'),
    ]

    operations = [
        migrations.AddField(
            model_name='recommendation',
            name='highchart_plot',
            field=models.TextField(null=True, blank=True),
        ),
    ]
