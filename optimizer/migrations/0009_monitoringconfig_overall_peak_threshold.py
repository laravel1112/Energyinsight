# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('optimizer', '0008_monitoringconfig'),
    ]

    operations = [
        migrations.AddField(
            model_name='monitoringconfig',
            name='overall_peak_threshold',
            field=models.TextField(null=True, blank=True),
        ),
    ]
