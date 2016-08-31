# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('alert', '0008_auto_20160816_0708'),
    ]

    operations = [
        migrations.AddField(
            model_name='alert',
            name='run_count',
            field=models.IntegerField(null=True, blank=True),
        ),
    ]
