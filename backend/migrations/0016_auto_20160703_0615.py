# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0015_auto_20160703_0609'),
    ]

    operations = [
        migrations.AlterField(
            model_name='appliance',
            name='subSegment',
            field=models.ForeignKey(related_name='subSegment', default=None, blank=True, to='backend.subSegment', null=True),
        ),
    ]
