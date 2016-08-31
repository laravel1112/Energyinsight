# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('alert', '0007_auto_20160816_0707'),
    ]

    operations = [
        migrations.AlterField(
            model_name='alerttype',
            name='classname',
            field=models.CharField(max_length=256, blank=True),
        ),
        migrations.AlterField(
            model_name='alerttype',
            name='filename',
            field=models.CharField(max_length=256, blank=True),
        ),
    ]
