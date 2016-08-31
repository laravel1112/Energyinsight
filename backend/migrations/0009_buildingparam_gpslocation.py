# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0008_auto_20151231_1701'),
    ]

    operations = [
        migrations.AddField(
            model_name='buildingparam',
            name='GPSlocation',
            field=models.CharField(max_length=45, null=True, blank=True),
        ),
    ]
