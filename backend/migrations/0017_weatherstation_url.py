# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0016_auto_20160703_0615'),
    ]

    operations = [
        migrations.AddField(
            model_name='weatherstation',
            name='url',
            field=models.CharField(default="ZSSS", max_length=45),
        ),
    ]
