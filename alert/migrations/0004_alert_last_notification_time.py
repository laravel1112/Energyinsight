# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('alert', '0003_auto_20160519_2144'),
    ]

    operations = [
        migrations.AddField(
            model_name='alert',
            name='last_notification_time',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
    ]
