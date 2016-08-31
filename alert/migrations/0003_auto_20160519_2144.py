# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('alert', '0002_auto_20160519_2124'),
    ]

    operations = [
        migrations.AddField(
            model_name='alerttype',
            name='email_content',
            field=models.CharField(max_length=1024, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='alerttype',
            name='email_subject',
            field=models.CharField(max_length=128, null=True, blank=True),
        ),
    ]
