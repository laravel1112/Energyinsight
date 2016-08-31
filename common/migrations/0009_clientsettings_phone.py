# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0008_auto_20151219_1158'),
    ]

    operations = [
        migrations.AddField(
            model_name='clientsettings',
            name='phone',
            field=models.CharField(default=None, max_length=45, null=True, blank=True),
        ),
    ]
