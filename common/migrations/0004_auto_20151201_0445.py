# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0003_blogpost'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='blogpost',
            name='big_image',
        ),
        migrations.RemoveField(
            model_name='blogpost',
            name='small_image',
        ),
    ]
